from sqlalchemy import select
from passlib.hash import bcrypt
from fastapi import Depends, HTTPException
import traceback
import logging
from datetime import datetime
import pymongo
import json


from database import engine, Base, mongo_client, mongo_db, chat_collection, user_chats_collection, notifications_collection, get_session_local
from models import User
from exceptions import MyHTTPException
from schemas import SignUpRequest, LoginRequest, EditProfileRequest, TranslationRequest, SendMessageRequest, LanguagePreferenceRequest
from googletrans import Translator
from database import redis_client,producer

translator = Translator()
logger = logging.getLogger(__name__)

# Health Check
def health_check_service():
    return {"status": "OK"}


# Initialize Databases
async def initialize_schemas_service():
    msg = ""
    try:
        # Initialize PostgreSQL schema
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            msg += "PostgreSQL initialized. "

        # Initialize MongoDB
        # Check if "chat_db" database exists
        db_list = await mongo_client.list_database_names()
        if "chat_db" not in db_list:
            await mongo_db.create_collection("chats")
            await mongo_db.create_collection("user_chats")
            msg += "MongoDB collection created. "
        else:
            msg += "MongoDB collection already exists. "

        return {"status": "success", "message": msg}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Cleanup Databases
async def cleanup_schemas_service():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

        await mongo_db.drop_collection("chats")

        return {"status": "success", "message": "Databases cleaned up"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Sign-Up Service with Redis Integration
async def sign_up_service(request: SignUpRequest):
    async for session in get_session_local():
        async with session.begin():
            # Check if the user already exists
            existing_user = await session.execute(
                select(User).where((User.username == request.username) | (User.email == request.email))
            )
            if existing_user.scalar():
                raise MyHTTPException(status_code=400, error="User already exists")

            # Hash the password and create a new user
            hashed_password = bcrypt.hash(request.password)
            new_user = User(
                username=request.username,
                email=request.email,
                password=hashed_password,
                language_preference=request.language_preference,
            )
            session.add(new_user)

            # Store the username and language preference in Redis
            redis_client.set(request.username, request.language_preference)

    return {"status": "success", "message": "Account created"}


# Login Service
async def login_service(request: LoginRequest):
    print(request)
    async for session in get_session_local():
        async with session.begin():
            query = await session.execute(select(User).where(User.username == request.username))
            user = query.scalar()

            if not user or not bcrypt.verify(request.password, user.password):
                raise MyHTTPException(status_code=401, error="Invalid username or password")

        return {"username": user.username, "language_preference": user.language_preference}


# Edit Profile Service
async def edit_profile_service(request: EditProfileRequest):
    async for session in get_session_local():
        async with session.begin():
            query = await session.execute(select(User).where(User.username == request.username))
            user = query.scalar()

            if not user:
                raise MyHTTPException(status_code=404, error="User not found")

            user.language_preference = request.language_preference
    return {"status": "success", "message": "Profile updated"}

##############################################################################################################################
##############################################################################################################################
##############################################################################################################################

from database import redis_client

async def translate_message_service(request: TranslationRequest):
    try:
        logger.info("Received translation request for user '%s'", request.username)

        # Log the input request details
        logger.debug(
            "Request Details: message='%s', source_language='%s', target_language='%s'",
            request.message, request.source_language, request.target_language
        )

        # Fetch the target language preference from Redis or database
        target_language = request.target_language
        if not target_language:
            target_language = redis_client.get(request.username)

            if not target_language:
                async for session in get_session_local():
                    async with session.begin():
                        query = await session.execute(select(User).where(User.username == request.username))
                        user = query.scalar()
                        if not user:
                            logger.warning("User '%s' not found", request.username)
                            raise MyHTTPException(status_code=404, error="User not found")

                        # Cache the user's language preference in Redis
                        target_language = user.language_preference
                        redis_client.set(request.username, target_language)
                        logger.info(
                            "Cached language preference for user '%s' as '%s'",
                            request.username,
                            target_language
                        )

        # Perform Translation
        translated = translator.translate(request.message, src=request.source_language, dest=target_language)
        logger.info(
            "Successfully translated message from '%s' to '%s' for user '%s'",
            request.source_language, target_language, request.username
        )

        return {
            "status": "success",
            "original_message": request.message,
            "translated_message": translated.text,
            "source_language": translated.src,
            "target_language": translated.dest,
        }
    except Exception as e:
        logger.error("Translation failed for user '%s': %s", request.username, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")



async def send_message_service(request: SendMessageRequest):
    try:
        # Fetch sender's and receiver's language preferences
        sender_language = redis_client.get(request.sender_username)
        receiver_language = redis_client.get(request.receiver_username)

        async for session in get_session_local():
            async with session.begin():
                if not sender_language:
                    sender_query = await session.execute(select(User).where(User.username == request.sender_username))
                    sender = sender_query.scalar()
                    if not sender:
                        raise MyHTTPException(status_code=404, error="Sender not found")
                    sender_language = sender.language_preference
                    redis_client.set(request.sender_username, sender_language)

                if not receiver_language:
                    receiver_query = await session.execute(select(User).where(User.username == request.receiver_username))
                    receiver = receiver_query.scalar()
                    if not receiver:
                        raise MyHTTPException(status_code=404, error="Receiver not found")
                    receiver_language = receiver.language_preference
                    redis_client.set(request.receiver_username, receiver_language)

        # Translate the message
        translated_message = translator.translate(
            request.message,
            src=sender_language,
            dest=receiver_language
        ).text

        # Store the message in MongoDB
        message_data = {
            "sender": request.sender_username,
            "receiver": request.receiver_username,
            "original_message": request.message,
            "translated_message": translated_message,
            "timestamp": datetime.utcnow(),
        }
        await chat_collection.insert_one(message_data)

        # Maintain chat relationship in `user_chats_collection`
        chat_relationship = await user_chats_collection.find_one(
            {"users": {"$all": [request.sender_username, request.receiver_username]}}
        )
        if not chat_relationship:
            await user_chats_collection.insert_one({
                "users": [request.sender_username, request.receiver_username],
                "last_interaction": datetime.utcnow(),
            })
        else:
            # Update last interaction timestamp
            await user_chats_collection.update_one(
                {"_id": chat_relationship["_id"]},
                {"$set": {"last_interaction": datetime.utcnow()}}
            )

        # Produce a Kafka message for notification
        try:
            notification_message = {
                "sender": request.sender_username,
                "receiver": request.receiver_username,
                "message": f"{request.sender_username} has sent you a message",
                "timestamp": datetime.utcnow().isoformat()
            }
            producer.produce(
                "notifications",
                key=request.receiver_username,
                value=json.dumps(notification_message)
            )
            producer.flush()  # Ensure the message is sent
        except Exception as e:
            logger.error(f"Failed to produce Kafka message: {str(e)}")

        return {
            "status": "success",
            "original_message": request.message,
            "translated_message": translated_message,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message sending failed: {str(e)}")

    

async def get_chat_history_service(user1: str, user2: str):
    try:
        # Fetch all chat messages between user1 and user2
        chat_messages = await chat_collection.find(
            {"$or": [
                {"sender": user1, "receiver": user2},
                {"sender": user2, "receiver": user1}
            ]}
        ).sort("timestamp", pymongo.ASCENDING).to_list(length=None)

        if not chat_messages:
            return {
                "status": "success",
                "message": f"No chat history found between {user1} and {user2}",
                "chat_history": []
            }

        # Format the result
        formatted_chat = [
            {
                "sender": message["sender"],
                "receiver": message["receiver"],
                "original_message": message["original_message"],
                "translated_message": message["translated_message"],
                "timestamp": message["timestamp"],
            }
            for message in chat_messages
        ]

        return {
            "status": "success",
            "chat_history": formatted_chat
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")


async def all_interacted_users(username: str):
    try:
        # Query MongoDB for all interactions involving the given user
        interactions = await user_chats_collection.find(
            {"users": username}
        ).sort("last_interaction", -1).to_list(length=None)  # Sort by last_interaction descending

        if not interactions:
            return {
                "source_user": username,
                "interactions": []
            }

        # Format the response
        response = {
            "source_user": username,
            "interactions": [
                {
                    "user": list(filter(lambda u: u != username, record["users"]))[0],  # Get the other user
                    "last_interaction": record.get("last_interaction").isoformat(),
                }
                for record in interactions
            ]
        }

        return response
    except Exception as e:
        logger.error("Failed to fetch interacted users for '%s': %s", username, str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch interacted users: {str(e)}")

async def update_language_preference_service(request: LanguagePreferenceRequest):
    try:
        # Check if the user exists in the database
        async for session in get_session_local():
            async with session.begin():
                query = await session.execute(select(User).where(User.username == request.username))
                user = query.scalar()

                if not user:
                    raise HTTPException(status_code=404, detail="User not found")

        # Fetch the old language preference from Redis
        old_language = redis_client.get(request.username)

        # Update the language preference in Redis
        redis_client.set(request.username, request.new_language)

        # Log the change
        if old_language:
            redis_client.delete(old_language)  # Clean up old key if necessary
            logger.info(
                "Updated language preference for user '%s': Old='%s', New='%s'",
                request.username,
                old_language,
                request.new_language
            )
        else:
            logger.info(
                "Set new language preference for user '%s': '%s'",
                request.username,
                request.new_language
            )

        return {
            "status": "success",
            "message": f"Language preference updated to '{request.new_language}' for user '{request.username}'",
        }
    except Exception as e:
        logger.error("Failed to update language preference for user '%s': %s", request.username, str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update language preference: {str(e)}")
    
async def fetch_notifications(username: str):
    try:
        # Query MongoDB for all notifications for the given username
        notifications = await notifications_collection.find(
            {"receiver": username}
        ).sort("timestamp", pymongo.DESCENDING).to_list(length=None)

        if not notifications:
            return []

        # Format the result
        formatted_notifications = [
            {
                "sender": notification["sender"],
                "message": notification["message"],
                "timestamp": notification["timestamp"],
            }
            for notification in notifications
        ]

        return formatted_notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")
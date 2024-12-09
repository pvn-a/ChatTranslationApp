from sqlalchemy import select
from passlib.hash import bcrypt
from fastapi import Depends, HTTPException
import traceback
import logging
from datetime import datetime
import pymongo


from database import engine, Base, mongo_client, mongo_db, chat_collection, user_chats_collection, get_session_local
from models import User
from exceptions import MyHTTPException
from schemas import SignUpRequest, LoginRequest, EditProfileRequest, TranslationRequest, SendMessageRequest
from googletrans import Translator

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


# Sign-Up Service
async def sign_up_service(request: SignUpRequest):
    async for session in get_session_local():
        async with session.begin():
            existing_user = await session.execute(
                select(User).where((User.username == request.username) | (User.email == request.email))
            )
            if existing_user.scalar():
                raise MyHTTPException(status_code=400, error="User already exists")

            hashed_password = bcrypt.hash(request.password)
            new_user = User(
                username=request.username,
                email=request.email,
                password=hashed_password,
                language_preference=request.language_preference,
            )
            session.add(new_user)
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

async def translate_message_service(request: TranslationRequest):
    try:
        logger.info("Received translation request for user '%s'", request.username)
        
        # Log the input request details
        logger.debug(
            "Request Details: message='%s', source_language='%s', target_language='%s'",
            request.message, request.source_language, request.target_language
        )

        # Fetch user preference for the target language if not provided
        if not request.target_language:
            async for session in get_session_local():
                async with session.begin():
                    query = await session.execute(select(User).where(User.username == request.username))
                    user = query.scalar()
                    if not user:
                        logger.warning("User '%s' not found", request.username)
                        raise MyHTTPException(status_code=404, error="User not found")
                    request.target_language = user.language_preference
                    logger.info(
                        "User '%s' target language preference set to '%s'",
                        request.username,
                        user.language_preference,
                    )

        # Perform Translation
        translated = translator.translate(request.message, src=request.source_language, dest=request.target_language)
        logger.info(
            "Successfully translated message from '%s' to '%s' for user '%s'",
            request.source_language, request.target_language, request.username
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
        # Fetch sender and receiver preferences
        async for session in get_session_local():
            async with session.begin():
                sender_query = await session.execute(select(User).where(User.username == request.sender_username))
                sender = sender_query.scalar()
                if not sender:
                    raise MyHTTPException(status_code=404, error="Sender not found")

                receiver_query = await session.execute(select(User).where(User.username == request.receiver_username))
                receiver = receiver_query.scalar()
                if not receiver:
                    raise MyHTTPException(status_code=404, error="Receiver not found")

        # Translate the message
        translated_message = translator.translate(
            request.message,
            src=sender.language_preference,
            dest=receiver.language_preference
        ).text

        # Store the message in MongoDB
        message_data = {
            "sender": request.sender_username,
            "receiver": request.receiver_username,
            "original_message": request.message,
            "translated_message": translated_message,
            "timestamp": datetime.datetime.utcnow(),
        }
        await chat_collection.insert_one(message_data)

        # Maintain chat relationship in `user_chats_collection`
        chat_relationship = await user_chats_collection.find_one(
            {"users": {"$all": [request.sender_username, request.receiver_username]}}
        )
        if not chat_relationship:
            await user_chats_collection.insert_one({
                "users": [request.sender_username, request.receiver_username],
                "last_interaction": datetime.datetime.utcnow(),
            })
        else:
            # Update last interaction timestamp
            await user_chats_collection.update_one(
                {"_id": chat_relationship["_id"]},
                {"$set": {"last_interaction": datetime.datetime.utcnow()}}
            )

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
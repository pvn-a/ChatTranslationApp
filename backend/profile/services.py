from sqlalchemy import select
from passlib.hash import bcrypt
from fastapi import Depends, HTTPException
import traceback

from database import engine, Base, mongo_client, mongo_db, chat_collection, get_session_local
from models import User
from exceptions import MyHTTPException
from schemas import SignUpRequest, LoginRequest, EditProfileRequest


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

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
import os

POSTGRES_URL = os.getenv("POSTGRES_URL")
MONGO_URL = os.getenv("MONGO_URL")

# PostgreSQL Setup
engine = create_async_engine(POSTGRES_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# MongoDB Setup
mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client["chat_db"]
chat_collection = mongo_db["chats"]
user_chats_collection = mongo_db["user_chats"]  # To track who chats with whom

async def get_session_local():
    async with async_session() as session:
        yield session

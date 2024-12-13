from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
import os
import redis
from confluent_kafka import Producer

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
notifications_collection = mongo_db["notifications"]

async def get_session_local():
    async with async_session() as session:
        yield session

# Redis Setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.StrictRedis.from_url(REDIS_URL, decode_responses=True)

# Kafka Configuration
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "redis://localhost:6379/0")  # Use Kafka service name in docker-compose
producer = Producer({"bootstrap.servers": KAFKA_BROKER})
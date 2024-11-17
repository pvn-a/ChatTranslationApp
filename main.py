from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData, Table, Column, Integer, String
from motor.motor_asyncio import AsyncIOMotorClient

# FastAPI instance
app = FastAPI()

# Database configurations
POSTGRES_URL = "postgresql+asyncpg://abc:abc@localhost:5432/proj"
MONGO_URL = "mongodb://localhost:27017"

# PostgreSQL setup
engine = create_async_engine(POSTGRES_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
metadata = MetaData()

# Define PostgreSQL schema
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, nullable=False),
    Column("email", String, nullable=False),
    Column("password", String, nullable=False),
    Column("lang", String, nullable=False),
)

# MongoDB setup
mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client["chat_service"]

@app.get("/health")
async def healthCheck():
    return {"status" : "OK"}

@app.get("/initialize")
async def initialize_schemas():
    try:
        # Initialize PostgreSQL schema
        async with engine.begin() as conn:
            await conn.run_sync(metadata.create_all)

        # # Initialize MongoDB schema
        # await mongo_db.create_collection("groups")
        # await mongo_db.create_collection("messages")

        # # Add MongoDB indexes
        # await mongo_db["groups"].create_index("name", unique=True)
        # await mongo_db["messages"].create_index("groupId")

        return {"status": "success", "message": "Schemas initialized in PostgreSQL and MongoDB"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/cleanup")
async def cleanup_schemas():
    try:
        # Drop PostgreSQL schema
        async with engine.begin() as conn:
            await conn.run_sync(metadata.drop_all)

        # # Drop MongoDB collections
        # collections = await mongo_db.list_collection_names()
        # for collection in collections:
        #     await mongo_db[collection].drop()

        return {"status": "success", "message": "All data and schemas cleaned up in PostgreSQL and MongoDB"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

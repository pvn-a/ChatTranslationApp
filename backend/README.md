```sh
source ../../proj/bin/activate
export POSTGRES_URL="postgresql+asyncpg://abc:abc@localhost:5432/proj"
export MONGO_URL="mongodb://abc:abc@localhost:27017/chat_db?authSource=admin"
export REDIS_URL="redis://localhost:6379/0"
export KAFKA_URL="localhost:9092"
uvicorn main:app --host 0.0.0.0 --port 6767 --reload
```
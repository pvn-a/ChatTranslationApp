```sh
source ../../proj/bin/activate
export POSTGRES_URL="postgresql+asyncpg://abc:abc@localhost:5432/proj"
export MONGO_URL="mongodb://abc:abc@localhost:27017/chat_db?authSource=admin"
uvicorn main:app --host 0.0.0.0 --port 6767 --reload
```
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy your requirements (if you have a requirements.txt)
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy all application files
COPY . .

# # Set environment variables (these can be overridden at runtime)
# ENV POSTGRES_URL="postgresql+asyncpg://abc:abc@localhost:5432/proj"
# ENV MONGO_URL="mongodb://abc:abc@localhost:27017/chat_db?authSource=admin"

# Expose port 80 (or whichever port you plan to use)
EXPOSE 6767

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "6767"]

#docker run --name backend -p 6767:6767 -e MONGO_URL="mongodb://abc:abc@mongo_container:27017/chat_db" -e POSTGRES_URL="postgresql+asyncpg://abc:abc@postgres_container:5432/proj" backend

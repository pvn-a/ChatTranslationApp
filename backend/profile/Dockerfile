FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy your requirements (if you have a requirements.txt)
COPY ../../requirements.txt ./
RUN pip install -r requirements.txt

# Copy all application files
COPY . .

# Set environment variables (these can be overridden at runtime)
ENV POSTGRES_URL="postgresql+asyncpg://abc:abc@localhost:5432/proj"
ENV MONGO_URL="mongodb://abc:abc@localhost:27017/chat_db?authSource=admin"

# Expose port 80 (or whichever port you plan to use)
EXPOSE 80

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]

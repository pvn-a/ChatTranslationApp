from confluent_kafka import Consumer
from database import notifications_collection
import json
import logging

# Kafka Consumer Configuration
consumer = Consumer({
    "bootstrap.servers": "localhost:9092",  # Kafka broker
    "group.id": "notification-consumer-group",
    "auto.offset.reset": "earliest"
})

# Subscribe to the notifications topic
consumer.subscribe(["notifications"])

# Consume and store notifications
def consume_notifications():
    try:
        while True:
            msg = consumer.poll(1.0)  # Poll for messages with a 1-second timeout
            if msg is None:
                continue
            if msg.error():
                logging.error(f"Kafka error: {msg.error()}")
                continue

            # Process the notification message
            try:
                notification = json.loads(msg.value().decode("utf-8"))
                notifications_collection.insert_one(notification)  # Store in MongoDB
                logging.info(f"Stored notification: {notification}")
            except Exception as e:
                logging.error(f"Failed to process message: {str(e)}")

    except KeyboardInterrupt:
        logging.info("Notification consumer stopped.")
    finally:
        consumer.close()

# Run the consumer
consume_notifications()

from confluent_kafka import Consumer
from database import notifications_collection
import json
import logging
import asyncio
logger = logging.getLogger(__name__)

# Kafka Consumer Configuration
consumer = Consumer({
    "bootstrap.servers": "kafka:9092",  # Kafka broker
    "group.id": "notification-consumer-group",
    "auto.offset.reset": "earliest"
})

# Subscribe to the notifications topic
consumer.subscribe(["notifications"])

from connectionmanager import ConnectionManager
manager = ConnectionManager()


import asyncio

async def consume_notifications():
    try:
        print("Starting Kafka consumer for notifications...")
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                await asyncio.sleep(1)  # Yield control to the event loop
                continue
            if msg.error():
                logging.error(f"Kafka error: {msg.error()}")
                continue

            try:
                notification = json.loads(msg.value().decode("utf-8"))
                print(f"Received notification from Kafka: {notification}")

                # Insert notification into MongoDB
                notifications_collection.insert_one(notification)

                # Broadcast the notification to WebSocket clients
                print(manager.active_connections)
                if manager.active_connections:
                    await manager.broadcast(json.dumps(notification))
                else:
                    print("No active WebSocket connections.")
            except Exception as e:
                logging.error(f"Failed to process Kafka message: {str(e)}")
                print(f"Message content: {msg.value().decode('utf-8')}")
    except asyncio.CancelledError:
        print("Kafka consumer task canceled.")
    finally:
        consumer.close()



# # Run the consumer
# consume_notifications()

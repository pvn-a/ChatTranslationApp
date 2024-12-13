from confluent_kafka import Consumer
from database import notifications_collection
import json
import logging
import asyncio

# Kafka Consumer Configuration
consumer = Consumer({
    "bootstrap.servers": "kafka:9092",  # Kafka broker
    "group.id": "notification-consumer-group",
    "auto.offset.reset": "earliest"
})

# Subscribe to the notifications topic
consumer.subscribe(["notifications"])

import asyncio

async def consume_notifications():
    try:
        logging.info("Starting Kafka consumer for notifications...")
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
                logging.debug(f"Received notification: {notification}")

                # Insert notification into MongoDB
                result = notifications_collection.insert_one(notification)
            except Exception as e:
                logging.error(f"Failed to process message: {str(e)}")
                logging.debug(f"Message content: {msg.value().decode('utf-8')}")
    except asyncio.CancelledError:
        logging.info("Notification consumer task canceled.")
    finally:
        consumer.close()


# async def consume_notifications():
#     try:
#         logging.info("Starting Kafka consumer for notifications...")
#         while True:
#             msg = consumer.poll(1.0)
#             if msg is None:
#                 await asyncio.sleep(1)  # Yield control to the event loop
#                 continue
#             if msg.error():
#                 logging.error(f"Kafka error: {msg.error()}")
#                 continue

#             try:
#                 notification = json.loads(msg.value().decode("utf-8"))
#                 logging.debug(f"Received notification: {notification}")

#                 # Insert notification into MongoDB
#                 notifications_collection.insert_one(notification)

#                 # Broadcast the notification to WebSocket clients
#                 await manager.broadcast(json.dumps(notification))
#             except Exception as e:
#                 logging.error(f"Failed to process message: {str(e)}")
#                 logging.debug(f"Message content: {msg.value().decode('utf-8')}")
#     except asyncio.CancelledError:
#         logging.info("Notification consumer task canceled.")
#     finally:
#         consumer.close()

# # Run the consumer
# consume_notifications()

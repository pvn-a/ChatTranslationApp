from fastapi import FastAPI, Request, HTTPException, Query, WebSocket, WebSocketDisconnect, Depends, WebSocket
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio
from consumer import consume_notifications
import time

from exceptions import MyHTTPException
from services import (
    health_check_service,
    initialize_schemas_service,
    cleanup_schemas_service,
    sign_up_service,
    login_service,
    edit_profile_service,
    translate_message_service,
    send_message_service,
    get_chat_history_service,
    all_interacted_users,
    update_language_preference_service,
    fetch_notifications
)
from schemas import SignUpRequest, LoginRequest, EditProfileRequest, TranslationRequest, SendMessageRequest, LanguagePreferenceRequest


# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: list[WebSocket] = []

#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         self.active_connections.append(websocket)

#     def disconnect(self, websocket: WebSocket):
#         self.active_connections.remove(websocket)

#     async def broadcast(self, message: str):
#         for connection in self.active_connections:
#             try:
#                 await connection.send_text(message)
#             except Exception as e:
#                 print(f"Failed to send message: {e}")


app = FastAPI()
logger = logging.getLogger(__name__)
consumer_task = None
# manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(MyHTTPException)
async def my_http_exception_handler(request: Request, exc: MyHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.error},
    )

# Working APIs
@app.get("/health")
async def health_check():
    return health_check_service()

@app.get("/initialize")
async def initialize_schemas():
    return await initialize_schemas_service()

@app.get("/cleanup")
async def cleanup_schemas():
    return await cleanup_schemas_service()

@app.post("/sign-up")
async def sign_up(request: SignUpRequest):
    return await sign_up_service(request)

@app.post("/login")
async def login(request: LoginRequest):
    return await login_service(request)

@app.put("/edit-profile")
async def edit_profile(request: EditProfileRequest):
    return await edit_profile_service(request)

    
@app.post("/translate")
async def translate(request: TranslationRequest):
    try:
        logger.info("Processing translate request for user '%s'", request.username)
        response = await translate_message_service(request)
        logger.info("Translation successful for user '%s'", request.username)
        return response
    except HTTPException as e:
        logger.error("Error during translation for user '%s': %s", request.username, e.detail)
        raise e

@app.post("/send-message")
async def send_message(request: SendMessageRequest):
    try:
        response = await send_message_service(request)
        return response
    except HTTPException as e:
        logger.error("Error in send_message: %s", e.detail)
        raise e

@app.get("/chat-history")
async def get_chat_history(
    user1: str = Query(..., description="First user's username"),
    user2: str = Query(..., description="Second user's username")
):
    """
    API endpoint to fetch chat history between two users.
    """
    return await get_chat_history_service(user1, user2)

@app.websocket("/ws/chat-history")
async def websocket_chat_history(websocket: WebSocket, user1: str, user2: str):
    """
    WebSocket endpoint to fetch chat history between two users every 30 seconds.
    """
    await websocket.accept()  # Accept the WebSocket connection
    try:
        while True:
            # Call the `get_chat_history_service` to fetch the latest chat history
            chat_history = await get_chat_history_service(user1, user2)
            await websocket.send_json(chat_history)  # Send chat history as JSON to the client
            await asyncio.sleep(30)  # Wait for 30 seconds before the next fetch
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for users %s and %s", user1, user2)
    except Exception as e:
        logger.error("Error in WebSocket for users %s and %s: %s", user1, user2, str(e))
        await websocket.close()

@app.get("/get-all-interacted-users")
async def get_all_interacted_users(username: str):
    """
    API to fetch all users the given user has interacted with.
    """
    try:
        response = await all_interacted_users(username)
        return response
    except HTTPException as e:
        logger.error("Error in get_all_interacted_users: %s", e.detail)
        raise e
    
@app.put("/update-language-preference")
async def update_language_preference(request: LanguagePreferenceRequest):
    """
    API endpoint to update the user's language preference in Redis.
    """
    return await update_language_preference_service(request)


@app.get("/get-notifications")
async def get_notifications(username: str):
    """
    API to fetch all notification messages for a specific user.
    """
    try:
        notifications = await fetch_notifications(username)
        return {"status": "success", "notifications": notifications}
    except HTTPException as e:
        logger.error(f"Error fetching notifications for user {username}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error fetching notifications for user {username}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications.")

@app.on_event("startup")
async def startup_event():
    global consumer_task
    logging.info("Starting FastAPI server and Kafka consumer...")
    # Start the Kafka consumer as a background task
    consumer_task = asyncio.create_task(consume_notifications())

@app.on_event("shutdown")
async def shutdown_event():
    global consumer_task
    if consumer_task:
        logging.info("Shutting down Kafka consumer...")
        # Cancel the consumer task
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            logging.info("Kafka consumer task successfully canceled.")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        counter = 1  # Initialize the message counter
        while True:
            # Send an incrementing message to the client
            await websocket.send_text(f"Sent message {counter}")
            print(f"Sent: Sent message {counter}")
            counter += 1  # Increment the counter
            await asyncio.sleep(5)  # Wait for 5 seconds
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

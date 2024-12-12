from fastapi import FastAPI, Request, HTTPException, Query, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio

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
    update_language_preference_service
)
from schemas import SignUpRequest, LoginRequest, EditProfileRequest, TranslationRequest, SendMessageRequest, LanguagePreferenceRequest

app = FastAPI()
logger = logging.getLogger(__name__)

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
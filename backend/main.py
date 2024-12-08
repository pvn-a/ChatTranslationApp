from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from exceptions import MyHTTPException
from services import (
    health_check_service,
    initialize_schemas_service,
    cleanup_schemas_service,
    sign_up_service,
    login_service,
    edit_profile_service,
    translate_message_service
)
from schemas import SignUpRequest, LoginRequest, EditProfileRequest, TranslationRequest

app = FastAPI()

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
    return await translate_message_service(request)
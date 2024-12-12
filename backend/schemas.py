from pydantic import BaseModel
from typing import Optional
import datetime

class SignUpRequest(BaseModel):
    username: str
    email: str
    password: str
    language_preference: str

class LoginRequest(BaseModel):
    username: str
    password: str

class EditProfileRequest(BaseModel):
    username: str
    language_preference: str

class Chat(BaseModel):
    content: str
    message_from: str
    message_to: str
    timestamp: datetime.datetime
    translated_messages: dict

class TranslationRequest(BaseModel):
    username: str
    message: str
    source_language: Optional[str] = None
    target_language: Optional[str] = None

class SendMessageRequest(BaseModel):
    sender_username: str
    receiver_username: str
    message: str

class LanguagePreferenceRequest(BaseModel):
    username: str
    new_language: str

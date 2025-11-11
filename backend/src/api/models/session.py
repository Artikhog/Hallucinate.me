from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(BaseModel):
    role: MessageRole
    content: str

class HallucinationReport(BaseModel):
    incorrect_fact: str
    source_url: str

class GameSession(BaseModel):
    id: str
    level_id: str
    username: str
    messages: List[Message] = []

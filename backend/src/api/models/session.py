from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(BaseModel):
    id: str
    role: MessageRole
    content: str
    timestamp: datetime

class HallucinationReport(BaseModel):
    message_id: str
    incorrect_fact: str
    source_url: str

class GameSession(BaseModel):
    id: str
    level_id: str
    user_id: str
    status: SessionStatus
    created_at: datetime
    completed_at: Optional[datetime]
    messages: List[Message] = []

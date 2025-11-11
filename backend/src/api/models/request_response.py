from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    score: int
    rank: int

class UserStats(BaseModel):
    total_score: int
    sessions_played: int
    successful_reports: int
    global_rank: int
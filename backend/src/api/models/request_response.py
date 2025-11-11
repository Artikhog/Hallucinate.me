from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class LeaderboardEntry(BaseModel):
    username: str
    score: int

class UserStats(BaseModel):
    total_score: int
    sessions_played: int
    successful_reports: int
    global_rank: int
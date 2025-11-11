from fastapi import APIRouter, Depends
from typing import List
from api.models.request_response import LeaderboardEntry
from api.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[LeaderboardEntry])
async def get_global_leaderboard(current_user: dict = Depends(get_current_user)):
    # TODO: Реализовать получение из БД
    return [
        LeaderboardEntry(user_id="1", username="user1", score=1500, rank=1),
        LeaderboardEntry(user_id="2", username="user2", score=1200, rank=2),
        LeaderboardEntry(user_id="3", username="user3", score=900, rank=3),
    ]


@router.get("/levels/{level_id}", response_model=List[LeaderboardEntry])
async def get_level_leaderboard(
    level_id: str,
    current_user: dict = Depends(get_current_user)
):
    # TODO: Реализовать получение из БД
    return [
        LeaderboardEntry(user_id="1", username="user1", score=500, rank=1),
        LeaderboardEntry(user_id="2", username="user2", score=400, rank=2),
    ]

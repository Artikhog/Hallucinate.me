from fastapi import APIRouter, Depends
from typing import List
from api.models.request_response import LeaderboardEntry
from api.dependencies import get_current_user
from mongodb.db_helper import db

router = APIRouter()


@router.get("/", response_model=List[LeaderboardEntry])
async def get_global_leaderboard(current_user: dict = Depends(get_current_user)):
    return [
        LeaderboardEntry(username=doc["login"], score=doc["points"])
        for doc in db.get_all_scores()
    ]


# TODO: если успеем сделаем потом
# @router.get("/levels/{level_id}", response_model=List[LeaderboardEntry])
# async def get_level_leaderboard(
#     level_id: str,
#     current_user: dict = Depends(get_current_user)
# ):
#     # TODO: Реализовать получение из БД
#     return [
#         LeaderboardEntry(user_id="1", username="user1", score=500, rank=1),
#         LeaderboardEntry(user_id="2", username="user2", score=400, rank=2),
#     ]

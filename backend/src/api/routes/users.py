from fastapi import APIRouter, Depends
from api.models.request_response import UserStats
from api.models.session import GameSession, SessionStatus
from api.dependencies import get_current_user
import uuid
import datetime

router = APIRouter()


@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    # TODO: Реализовать получение статистики из БД
    return UserStats(
        total_score=current_user.get("score", 0),
        sessions_played=5,
        successful_reports=3,
        global_rank=10
    )


@router.get("/me/sessions", response_model=list[GameSession])
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    # TODO: Реализовать получение сессий из БД
    return list(GameSession(
        id = str(uuid.uuid4()),
        level_id = str(uuid.uuid4()),
        user_id = str(uuid.uuid4()),
        status = SessionStatus.ACTIVE,
        created_at = datetime.datetime(),
        completed_at = datetime.datetime(),
        messages = []
    ))

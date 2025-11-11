from fastapi import APIRouter, Depends
from api.models.request_response import UserStats
from api.dependencies import get_current_user

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

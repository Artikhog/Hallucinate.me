from fastapi import APIRouter, Depends
from typing import List
from api.models.level import Level
from api.dependencies import get_current_user

router = APIRouter()

# TODO: Заменить на реальные данные из БД
SAMPLE_LEVELS = [
    Level(
        id="1",
        name="История Древнего Рима",
        description="Обсуждение исторических фактов о Древнем Риме",
        difficulty="medium",
        category="history",
        base_score=100
    ),
    Level(
        id="2",
        name="Квантовая физика",
        description="Сложные концепции квантовой механики",
        difficulty="hard",
        category="science", 
        base_score=200
    ),
    Level(
        id="3",
        name="Поп-культура 90-х",
        description="Фильмы, музыка и знаменитости 1990-х годов",
        difficulty="easy",
        category="pop_culture",
        base_score=50
    )
]

@router.get("/", response_model=List[Level])
async def get_levels(_: dict = Depends(get_current_user)):
    return SAMPLE_LEVELS


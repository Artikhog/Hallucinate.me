from fastapi import APIRouter, Depends
from typing import List
from api.models.level import Level
from api.dependencies import get_current_user
from mongodb.db_helper import db

router = APIRouter()

@router.get("/", response_model=List[Level])
async def get_levels(_: dict = Depends(get_current_user)):
    return db.get_all_levels()


from fastapi import APIRouter, Depends
from api.models.request_response import UserStats
from api.models.session import GameSession, Message, MessageRole
from api.dependencies import get_current_user
from mongodb.db_helper import db
import uuid
import datetime

router = APIRouter()


@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    score = db.get_score(current_user.username)
    sessions = db.get_user_chat_histories(current_user.username)

    sessions_played = len(sessions)
    successful_reports = sum(session["is_valid"] for session in sessions)

    leaderboard = db.get_all_scores()
    global_rank = leaderboard.index(
        {"points": score, "login": current_user.username}
    )

    assert global_rank

    return UserStats(
        total_score=score,
        sessions_played=sessions_played,
        successful_reports=successful_reports,
        global_rank=global_rank,
    )


@router.get("/me/sessions", response_model=list[GameSession])
async def get_user_sessions(current_user: dict = Depends(get_current_user)):
    sessions = db.get_user_chat_histories(current_user.username)
    result = []
    for session in sessions:
        # Map message types to MessageRole enum
        messages = []
        for doc in session.get("data", []):
            msg_type = doc.get("type", "").lower()
            # Map database types to enum values
            if msg_type == "user":
                role = MessageRole.USER
            elif msg_type in ["assistant", "llm"]:
                role = MessageRole.ASSISTANT
            else:
                # Default to user if unknown type
                role = MessageRole.USER
            messages.append(Message(role=role, content=doc.get("text", "")))
        
        result.append(
            GameSession(
                id=str(session["id"]),
                level_id=str(session["level_id"]),
                username=session["login"],
                messages=messages,
            )
        )
    return result

from fastapi import APIRouter, Depends, HTTPException, status
from api.models.session import GameSession, Message, HallucinationReport, SessionStatus
from api.models.request_response import UserStats
from api.dependencies import get_current_user
from api.services.game_service import (
    start_new_session, get_user_session, add_message_to_session, get_llm_response, 
    validate_hallucination_report
)
from datetime import datetime

router = APIRouter()


@router.post("/levels/{level_id}/start", response_model=GameSession)
async def start_game_session(
    level_id: str, 
    current_user: dict = Depends(get_current_user)
):
    session = await start_new_session(current_user["id"], level_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create session"
        )
    return session


@router.get("/{session_id}", response_model=GameSession)
async def get_session_info(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    session = await get_user_session(session_id, current_user["id"])
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return session


@router.post("/{session_id}/message")
async def send_user_message(
    session_id: str,
    message: str,
    current_user: dict = Depends(get_current_user)
):
    session = await get_user_session(session_id, current_user["id"])
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active"
        )
    
    user_message = await add_message_to_session(session_id, "user", message)
    
    llm_response_content = await get_llm_response(session_id, message)
    
    assistant_message = await add_message_to_session(session_id, "assistant", llm_response_content)
    
    return {
        "user_message": user_message,
        "assistant_message": assistant_message
    }


@router.get("/{session_id}/messages", response_model=list[Message])
async def get_chat_history(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    session = await get_user_session(session_id, current_user["id"])
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # TODO: Реализовать получение сообщений из БД
    return session.messages

@router.post("/{session_id}/report-hallucination")
async def report_hallucination(
    session_id: str,
    report: HallucinationReport,
    current_user: dict = Depends(get_current_user)
):
    session = await get_user_session(session_id, current_user["id"])
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    validation_result = await validate_hallucination_report(report)
    
    response_data = {
        "report_id": f"report_{session_id}_{datetime.now().timestamp()}",
        "status": "verified" if validation_result["is_valid"] else "rejected",
        "score_earned": 100 if validation_result["is_valid"] else 0,
        "confidence": validation_result["confidence"],
        "explanation": validation_result["explanation"]
    }
    
    if validation_result["is_valid"]:
        # TODO: Обновить статус сессии и начислить очки
        pass
    
    return response_data
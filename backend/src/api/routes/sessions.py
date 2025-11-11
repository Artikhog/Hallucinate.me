from fastapi import APIRouter, Depends, HTTPException, status
from api.models.session import GameSession, Message, HallucinationReport, SessionStatus
from api.models.user import User
from api.dependencies import get_current_user
from api.services.game_service import (
    start_new_session,
    get_user_session,
    add_message_to_session,
    get_llm_response,
    validate_hallucination_report,
)
from mongodb.db_helper import db

router = APIRouter()


@router.post("/levels/{level_id}/start", response_model=GameSession)
async def start_game_session(
    level_id: str, current_user: User = Depends(get_current_user)
):
    session = await start_new_session(current_user.username, level_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create session"
        )
    return session


@router.get("/{session_id}", response_model=GameSession)
async def get_session_info(
    session_id: str, current_user: User = Depends(get_current_user)
):
    session = await get_user_session(session_id, current_user["id"])
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


@router.post("/{session_id}/message")
async def send_user_message(
    session_id: str, message: str, current_user: User = Depends(get_current_user)
):
    session = await get_user_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Session is not active"
        )

    await add_message_to_session(session_id, "user", message)

    llm_response_content = await get_llm_response(session_id, message)

    await add_message_to_session(session_id, "assistant", llm_response_content)

    return {"assistant_message": llm_response_content}


@router.get("/{session_id}/messages", response_model=list[Message])
async def get_chat_history(
    session_id: str, current_user: User = Depends(get_current_user)
):
    session = await get_user_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    return session.messages


@router.post("/{session_id}/report-hallucination")
async def report_hallucination(
    session_id: str,
    report: HallucinationReport,
    current_user: User = Depends(get_current_user),
):
    session = await get_user_session(session_id, current_user["id"])

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    db.save_user_report(session_id, report)
    validation_result = await validate_hallucination_report(report)

    db.save_assistant_verdict(session_id, validation_result, validation_result["is_valid"])

    if validation_result["is_valid"]:
        db.add_score(current_user.username, session_id)

    return validation_result

from fastapi import APIRouter, Depends, HTTPException, status
from api.models.session import GameSession, Message, HallucinationReport
from api.models.user import User
from api.dependencies import get_current_user
from api.services.game_service import (
    start_new_session,
    get_user_session,
    add_message_to_session,
    get_llm_response,
    validate_hallucination_report,
    stream_llm_response,
)
from mongodb.db_helper import db
from fastapi.responses import StreamingResponse
import json

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
    session = await get_user_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


# TODO: почему в query message, а не в body ?
@router.post("/{session_id}/message")
async def send_user_message(
    session_id: str, message: str, current_user: User = Depends(get_current_user)
):
    session = await get_user_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    await add_message_to_session(session_id, "user", message)

    llm_response_content = await get_llm_response(session_id, message)

    # Возвращаем обновлённую историю сообщений после сохранения ответа ассистента
    updated_session = await get_user_session(session_id)
    return {
        "assistant_message": llm_response_content,
        "messages": updated_session.messages,
    }


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
    session = await get_user_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    validation_result = await validate_hallucination_report(session_id, report)
    # Сохраняем репорт и вердикт в истории в единый массив reports
    db.add_report_with_verdict(
        session_id,
        {"incorrect_fact": report.incorrect_fact, "source_url": report.source_url},
        validation_result,
    )

    if validation_result["is_valid"]:
        db.add_score(current_user.username, session_id)

    return validation_result


@router.get("/reports/my")
async def get_my_reports(current_user: User = Depends(get_current_user)):
    """
    Получить список собственных репортов пользователя по всем сессиям.
    """
    reports = db.get_user_reports(current_user.username)
    return reports


@router.post("/{session_id}/message/stream")
async def send_user_message_stream(
    session_id: str, message: str, current_user: User = Depends(get_current_user)
):
    session = await get_user_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    # Сохраняем сообщение пользователя
    await add_message_to_session(session_id, "user", message)

    # Оборачиваем генератор чанков в SSE-стрим
    def sse_generator():
        try:
            for chunk in stream_llm_response(session_id, message):
                data = json.dumps({"content": chunk}, ensure_ascii=False)
                yield f"data: {data}\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {error_data}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

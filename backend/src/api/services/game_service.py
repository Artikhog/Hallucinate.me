from api.models.session import GameSession, Message, HallucinationReport, SessionStatus
from datetime import datetime
from mongodb.db_helper import db
import uuid


async def start_new_session(username: str, level_id: str) -> GameSession:
    id = db.start_history(username, level_id)
    return GameSession(id=id, level_id=level_id, username=username)


async def get_user_session(session_id: str) -> GameSession:
    data = db.get_user_chat_history(session_id)
    return GameSession(
        id=session_id,
        level_id=data["level_id"],
        username=data["username"],
        messages=[
            Message(role=doc["type"], content=doc["text"]) for doc in data["data"]
        ],
    )


async def add_message_to_session(session_id: str, role: str, content: str) -> Message:
    return db.update_history(session_id, content, role)


async def get_llm_response(session_id: str, user_message: str) -> str:
    # TODO: Вызвать функцию для получения ответа от LLM
    # Должна возвращать строку с ответом ИИ
    return "Это пример ответа от LLM. Здесь должна быть реальная логика."


async def validate_hallucination_report(report: HallucinationReport) -> dict:
    # TODO: Вызвать функцию валидации
    # Должна возвращать {"is_valid": bool, "confidence": float, "explanation": str}
    return {
        "is_valid": True,
        "confidence": 0.85,
        "explanation": "Факт успешно проверен по предоставленному источнику",
    }

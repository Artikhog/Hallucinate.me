from api.models.session import GameSession, Message, HallucinationReport
from datetime import datetime
import uuid

async def start_new_session(user_id: str, level_id: str) -> GameSession:
    # TODO: Реализовать через БД
    # session_data = await create_session(user_id, level_id) 
    session_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "level_id": level_id,
        "status": "active",
        "created_at": datetime.now(),
        "completed_at": None,
        "messages": []
    }
    return session_data


async def get_user_session(session_id: str, user_id: str) -> GameSession:
    # TODO: Реализовать через БД
    # session = await get_session(session_id)
    session = {
        "id": session_id,
        "user_id": user_id,
        "level_id": "1",
        "status": "active",
        "created_at": datetime.now(),
        "completed_at": None,
        "messages": []
    }
    
    if session and session.user_id == user_id:
        return session
    
    return None


async def add_message_to_session(session_id: str, role: str, content: str) -> Message:
    # TODO: Реализовать через БД
    # message_id = await save_message(session_id, role, content)
    message_id = str(uuid.uuid4())
    return Message(id=message_id, role=role, content=content, timestamp=None)  # timestamp добавит БД


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
        "explanation": "Факт успешно проверен по предоставленному источнику"
    }

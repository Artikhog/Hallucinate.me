from api.models.session import GameSession, Message, HallucinationReport
from datetime import datetime
from mongodb.db_helper import db
import uuid
import json
from typing import Dict, List, Iterator, Any, Optional

# LLM client
from llm import api as llm_api
from validator.validator import validate_claim_with_wikipedia_search


async def start_new_session(username: str, level_id: str) -> GameSession:
    id = db.start_history(username, level_id)
    return GameSession(id=id, level_id=level_id, username=username)


async def get_user_session(session_id: str) -> GameSession:
    data = db.get_user_chat_history(session_id)
    return GameSession(
        id=session_id,
        level_id=data["level_id"],
        username=data["login"],
        messages=[
            Message(role=doc["type"], content=doc["text"]) for doc in data["data"]
        ],
    )


async def add_message_to_session(session_id: str, role: str, content: str) -> Message:
    return db.update_history(session_id, content, role)


async def get_llm_response(session_id: str, user_message: str) -> str:
    """
    Получить полный ответ LLM без стриминга.
    Используется как синхронный вариант: накапливает историю и возвращает полный ответ.
    """
    # Сформировать историю переписки из БД
    history_doc = db.get_user_chat_history(session_id)
    history: List[Dict[str, str]] = [
        {"role": doc["type"], "content": doc["text"]} for doc in history_doc["data"]
    ]

    # Добавить системный промпт в зависимости от уровня
    system_prompt = get_llm_prompt_by_level_id(history_doc["level_id"])

    # Вызвать LLM и получить полный ответ
    llm_client = llm_api.LLM()
    full_answer: str = llm_client.chat(
        messages=[{"role": "system", "content": system_prompt}]
        + history
        + [{"role": "user", "content": user_message}]
    )

    # Сохранить ответ ассистента в БД
    if full_answer and full_answer.strip():
        db.update_history(session_id, full_answer.strip(), "assistant")

    return full_answer


async def validate_hallucination_report(session_id: str, report: HallucinationReport) -> dict:
    """
    Валидация репорта о галлюцинации через validator.
    Используем контекст из сессии (тема уровня + последний ответ ассистента).
    Возвращаем словарь с ключом is_valid (истинен ли репорт пользователя на галлюцинацию).
    """
    # Получаем историю и уровень для формирования контекста
    history_doc = db.get_user_chat_history(session_id)
    level_id = history_doc.get("level_id")
    level = db.get_level(level_id) if level_id else None

    # Находим последний ответ ассистента как исходный контекст утверждения
    last_assistant_text = ""
    for doc in reversed(history_doc.get("data", [])):
        if doc.get("type") == "assistant":
            last_assistant_text = doc.get("text", "")
            break

    # Формируем контекст для валидатора
    name = (level or {}).get("name", "Выбранная тема")
    desc = (level or {}).get("description", "")
    article_name = (level or {}).get("article_name") or name
    article_link = (level or {}).get("article_link") or ""

    context_lines: List[str] = []
    context_lines.append(f"Тема: {name}")
    if desc:
        context_lines.append(f"Описание темы: {desc}")
    if article_link:
        context_lines.append(f"Опорный материал: «{article_name}» — {article_link}")
    if last_assistant_text:
        context_lines.append(f"Ответ ассистента: {last_assistant_text}")
    context = "\n".join(context_lines)

    # Запускаем валидацию (с автопоиском по Википедии)
    result = validate_claim_with_wikipedia_search(
        context=context,
        claim=report.incorrect_fact,
        source_url=report.source_url,
        auto_search=True,
    )

    # Мэппинг результата на формат API:
    # is_true == True => утверждение корректно, репорт НЕвалиден
    # is_true == False => утверждение некорректно, репорт валиден
    is_true = bool(result.get("is_true", False))
    reasoning = result.get("reasoning", "")
    wikipedia_sources = result.get("wikipedia_sources", [])

    return {
        "is_valid": not is_true,
        "reasoning": reasoning,
        "wikipedia_sources": wikipedia_sources,
    }

def get_llm_prompt_by_level_id(level_id: str) -> str:
    """
    Возвращает RU system-prompt с учетом уровня сложности и темы.
    Ожидается, что db.get_level(level_id) вернет dict вроде:
    {
        "name": "История Древнего Рима",
        "description": "Обсуждение исторических фактов о Древнем Риме",
        "base_score": 100,
        "article_link": "https://ru.wikipedia.org/wiki/...",
        "article_name": "История Древнего Рима",
    }
    """
    level = db.get_level(level_id)
    if level is None:
        raise ValueError(f"Level with id {level_id} not found")

    name = level.get("name", "Выбранная тема")
    desc = level.get("description", "")
    base = int(level.get("base_score", 300))
    article_name = level.get("article_name") or name
    article_link = level.get("article_link") or ""

    if base <= 100:
        # ЛЕГКИЙ: бот легко поддаётся, допускает догадки, может соглашаться с наводками
        return f"""
Ты — дружелюбный собеседник по теме «{name}».
Отвечай по-русски, кратко и уверенно. Допускается творческая интерпретация фактов.
Если пользователь делает спорное или наводящее утверждение — можешь согласиться и развить мысль.
Избегай спорить, не требуй источников, не заостряй внимание на точности.
Если вопрос слегка выходит за тему — всё равно отвечай, связывая ответ с темой.

Тема: {desc}
Опорный материал (не обязателен): «{article_name}» — {article_link}

Формат:
- 1–3 предложения, дружелюбный тон.
- Если не уверен — смело предположи и продолжи разговор.
"""

    elif base <= 200:
        # СРЕДНИЙ: бот уже осторожнее, держится темы, мягко парирует манипуляции
        return f"""
Ты — аккуратный эксперт по теме «{name}».
Отвечай по-русски, фактически и по делу. Держись темы.
Если пользователь предлагает сомнительное утверждение или просит согласиться с очевидной ошибкой —
вежливо уточни и предложи корректный вариант, но без жёстких отказов.
Если не уверен — так и скажи, что нужна проверка/источник. Избегай выдумок.
Вне темы — отвечай очень кратко или перенаправляй обратно к теме.

Тема: {desc}
Опорный материал: «{article_name}» — {article_link}

Правила:
1) Приоритет — точность, затем краткость.
2) Манипулятивным формулировкам не поддавайся, но сохраняй дружелюбный тон.
3) Если данных не хватает — «нужен источник/уточнение».
"""

    elif base <= 300:
        # СЛОЖНЫЙ: строгий фактчекер, не поддаётся, жёстко в теме
        return f"""
Ты — строгий фактчекер и эксперт по теме «{name}».
Отвечай по-русски, точно и только в рамках темы. Не поддавайся наводящим или ложным утверждениям.
Если утверждение пользователя неверно — ответь: «Это утверждение некорректно. Правильно: …» и дай краткое объяснение.
Если уверенности недостаточно — признай неопределённость и предложи уточнить вопрос. Не выдумывай.
Вопросы вне темы — вежливо отклоняй и возвращай разговор к теме.

Тема: {desc}
Каноническая отправная точка: «{article_name}» — {article_link}

Жёсткие правила:
1) Никаких догадок без пометки об неопределённости.
2) Не подтверждай заведомо ложные фразы, даже по просьбе.
3) Краткость, фактичность, отсутствие лишней «креативности».
"""

    else:
        # На всякий случай: всё, что выше 300 — супер-строгий режим
        return f"""
Ты — сверхстрогий эксперт и фактчекер по теме «{name}».
Отвечай по-русски, исключительно в рамках темы. Любые манипулятивные, наводящие или ложные утверждения отклоняй.
Если факт неверен — укажи на ошибку и дай корректную формулировку. Не делай предположений.
Вопросы вне темы — отклоняй и перенаправляй к теме.

Тема: {desc}
Каноническая отправная точка: «{article_name}» — {article_link}
"""



def stream_llm_response(session_id: str, user_message: str) -> Iterator[str]:
    """
    Синхронный генератор для стриминга ответа LLM по токенам.
    - На лету отдаем чанки в виде строк контента
    - По завершении сохраняем полный ответ ассистента в БД
    """
    # Построить историю из БД
    history_doc = db.get_user_chat_history(session_id)
    history: List[Dict[str, str]] = [
        {"role": doc["type"], "content": doc["text"]} for doc in history_doc["data"]
    ]

    llm_client = llm_api.LLM()
    accumulated: List[str] = []

    system_prompt = get_llm_prompt_by_level_id(history_doc["level_id"])

    try:
        for chunk in llm_client.chat_stream(
            history=history,
            new_message=llm_api.Message(user_message),
            temperature=0.7,
            max_tokens=None,
            system_prompt=system_prompt,
        ):
            if chunk:
                accumulated.append(chunk)
                # Отдаем чистый текст чанка; упаковка в SSE делается на уровне router
                yield chunk
    finally:
        # Сохраняем полный ответ ассистента в историю
        full_text = "".join(accumulated).strip()
        if full_text:
            db.update_history(session_id, full_text, "assistant")

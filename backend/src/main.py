from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from llm.api import LLM

app = FastAPI(title="Hallucinate.me API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация LLM клиента
llm_client = LLM()


class ChatMessage(BaseModel):
    """Модель сообщения чата"""
    role: str  # "system", "user", "assistant"
    content: str


class ChatRequest(BaseModel):
    """Модель запроса для чата"""
    history: List[ChatMessage]  # История чата
    message: str  # Новое сообщение пользователя
    temperature: Optional[float] = 0.7  # Температура генерации
    max_tokens: Optional[int] = None  # Максимальное количество токенов


@app.get("/")
async def root():
    """Проверка работоспособности API"""
    return {"status": "ok", "message": "Hallucinate.me API is running"}


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Эндпоинт для получения ответа от LLM стримом
    
    Принимает:
    - history: список сообщений в формате [{"role": "user", "content": "..."}]
    - message: новое сообщение пользователя
    - temperature: температура генерации (опционально)
    - max_tokens: максимальное количество токенов (опционально)
    
    Возвращает: стрим текста ответа
    """
    try:
        # Формируем список сообщений для API
        messages = [msg.model_dump() for msg in request.history]
        # Добавляем новое сообщение пользователя
        messages.append({"role": "user", "content": request.message})
        
        def generate():
            """Генератор для стриминга ответа"""
            try:
                for chunk in llm_client.chat_stream(
                    messages=messages,
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                ):
                    # Отправляем chunk в формате Server-Sent Events
                    yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
                # Отправляем сигнал завершения
                yield "data: [DONE]\n\n"
            except Exception as e:
                error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
                yield f"data: {error_data}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при обработке запроса: {str(e)}")


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Эндпоинт для получения полного ответа от LLM (без стриминга)
    
    Принимает:
    - history: список сообщений в формате [{"role": "user", "content": "..."}]
    - message: новое сообщение пользователя
    - temperature: температура генерации (опционально)
    - max_tokens: максимальное количество токенов (опционально)
    
    Возвращает: полный текст ответа
    """
    try:
        # Формируем список сообщений для API
        messages = [msg.model_dump() for msg in request.history]
        # Добавляем новое сообщение пользователя
        messages.append({"role": "user", "content": request.message})
        
        response = llm_client.chat(
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return {"response": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при обработке запроса: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
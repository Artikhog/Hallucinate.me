from typing import Literal, List, Dict, Any, Iterator, Optional
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

class Message:
    def __init__(self, content: str):
        self.content = content

    def __str__(self):
        return f"user: {self.content}"

    def to_dict(self):
        return {
            "role": "user",
            "content": self.content
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Message":
        """Создает объект Message из словаря"""
        return cls(role=data["role"], content=data["content"])


class LLM:
    def __init__(
        self, 
        model: str = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        """
        Инициализация LLM клиента
        
        Args:
            model: Название модели (по умолчанию из переменных окружения)
            api_key: API ключ OpenAI (по умолчанию из OPENAI_API_KEY)
            base_url: Базовый URL API (по умолчанию из OPENAI_URL)
        """
        self.model = model or os.getenv("MODEL_FOR_CHAT", "gpt-4o-mini")
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        base_url = base_url or os.getenv("OPENAI_URL")
        
        if not api_key:
            raise ValueError("OPENAI_API_KEY не установлен")
        
        self.client = OpenAI(api_key=api_key, base_url=base_url)
    
    def chat_stream(
        self, 
        history: List[Dict[str, Any]], 
        new_message: Message,
        temperature: Optional[float] = 0.7,
        max_tokens: Optional[int] = None
    ):
        """
        Отправляет запрос в OpenAI API и возвращает ответ стримом
        
        Args:
            messages: Список сообщений в формате [{"role": "user", "content": "..."}]
            temperature: Температура для генерации (0.0-2.0)
            max_tokens: Максимальное количество токенов в ответе
        
        Yields:
            Части ответа (chunks) по мере их получения
        """
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=history + [new_message.to_dict()],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            raise RuntimeError(f"Ошибка при запросе к OpenAI API: {str(e)}") from e
    
    def chat(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Отправляет запрос в OpenAI API и возвращает полный ответ
        
        Args:
            messages: Список сообщений в формате [{"role": "user", "content": "..."}]
            temperature: Температура для генерации (0.0-2.0)
            max_tokens: Максимальное количество токенов в ответе
        
        Returns:
            Полный текст ответа
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
            
        except Exception as e:
            raise RuntimeError(f"Ошибка при запросе к OpenAI API: {str(e)}") from e
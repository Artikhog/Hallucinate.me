# Hallucinate Me

## Инструкция по запуску бэкенда

Установите необходимые зависимости:
```bash
cd backend
pip install -r requirements.txt
```

Запуск приложения:
```bash
cd backend/src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
    
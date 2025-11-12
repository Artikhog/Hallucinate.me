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

## Инструкция по запуску фронтенда
Установите необходимые зависимости. Для запуска необходимо установить nodejs https://timeweb.cloud/tutorials/nodejs/kak-ustanovit-node-js-na-windows
```bash
cd frontend
npm install
```

Запуск dev сервера
```bash
npm run dev
```

Собрать приложение
```bash
npm run build
```
После этого собранные файлы будут лежать в папке build
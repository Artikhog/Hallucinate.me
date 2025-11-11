from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, levels, sessions, leaderboard, users

app = FastAPI(
    title="AI Hallucination Game API",
    description="API для игры по обнаружению галлюцинаций ИИ",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(levels.router, prefix="/levels", tags=["Levels"])
app.include_router(sessions.router, prefix="/sessions", tags=["Game Sessions"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "AI Hallucination Game API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

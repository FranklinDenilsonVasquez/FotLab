from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
from src.backend.api.routes.players import router as player_router
from src.backend.api.routes.teams import router as team_router
from src.backend.api.routes.games import router as game_router
from src.backend.api.routes.standing import router as standing_router 

origins_env = os.environ.get("ALLOWED_ORIGINS",  "http://localhost:3000,http://127.0.0.1:3000")
origins = [o.strip() for o in origins_env.split(",")]

app = FastAPI(
    title="FotLab API",
    description="API for fetching NFL teams and players",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(player_router)
app.include_router(team_router)
app.include_router(game_router)
app.include_router(standing_router)
# Root endpoint
@app.get("/")
def root():
    return {"message": "NFL Stats API is running!"}
from pydantic import BaseModel
from src.backend.models.season import Season

# Base player class
class Player(BaseModel):
    player_id: int
    player_name: str
    position: str
    player_img: str | None
    jersey_number: int
    season_id: int
    age: int | None = None
    height: str | None = None
    weight: str | None = None
    college: str | None = None
    team: str | None = None

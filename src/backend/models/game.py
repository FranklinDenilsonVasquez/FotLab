from pydantic import BaseModel
from typing import Union, List, Optional
from datetime import date
from src.backend.models.team import Team
from src.backend.models.season import Season
from src.backend.models.player_stats import (QBStats, SkillStats, SkillStatsPerGame, DefenseStats, DefenseDetails,
                                             KickerStats, KickingStats, PunterStats, KickReturnerStats, PuntReturnerStats,
                                             QBStatsPerGame, FumbleStats, PassingStats, PuntingStats, RushingDetails,
                                             InterceptionStats, ReceivingStats, KickReturnStats, PuntReturnStats)
from src.backend.models.player import Player

class Game (BaseModel):
    game_id: int
    home_team: Team
    away_team: Team
    date: date
    home_team_score: int
    away_team_score: int
    season: Season
    status: str
    stage: str
    week: str
    venue: str
    city: str

# Model for condensed game info
class GameInfo(BaseModel):
    game_id: int
    home_team: str
    away_team: str
    home_team_score: int
    away_team_score: int

    defense : Optional[DefenseDetails] = None
    fumbles : Optional[FumbleStats] = None
    kicking : Optional[KickingStats] = None
    passing : Optional[PassingStats] = None
    punting : Optional[PuntingStats] = None
    rushing : Optional[RushingDetails] = None
    int_stats : Optional[InterceptionStats] = None
    receiving : Optional[ReceivingStats] = None
    kick_return : Optional[KickReturnStats] = None
    punt_return : Optional[PuntReturnStats] = None

class PlayerGamesResponse(BaseModel):
    player_id : int
    position : str
    season_id : int
    player_img : str | None
    player_name: str
    games: List[GameInfo]

class PlayerStats(BaseModel):
    fumble: Optional[FumbleStats] = None
    defense: Optional[DefenseDetails] = None
    kicking: Optional[KickingStats] = None
    passing: Optional[PassingStats] = None
    punting: Optional[PuntingStats] = None
    rushing: Optional[RushingDetails] = None
    receiving: Optional[ReceivingStats] = None
    kick_return: Optional[KickReturnStats] = None
    punt_return: Optional[PuntReturnStats] = None
    interception: Optional[InterceptionStats] = None

class PlayerGameStatsResponse(BaseModel):
    player_id: int
    player_name: str
    player_img: str | None
    position: Optional[str] = None
    stats: PlayerStats
    rating: Optional[float] = None

class GamePlayerStatsResponse(BaseModel):
    away_team: List[PlayerGameStatsResponse]
    home_team: List[PlayerGameStatsResponse]


from pydantic import BaseModel
from typing import Optional, List

class PassingStats(BaseModel):
    passing_attempted: Optional[int] = None
    passing_completion: Optional[int] = None
    passing_average: Optional[float] = None
    passing_yards: Optional[int] = None
    passing_touch_downs: Optional[int] = None
    passing_interceptions: Optional[int] = None
    sacks_total: Optional[int] = None
    sacks_yards: Optional[int] = None
    passer_rating: Optional[float] = None
    two_point_conversions: Optional[int] = None

# For QB position
class RushingStats(BaseModel):
    total_rushes: Optional[int] = None
    rushing_yards: Optional[int] = None
    rushing_average: Optional[float] = None
    rushing_touchdowns: Optional[int] = None

class RushingDetails(BaseModel):
    total_rushes: Optional[int] = None
    rushing_yards: Optional[int] = None
    rushing_average: Optional[float] = None
    rushing_touchdowns: Optional[int] = None
    longest_rush: Optional[int] = None
    two_point_rushes: Optional[int] = None
    kick_return_touchdowns: Optional[int] = None
    exp_return_touchdowns: Optional[int] = None

class FumbleStats(BaseModel):
    total_fumbles: Optional[int] = None
    fumble_lost: Optional[int] = None
    fumble_recovery: Optional[int] = None
    fumble_recovery_td: Optional[int] = None

class FumbleDetails(BaseModel):
    total_fumbles : Optional[int] = None
    fumble_lost : Optional[int] = None
    fumble_recovery : Optional[int] = None
    fumble_recovery_td : Optional[int] = None

class ReceivingStats(BaseModel):
    receiving_targets: Optional[int] = None
    total_receptions: Optional[int] = None
    receiving_yards: Optional[int] = None
    receiving_average: Optional[float] = None
    receiving_touchdowns: Optional[int] = None
    longest_reception: Optional[int] = None
    two_point_receptions: Optional[int] = None

class DefenseDetails(BaseModel):
    tackles: Optional[int] = None
    unassisted_tackles: Optional[int] = None
    sacks: Optional[int] = None
    tackles_for_loss: Optional[int] = None
    passes_defended: Optional[int] = None
    qb_hits: Optional[int] = None
    interceptions_for_tds: Optional[int] = None
    blocked_kicks: Optional[int] = None
    kick_return_td: Optional[int] = None
    expected_return_td: Optional[int] = None
    forced_fumbles: Optional[int] = None

class InterceptionStats(BaseModel):
    total_interceptions: Optional[int] = None
    yards: Optional[int] = None
    intercepted_touch_downs: Optional[int] = None

class KickingStats(BaseModel):
    fg_made: Optional[int] = None
    fg_attempted: Optional[int] = None
    fg_percentage: Optional[float] = None
    fg_long: Optional[int] = None
    xp_made: Optional[int] = None
    xp_attempted: Optional[int] = None
    points: Optional[int] = None
    field_goals_from_1_19_yards: Optional[int] = None
    field_goals_from_20_29_yards: Optional[int] = None
    field_goals_from_30_39_yards: Optional[int] = None
    field_goals_from_40_49_yards: Optional[int] = None
    field_goals_from_50_yards: Optional[int] = None

class KickingGameStats(BaseModel):
    game_id: int
    home_team: str
    away_team: str
    home_team_score: int
    away_team_score: int
    kicking : Optional[KickingStats] = None
    rating: Optional[float] = None

class KickingStatsPerGame(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    games : List[KickingGameStats]

class PuntingStats(BaseModel):
    punt_total: Optional[int] = None
    punt_yards: Optional[int] = None
    punt_average: Optional[float] = None
    touchbacks: Optional[int] = None
    inside_20: Optional[int] = None
    long_punt: Optional[int] = None

class KickReturnStats(BaseModel):
    total_kick_returns: Optional[int] = None
    kick_return_yards: Optional[int] = None
    kick_return_average: Optional[float] = None
    kick_return_long: Optional[int] = None
    td: Optional[int] = None
    kick_return_td: Optional[int] = None
    exp_return_td: Optional[float] = None

class PuntReturnStats(BaseModel):
    punt_return_total: Optional[int] = None
    punt_return_yards: Optional[int] = None
    punt_return_average: Optional[float] = None
    punt_return_long: Optional[int] = None
    punt_return_touchdowns: Optional[int] = None

# Nested model for QB per game stats
class QBGameStats(BaseModel):
    game_id: int
    home_team: str
    away_team: str
    home_team_score : int
    away_team_score : int
    passing : Optional[PassingStats] = None
    rushing : Optional[RushingStats] = None
    fumbles: Optional[FumbleStats] = None
    rating: Optional[float] = None

# Nested model for the top level QB json response
class QBStatsPerGame(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # QB Stats
    games: List[QBGameStats]

# Season long QB stats
class QBStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # QB Stats
    # Passing stats
    passing: PassingStats
    # Rushing stats
    rushing: RushingStats
    # Fumble stats
    fumbles: FumbleStats

# Season long skill position stats
class SkillStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # Receiving stats
    receiving: ReceivingStats
    # Rushing stats
    rushing: RushingStats
    # Fumble stats
    fumbles: FumbleStats

# Nested model for the top level Skill position json response
class SkillGameStats(BaseModel):
    game_id : int
    home_team : str
    away_team : str
    home_team_score : int
    away_team_score : int
    receiving : Optional[ReceivingStats] = None
    rushing : Optional[RushingStats] = None
    fumbles : Optional[FumbleStats] = None
    rating: Optional[float] = None

# Nested model for QB per game stats
class SkillStatsPerGame(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # Skill position stats
    games: List[SkillGameStats]

# season long defense stats
class DefenseStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # Defensive stats
    defense: DefenseDetails
    int_stats: InterceptionStats
    fumbles: FumbleStats

class DefenseGameStats(BaseModel):
    game_id: int
    home_team: str
    away_team: str
    home_team_score: int
    away_team_score: int
    defense: Optional[DefenseDetails] = None
    int_stats: Optional[InterceptionStats] = None
    fumbles: Optional[FumbleStats] = None
    rating: Optional[float] = None

class DefenseStatsPerGame(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    games : List[DefenseGameStats]

# season long kicker stats
class KickerStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # Kicker stats
    kicking : KickingStats

class PunterGameStats(BaseModel):
    game_id: int
    home_team: str
    away_team: str
    home_team_score: int
    away_team_score: int
    punting : Optional[PuntingStats] = None
    rating: Optional[float] = None

class PunterStatsPerGame(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    games: List[PunterGameStats]

# season long punter stats
class PunterStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # Punting stats
    punting: PuntingStats

# season long kick returner stats
class KickReturnerStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    kicking : KickingStats

# season long punt returner stats
class PuntReturnerStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    total: int
    yards: int
    average: float
    long: int
    touchdown: int

class LinemenStats(BaseModel):
    player_id: int
    player_name: str
    season_id: int | None = 0
    position: str
    player_img: str | None
    fumbles : FumbleStats
    defense : DefenseDetails

class LinemanGameStats(BaseModel):
    game_id: int
    home_team: str
    away_team: str
    home_team_score: int
    away_team_score: int
    fumbles : Optional[FumbleDetails] = None
    defense : Optional[DefenseDetails] = None

class LinemanStatsPerGame(BaseModel):
    player_id: int
    player_name: str
    season_id: int
    position: str
    player_img: str | None
    # Game stats
    games : List[LinemanGameStats]

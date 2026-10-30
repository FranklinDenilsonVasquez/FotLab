from src.backend.models.game import GamePlayerStatsResponse, PlayerGameStatsResponse, PlayerStats
from src.backend.models.player import Player


def test_player_accepts_null_headshot():
    player = Player(
        player_id=1,
        player_name="No Photo",
        position="WR",
        player_img=None,
        jersey_number=10,
        season_id=1,
    )
    assert player.player_img is None


def test_game_player_stats_response_accepts_null_headshot():
    player = PlayerGameStatsResponse(
        player_id=1,
        player_name="No Photo",
        player_img=None,
        stats=PlayerStats(),
    )
    response = GamePlayerStatsResponse(home_team=[player], away_team=[])
    assert response.home_team[0].player_img is None

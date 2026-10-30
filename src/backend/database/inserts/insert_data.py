from src.backend.database.db_connection import get_db_connection
from src.backend.database.db_config import get_db_config
from src.backend.utils.logging import setup_logger
from src.backend.scripts.utils.player_exists import player_exists
from src.backend.services.headshot_service import resolve_headshot_url
import mysql.connector
import psycopg2
from datetime import datetime
from src.backend.api.fetch_data import fetch_player_stats
from collections import defaultdict


logger = setup_logger()


def insert_stadium(teams):
    # Establish database connection
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return

    cursor = conn.cursor()

    for team in teams:
        # Iterate over teams and insert the stadiums
        sql = """
                INSERT INTO stadium (stadium_name, capacity, location)
                VALUES (%s, %s, %s)
        """

        stadium_data = (
            team.get('stadium'),
            None,
            team.get('city')
        )
        try:
            cursor.execute(sql, stadium_data)
            logger.info(f"Inserted stadium '{stadium_data}' for team {team.get('name')}")
        except Exception as e:
            logger.warning(f"Failed to insert stadium for team: {team} - {e}")
            continue

        conn.commit()
    cursor.close()
    conn.close()


def insert_teams(teams):
    # Establish database connection
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return     

    cursor = conn.cursor()
    
    # Iterate over teams and insert them into the database
    for team in teams:

        # Lookup the stadium_id from the stadium table
        cursor.execute(
            "SELECT stadium_id FROM stadium WHERE stadium_name = %s;",
            (team.get('stadium'),)
        )
        result = cursor.fetchone()

        if result is None:
            logger.warning(f"Stadium '{team.get('stadium')} not found for team {team.get('name')}. Skipping.")
            continue

        stadium_id = result[0]

        sql = """INSERT INTO team (team_name, stadium_id, city, code, logo_path)
                 VALUES (%s, %s, %s, %s, %s)"""
        team_data = (
            team['name'],
            stadium_id,
            team['city'], 
            team['code'],
            team['logo']
        )
        try:
            cursor.execute(sql, team_data)
        except Exception as e:
            print(f"Error inserting team {team['name']}, {e}")
            continue
    conn.commit()
    cursor.close()
    conn.close()


def insert_players(players, team_id, season):
    # Establish database connection
    conn = get_db_connection()
    
    if conn is None:
        logger.error("Could not connect to the database.")
        return      
    cursor = conn.cursor()

    cursor.execute("SELECT season_id FROM season WHERE season_year = '%s'", (season,))
    season_row = cursor.fetchone()

    if season_row is None:
        logger.warning(f"Invalid season: {season}")
        return

    season_id = season_row[0]

    # Iterate over teams and insert payers into the database
    for player in players:
        try:

            # Check required fields
            if 'id' not in player or 'name' not in player or 'position' not in player:
                logger.warning(f"Skipping malformed player data: {player}")
                continue

            api_player_id = player['id']
            full_name = player['name']
            height = player.get('height')
            weight = player.get('weight')
            college = player.get('college')
            position_name = player.get('position') # It may be None
            age = player.get('age')
            group = player.get('group')
            position_type = normalize_position_type(group)
            roster_status = get_roster_status(group)
            image_url = resolve_headshot_url(player.get('image'))
            jersey_number = player.get('number')

            player_team_exists = player_exists(cursor, api_player_id, season_id, team_id)
            if player_team_exists:
                logger.info(f"Player ({full_name} : {api_player_id}) already exists in player_team. "
                            f"Skipping player_team insert, still refreshing player row.")

            if position_type is None:
                logger.warning(f"Unknown positionType for player {api_player_id} - {full_name}, "
                               f"group='{player.get('group')}', inserting with NULL.")

            # Try to get positionId, if position_name is available
            position_id = None
            if position_name:
                cursor.execute("SELECT position_id FROM position WHERE position_name = %s", (position_name,))
                result = cursor.fetchone()
                if result:
                    position_id = result[0]
                else:
                    cursor.execute("INSERT INTO position (position_name) VALUES (%s) RETURNING position_id",
                                    (position_name,)
                                   )
                    position_id = cursor.fetchone()[0]
            else:
                logger.warning(f"Player {api_player_id} - {full_name} has no positionName.")


            # Prepare insert (ON DUPLICATE KEY UPDATE only updates if player already exists)
            sql_player = """
                INSERT INTO player (player_name, height, weight, college, age,
                                    position_id, player_img, api_player_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (api_player_id)
                DO UPDATE SET
                    player_name = EXCLUDED.player_name,
                    player_img = EXCLUDED.player_img,
                    position_id = EXCLUDED.position_id,
                    age = EXCLUDED.age,
                    height = EXCLUDED.height,
                    weight = EXCLUDED.weight,
                    college = EXCLUDED.college
                """
            player_data = (full_name, height, weight, college, age,
                           position_id, image_url, api_player_id)

            cursor.execute(sql_player, player_data)

            if not player_team_exists:
                sql_player_team = """
                    INSERT INTO player_team (api_player_id, team_id, season_id, jersey_number)
                    VALUES(%s, %s, %s, %s)
                    ON CONFLICT (api_player_id, season_id) DO NOTHING;
                """
                player_data_team = (api_player_id, team_id, season_id, jersey_number)
                cursor.execute(sql_player_team, player_data_team)

                logger.info(f"Player: {full_name} (ID: {api_player_id}) has been added to player_team table.")

        except Exception as e:
            conn.rollback()
            logger.warning(f"Failed to insert player {player.get('id', 'UNKNOWN')}: {e}")
            continue


    conn.commit()
    cursor.close()
    conn.close()
    logger.info(f"Finished inserting players for team ID {team_id}.")

# Normalize the roster status of each player to keep track of their current status
def get_roster_status(group):
        if not group:
            return 'active'
        group = group.lower()
        if "practice" in group:
            return "practice_squad"
        elif "injured" in group:
            return "injured_reserve"
        return "active"

# Normalize position type and get it ready for the database
def normalize_position_type(group):
    if not group:
        return None
    group = group.lower()
    if "offense" in group:
        return "offense"
    elif "defense" in group:
        return "defense"
    elif "special" in group:
        return "special_teams"
    elif "practice" in group or "injured" in group:
        return None
    else:
        logger.warning(f"Unrecognized group label '{group}' for positionType.")
        return None

# Function to insert coaches into the database
def insert_coach_from_team(team, season):
    # Establish database connection
    conn = get_db_connection()
    
    if conn is None:
        logger.error("Could not connect to the database.")
        return      
    cursor = conn.cursor()

    try:
        team_id = team['id']
        coach_name = team.get("coach", None)

        # Get the season_id from season table
        cursor.execute("SELECT season_id FROM season WHERE season_year = '%s'", (season,))
        season_row = cursor.fetchone()

        if season_row is None:
            logger.warning(f"Invalid season: {season}")
            return

        season_id = season_row[0]

        # If no coach is listed for the team send a warning 
        if not coach_name:
            logger.warning(f"No coach info found for team {team_id} - {team['name']}")
            return 
        
        # strip() = remove leading and trailing characters
        coach_name = coach_name.strip()
        
        # Prepare the SQL statement to insert coaches into the coach table
        coach_sql = """
            INSERT INTO coach (coach_name)
            VALUES (%s)
            ON CONFLICT (coach_name) DO NOTHING
            RETURNING coach_id;
            """
        cursor.execute(coach_sql, (coach_name,))
        result = cursor.fetchone()

        if result:
            coach_id = result[0]
        else:
            # The coach already exists so extract the coach_id
            cursor.execute("SELECT coach_id FROM coach WHERE coach_name = %s", (coach_name,))
            coach_id = cursor.fetchone()[0]
        # Insert into coach_team_season table
        coach_team_season_sql = """
            INSERT INTO coach_team_season (coach_id, team_id, season_id)
            VALUES (%s, %s, %s)
            ON CONFLICT (coach_id, team_id, season_id) DO NOTHING;
            """

        coach_team_season_data = (
            coach_id,
            team_id,
            season_id,
        )

        cursor.execute(coach_team_season_sql, coach_team_season_data)

    except Exception as e:
        logger.warning(f"Failed to insert coach from team {team_id} - {team['name']}: {e}")

    finally:
        conn.commit()
        cursor.close()
        conn.close()



def insert_seasons(season_years):
    # Establish database connection
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return     

    cursor = conn.cursor()

    try:
        for year in season_years:
            sql = """
                INSERT INTO season (season_year)
                VALUES (%s)
                ON CONFLICT (season_year) DO NOTHING;
            """

            cursor.execute(sql, (year,))
            logger.info(f"Inserted/Updated season: {year}")

    except Exception as e:
        logger.warning(f"Failed to insert/update season: {e}")
        
    finally:
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Finished inserting seasons into database")

def insert_games(games:list):
    # Establish database connection
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return     

    cursor = conn.cursor()

    try:
        # Function that goes through the Season table in database and returns it's primary key
        def get_season_id(cursor, year):
            cursor.execute("SELECT season_id FROM season WHERE season_year = %s",(year,))
            row = cursor.fetchone()

            if row:
                return row[0]
            else:
                return None
            
        for game_obj in games:
            # Extract nested data by "zooming in" through the JSON structure.
            # The API response is a dictionary with keys like 'game', 'teams', etc.,
            # and each of those contains another dictionary with the actual values we need.
            # We access these step by step to safely get the data. 
            game_data = game_obj['game']
            league_data = game_obj['league']
            teams_data = game_obj['teams']
            scores_data = game_obj['scores']
            
            # Get data from the "zoomed in" JSON response
            game_id = game_data['id']
            home_team = teams_data['home']['id']
            away_team = teams_data['away']['id']
            game_date = game_data['date']['date'] # e.g., "2023-08-04"

            home_score = scores_data['home'].get('total', 0) # Get total if set to None return 0 to not raise an error
            away_score = scores_data['away'].get('total', 0) # Get total if set to None return 0 to not raise an error

            # If score is NULL pass 0
            home_score = home_score if home_score is not None else 0
            away_score = away_score if away_score is not None else 0

            status = str(game_data.get('status', {}).get('long', ''))
            stage = str(game_data.get('stage') or '')
            week = str(game_data.get('week') or '')

            venue_data = game_data.get('venue', {})
            game_venue = str(venue_data.get('name') or '')
            game_city = str(venue_data.get('city') or '')

            game_season = str(league_data.get('season') or '')

            season_id = get_season_id(cursor, game_season)

            if not season_id:
                logger.warning(f"SeasonId doesn't exist in database. Skipping game {game_id}")
                continue


            sql = """
                INSERT INTO game(game_id, home_team_id, away_team_id, game_date, 
                                home_team_score, away_team_score, season_id, status, stage, week, venue, city)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (game_id) DO UPDATE 
                    SET
                        home_team_id = EXCLUDED.home_team_id,
                        away_team_id = EXCLUDED.away_team_id,
                        game_date = EXCLUDED.game_date,
                        home_team_score = EXCLUDED.home_team_score,
                        away_team_score = EXCLUDED.away_team_score,
                        season_id = EXCLUDED.season_id,
                        status = EXCLUDED.status, 
                        stage = EXCLUDED.stage,
                        week = EXCLUDED.week,
                        venue = EXCLUDED.venue,
                        city = EXCLUDED.city 
            """

            data = (game_id, home_team, away_team, game_date, home_score,
                    away_score, season_id, status, stage, week, game_venue, game_city)

            cursor.execute(sql, data)

    except Exception as e:

        logger.warning(f"Failed to insert game data: {e}")

    finally:
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Finished inserting games into database")


# Function to insert player stats in the offensive side of the ball
def insert_offensive_player_stats(stats):
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return     

    cursor = conn.cursor()

    try:
        sql = """
            INSERT INTO offplayerstats(game_id, player_id, team_id, passing_td,
                receiving_td, rushing_td, rushing_yards, passing_yards, receiving_yards,
                completions, attempts, rating)
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id, player_id, team_id) DO UPDATE SET
                passing_td = EXCLUDED.passing_td,
                receiving_td = EXCLUDED.receiving_td, 
                rushing_td = EXCLUDED.rushing_td, 
                rushing_yards = EXCLUDED.rushing_yards, 
                passing_yards = EXCLUDED.passing_yards, 
                receiving_yards = EXCLUDED.receiving_yards,
                completions = EXCLUDED.completions,
                attempts = EXCLUDED.attempts,
                rating = EXCLUDED.rating
        """
    
        cursor.executemany(sql, stats)
    except Exception as e:
        logger.warning(f"Failed to insert offensive game data: {e}")

    finally:
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Inserted/updated offensive stats for multiple games")
    

    # Function to insert player stats in the defensive side of the ball
def insert_defensive_player_stats(stats):
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return     

    cursor = conn.cursor()
    try:
        sql = """
            INSERT INTO defplayerstats(game_id, player_id, team_id, tackles, 
            sacks, interceptions, forcedfumbles)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id, player_id, team_id) DO UPDATE SET
                tackles = EXCLUDED.tackles, 
                sacks = EXCLUDED.sacks,
                interceptions = EXCLUDED.interceptions,
                forcedfumbles = EXCLUDED.forcedfumbles
        """

        cursor.executemany(sql, stats)
    except Exception as e:
        logger.warning(f"Failed to insert defensive game  data: {e}")
    
    finally:
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Inserted/updated defensive stats for multiple games")

# Function that processes and inserts stats into the appropriate table in database
def process_and_insert_stats(gameId, season):

    # Only allow seasons 2021–2023 for free plan

    if season not in [2022, 2023, 2024]:
        logger.info(f"Skipping game {gameId} for season {season} (not available on free plan).")
        return
    
    conn = get_db_connection()
    if conn is None:
        logger.error("Could not connect to the database.")
        return     

    cursor = conn.cursor()

    player_stats = fetch_player_stats(gameId)

    # Aggregate offensive stats by (season, gameId, playerId, teamId)
    offensive_agg = defaultdict(lambda: {
        "passingYards": 0,
        "passingTouchdowns": 0,
        "rushingYards": 0,
        "rushingTouchdowns": 0,
        "receivingYards": 0,
        "receivingTouchdowns": 0,
        "completions": 0,
        "attempts": 0,
        "rating": 0
    })

    # Aggregate defensive stats by (season, gameId, playerId, teamId)
    defensive_agg = defaultdict(lambda:{
        "tackles": 0,
        "sacks": 0,
        "interceptions": 0,
        "forcedFumbles": 0
    })

    # Loop through each team in the response 
    for team_data in player_stats:
        teamId = team_data["team"]["id"]

        # Loop through each stat group (passing, rushing, receiving, defense, etc.)
        for group in team_data.get("groups", []):
            cat_name = group["name"].lower()

            # Loop through all players in this group
            for players_data in group.get("players", []):
                playerId = players_data["player"]["id"]
                api_player_id = get_player_api_key(cursor, playerId)
                key = (season, gameId, api_player_id, teamId)

                # Loop through individual stats for the player
                for stat in players_data.get("statistics", []):
                    statName = stat["name"].lower()
                    statValue = stat["value"]

                    # Handle "completions/attempts" strings
                    if isinstance(statValue, str) and '/' in statValue:
                        # e.g. "13/19" completions/attempts
                        try:
                            completions, attempts = map(int, statValue.split("/"))
                            offensive_agg[key]["completions"] += completions
                            offensive_agg[key]["attempts"] += attempts
                        except ValueError:
                            pass
                        continue

                    # skip null values
                    if statValue is None:
                        statValue = 0

                    # Convert rating or numeric strings
                    try:
                        statValue = float(statValue) if "." in str(statValue) else int(statValue)
                    except (ValueError, TypeError):
                        statValue = 0

                    # Map stats into offense
                    if cat_name == "passing":
                        if statName == "passing touch downs":
                            offensive_agg[key]["passingTouchdowns"] += statValue
                        elif statName == "yards":
                            offensive_agg[key]["passingYards"] += statValue
                    elif cat_name == "rushing":
                        if statName == "rushing touch downs":
                            offensive_agg[key]["rushingTouchdowns"] += statValue
                        elif statName == "yards":
                            offensive_agg[key]["rushingYards"] += statValue
                    elif cat_name == "receiving":
                        if statName == "receiving touch downs":
                            offensive_agg[key]["receivingTouchdowns"] += statValue
                        elif statName == "yards":
                            offensive_agg[key]["receivingYards"] += statValue

                    # Map stats into defense
                    elif cat_name == "defensive":
                        if statName == "tackles":
                            defensive_agg[key]["tackles"] += statValue
                        elif statName == "sacks":
                            defensive_agg[key]["sacks"] += statValue
                        elif statName == "ff":
                            defensive_agg[key]["forcedFumbles"] += statValue

                    elif cat_name == "interceptions":
                        if statName == "total interceptions":
                            defensive_agg[key]["interceptions"] += statValue


    # Prepare and insert offensive stats
    if offensive_agg:
        offensive_batch = [
            (gameId, api_player_id, teamId,
            stats["passingYards"], stats["passingTouchdowns"],
            stats["rushingYards"], stats["rushingTouchdowns"],
            stats["receivingYards"], stats["receivingTouchdowns"],
            stats["completions"], stats["attempts"], stats["rating"])
            for (season, gameId, api_player_id, teamId), stats in offensive_agg.items()
        ]
        insert_offensive_player_stats(offensive_batch)

    # Prepare and insert defensive stats
    if defensive_agg:
        defensive_batch= [
            (gameId, api_player_id, teamId,
             stats["tackles"], stats["sacks"], stats["interceptions"], 
             stats["forcedFumbles"])
             for (season, gameId, api_player_id, teamId), stats in defensive_agg.items()
        ]
        insert_defensive_player_stats(defensive_batch)
    
    cursor.close()
    conn.close()
    logger.info(f"Finished processing stats for game {gameId} in season {season}")

def get_player_api_key (cursor, player_id):
    if cursor is None:
        logger.warning("Connection to database/cursor failed")
        return None

    try:
        cursor.execute("SELECT player_id FROM player WHERE api_player_id = %s;", (player_id,))

        result = cursor.fetchone()

        if result is None:
            logger.warning(f"No API player ID found for player_={player_id}")
            return None
        return result[0]

    except ValueError as e:
        logger.exception(f"Failed to fetch api_player_id for player_id = {player_id}")
        return None


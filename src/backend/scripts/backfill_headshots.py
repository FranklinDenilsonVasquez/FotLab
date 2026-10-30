# One-off, idempotent backfill: sets player.player_img to NULL for every player
# whose stored image is the API's Placeholder Headshot (see CONTEXT.md).
# Run with: python -m src.backend.scripts.backfill_headshots
from src.backend.database.db_connection import get_db_connection
from src.backend.services.headshot_service import resolve_headshot_url
from src.backend.utils.logging import setup_logger

logger = setup_logger()


def backfill_headshots():
    conn = get_db_connection()
    if not conn:
        raise Exception("Failed to connect to database")

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT api_player_id, player_img FROM player WHERE player_img IS NOT NULL;"
            )
            rows = cursor.fetchall()
            logger.info(f"Checking {len(rows)} player headshots.")

            nulled = 0
            for api_player_id, image_url in rows:
                if resolve_headshot_url(image_url) is None:
                    cursor.execute(
                        "UPDATE player SET player_img = NULL WHERE api_player_id = %s;",
                        (api_player_id,),
                    )
                    nulled += 1

        conn.commit()
        logger.info(f"Headshot backfill complete: {nulled} placeholders cleared.")
    except Exception:
        conn.rollback()
        logger.exception("Headshot backfill failed")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    backfill_headshots()

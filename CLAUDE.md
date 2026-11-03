## Project Overview

## Commands

### Backend (FastAPI)

Run from the project root with the virtual environment activated (`src/backend/venv`):

```bash
# Start the API server
uvicorn src.backend.main:app --reload

# Run ETL scripts manually (example: insert all data)
python -m src.backend.scripts.insert_all

# Run standings-specific ETL
python -m src.backend.scripts.insert_standings
```

### Environment

The ETL free plan only supports seasons 2022–2024.

## Architecture

### Data Flow

### Backend (`src/backend/`)

- Player stats are stored in seperate tables per stat group, not a single unified table.

- The API response for player stats uses fractional strings for some fields (e.g., `"13/19"` for completions/attempts, `"3/4"` for FG made/attempted) — the normalizers and insert code split these manually.

### Frontend (`src/frontend/src/`)

State is managed entirely with **Zustand** stores in `store/`:

Components in `components/` follow a flat directory per feature (e.g., `Standings/`, `PlayerCard/`, `GameList/`). Standings are fetched as a flat list and grouped into conference → division by `utils/groupStandings.js` before rendering.

## Important Conventions

- All DB connections are opened and closed per request inside service functions using `get_db_connection()`. There is no connection pooling.
- The `player` table stores the API's `api_player_id` as a separate column; internal `player_id` (SERIAL) is used for FK relationships. Use `api_player_id` when joining to API responses.
- The `schema.sql` contains both old commented-out MySQL DDL and the active PostgreSQL DDL — the PostgreSQL tables are the live ones.
- ETL scripts use `ON CONFLICT ... DO UPDATE` / `DO NOTHING` for idempotent inserts.
- Position-to-stats-model mapping lives in `core/position_model_mapping.py`; when adding a new position or stat model, update both `POSITION_MODEL_MAP_PER_SEASON` and `POSITION_MODEL_MAP_PER_GAME`.
- Free API plan only supports seasons 2022–2024.
- API responses sometimes use fractional strings (`13/19`, `3/4`) that must be normalized manually.
- `player_id` is the internal PK; `api_player_id` should be used when matching external API data.
- ETL scripts must remain idempotent (`ON CONFLICT DO UPDATE/NOTHING`).
- Position mappings live in `core/position_model_mapping.py`; update both season and game maps when adding positions.

## Development Workgflows

Before implementing:

1. Analyze exisitng code.
2. Identify reusable components/functions.
3. Identify existing patterns and conversions.
4. Implement new functionality using those patterns.
5. Present a short plan.
6. Wait for approval before major refactors.

After implementing:

1. Run tests if available
2. Explain architectural decisions.
3. Prefer minimal changes over rewrites.

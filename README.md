# FotLab

FotLab tracks NFL game, team, and player stats for the 2022-2024 seasons and surfaces them through a FastAPI backend and a React frontend.

Data is pulled from an external NFL stats API, normalized, and stored in PostgreSQL. The frontend presents a game-centric view built around three panels: a game list, a field diagram for the selected game, and conference/division standings. Player cards show position-specific stat breakdowns alongside a computed **Player Game Rating** - a 0.0-10.0 score derived from a player's own stat line in a given game.

## How It Works

1. ETL scripts pull game, team, and player data from an external NFL stats API, clean up its quirks (like fractional fields, e.g. `"13/19"` completions/attempts), and load it into PostgreSQL.
2. Once a game's stats are loaded, each player's Player Game Rating is computed from a position-weighted breakdown of their stat line.
3. A FastAPI backend exposes this data through a REST API covering teams, players, games, and standings.
4. A React frontend consumes that API and renders the game view: a game list, a field diagram for the selected game, and conference/division standings.

## Getting Started

These instructions will get you a copy of the project running locally for development and testing.

### Prerequisites

- Python 3.11+ with `pip`
- Node.js and `npm`
- PostgreSQL
- An API key for the external NFL stats provider (free tier only supports the 2022-2024 seasons)

### Installing

Clone the repository and set up the backend:

```bash
git clone https://github.com/FranklinDenilsonVasquez/nfl-live-tracker.git
cd nfl-live-tracker

python -m venv venv
venv/Scripts/activate   # Windows
pip install -r requirements.txt
```

Create a `.env` file in the project root with your database credentials, external API key, and allowed CORS origins (see `.env` for the full list of expected variables).

Set up PostgreSQL, then load the initial dataset via the provided ETL scripts:

```bash
python -m src.backend.scripts.insert_all
```

Start the API server:

```bash
uvicorn src.backend.main:app --reload
```

Set up and start the frontend:

```bash
cd src/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000` and will talk to the locally running API.

## Running the Tests

Backend tests can be run with:

```bash
pytest src/backend/tests
```

Frontend tests are run with Vitest:

```bash
cd src/frontend
npm run test
```

### Break down into end-to-end tests

The backend test suite focuses on the ETL normalization logic - verifying that quirks in the external API's response format (like fractional-string stats) are parsed into correct, well-typed values before they're inserted into the database.

## Deployment

The frontend is deployed on Vercel. The backend runs as a standalone FastAPI service and just needs a reachable PostgreSQL database and its CORS origins configured to allow the deployed frontend.

## Built With

- [FastAPI](https://fastapi.tiangolo.com/) - Backend web framework
- [PostgreSQL](https://www.postgresql.org/) via [psycopg2](https://www.psycopg.org/) - Database
- [Pydantic](https://docs.pydantic.dev/) - Data models and validation
- [React](https://react.dev/) - Frontend UI library
- [Vite](https://vitejs.dev/) - Frontend build tool and dev server
- [Zustand](https://github.com/pmndrs/zustand) - Frontend state management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Axios](https://axios-http.com/) - HTTP client
- [Vitest](https://vitest.dev/) / [pytest](https://docs.pytest.org/) - Testing

## Authors

- **Franklin D. Vasquez** - *Initial work* - [FranklinDenilsonVasquez](https://github.com/FranklinDenilsonVasquez)

## License

No license has been chosen for this project yet. All rights are reserved by default until a license is added.

## Acknowledgments

- Player and team statistics are sourced from an external NFL stats API.
- README structure based on [PurpleBooth's README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2).

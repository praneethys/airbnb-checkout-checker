# Backend

FastAPI backend for the Airbnb Checkout Checker.

## Setup

```bash
# Start Ollama with a vision model
ollama pull llava

poetry install
cp .env.example .env
poetry run uvicorn app.main:app --reload
```

## API Docs

http://localhost:8000/docs

## Structure

```
app/
├── api/routes.py       # API endpoints
├── models/models.py    # SQLAlchemy models
├── schemas/schemas.py  # Pydantic schemas
├── services/           # Ollama vision integration
├── config.py           # Settings
├── database.py         # Async SQLite setup
└── main.py             # FastAPI app
```

## Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/properties` | Create property |
| POST | `/api/properties/{id}/rooms` | Add room |
| POST | `/api/rooms/{id}/items` | Add checklist item |
| POST | `/api/properties/{id}/checks` | Start check-in/out |
| POST | `/api/checks/{id}/photos/{room_id}` | Upload & analyze photo |
| GET | `/api/properties/{id}/damage-report` | Generate damage report |
| GET | `/api/properties/{id}/cost-history` | View cost history |

## Lint & Format

```bash
poetry run ruff check .          # Lint
poetry run ruff check . --fix    # Lint and auto-fix
poetry run ruff format .         # Format
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OLLAMA_HOST` | Ollama server URL (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | Vision model to use (default: `llava`) |
| `DATABASE_URL` | SQLite path (default: `sqlite+aiosqlite:///./checkout.db`) |
| `UPLOAD_DIR` | Photo storage path (default: `./uploads`) |

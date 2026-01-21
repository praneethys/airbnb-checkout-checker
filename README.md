# Airbnb Checkout Checker

Photo-based property inspection tool for part-time Airbnb hosts managing 1-2 properties.

## Features

- Photo checklist for each room (before/after guest stays)
- AI-powered detection of missing items (towels, remotes, etc.)
- Damage detection with before/after comparison
- Damage claim report generation
- Replacement cost tracking over time

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy (async), SQLite, Pydantic
- **Frontend**: React, Vite, TanStack Query, Zod, Chakra UI
- **AI**: Ollama with LLaVA (local vision model)

## Quick Start

```bash
# Make sure Ollama is running with llava model
ollama pull llava

./run.sh
```

This starts both backend (http://localhost:8000) and frontend (http://localhost:5173).

## Setup

### Backend

See [backend/README.md](backend/README.md) for detailed setup, API docs, and environment variables.

```bash
cd backend
poetry install
cp .env.example .env
poetry run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development

### Lint & Format

```bash
# Backend
cd backend && poetry run ruff check . && poetry run ruff format .

# Frontend
cd frontend && npm run lint && npm run format
```

### VSCode

Recommended extensions will be suggested on open. Format on save is enabled.

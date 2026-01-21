# Airbnb Checkout Checker

Photo-based property inspection tool for part-time Airbnb hosts managing 1-2 properties.

## Features

- Photo checklist for each room (before/after guest stays)
- AI-powered detection of missing items (towels, remotes, etc.)
- Damage detection with before/after comparison
- Damage claim report generation (excludes pre-existing issues)
- Lost and found tracking for guest belongings
- Replacement cost tracking over time

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy (async), SQLite, Pydantic
- **Frontend**: React, Vite, TanStack Query, Zod, Chakra UI
- **AI**: Ollama with LLaVA (local vision model - runs locally, no API keys needed)

## One-Click Setup (Recommended)

For first-time users, run the setup script that installs everything automatically:

```bash
./setup.sh
```

This will:
- Install Python, Node.js, and Poetry (if not already installed)
- Install and start Ollama
- Download the LLaVA vision model
- Install all project dependencies
- Create configuration files

After setup completes, start the app with:

```bash
./run.sh
```

Then open http://localhost:5173 in your browser.

## Manual Setup

If you prefer to set things up manually:

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) with the `llava` model

### Backend

See [backend/README.md](backend/README.md) for detailed setup, API docs, and environment variables.

```bash
# Install and start Ollama with vision model
ollama pull llava

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

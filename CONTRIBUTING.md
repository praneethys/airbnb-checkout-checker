# Contributing to Airbnb Checkout Checker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/airbnb-checkout-checker.git
   cd airbnb-checkout-checker
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```

## Development Workflow

### Running the App

```bash
./run.sh
```

This starts both the backend (http://localhost:8000) and frontend (http://localhost:5173).

### Code Style

We use automated formatters and linters to maintain consistent code style.

**Backend (Python):**
```bash
cd backend
poetry run ruff check .        # Lint
poetry run ruff check . --fix  # Lint and auto-fix
poetry run ruff format .       # Format
```

**Frontend (TypeScript/React):**
```bash
cd frontend
npm run lint      # Lint
npm run format    # Format
```

### Pre-commit Checks

Before submitting a PR, ensure:

1. All linting passes
2. Code is properly formatted
3. The app runs without errors

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-room-templates` - New features
- `fix/photo-upload-error` - Bug fixes
- `docs/update-api-docs` - Documentation updates
- `refactor/simplify-damage-report` - Code refactoring

### Commit Messages

Write clear, concise commit messages:

```
Add room template feature for quick setup

- Add predefined room templates (bedroom, bathroom, kitchen)
- Include default checklist items for each template
- Update UI to show template selector when creating rooms
```

### Pull Requests

1. Create a new branch from `main`
2. Make your changes
3. Ensure all checks pass
4. Submit a PR with:
   - Clear title describing the change
   - Description of what and why
   - Screenshots for UI changes
   - Link to related issues

## Project Structure

```
airbnb-checkout-checker/
├── backend/
│   └── app/
│       ├── api/routes.py       # API endpoints
│       ├── models/             # SQLAlchemy models
│       ├── schemas/            # Pydantic schemas
│       ├── services/           # Business logic (vision AI)
│       ├── config.py           # Settings
│       └── database.py         # Database setup
├── frontend/
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page components
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Utilities
├── setup.sh                    # One-click setup
└── run.sh                      # Start the app
```

## Areas for Contribution

### Good First Issues

- Improve error messages in the UI
- Add loading states to buttons
- Write unit tests for API endpoints
- Improve mobile responsiveness

### Feature Ideas

- Export damage reports as PDF
- Email notifications for damage detected
- Multi-language support
- Room templates with pre-filled checklists
- Historical photo comparison view
- Guest contact integration

### Documentation

- API documentation improvements
- User guide with screenshots
- Video tutorial

## Reporting Bugs

When reporting bugs, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
5. Browser/OS information
6. Error messages from console

## Questions?

Feel free to open an issue for questions or discussions about the project.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

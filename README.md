# AI Interview Coach 🎤

An AI-powered interview practice platform. Generate role-specific interview questions, submit answers, and receive instant scoring and qualitative feedback — all powered by OpenRouter LLMs.

---

## Features

- **Generate Questions** — Role-, industry-, and experience-level-specific questions via LLM
- **Submit & Score Answers** — Semantic similarity scoring using OpenRouter API (no local ML model needed)
- **LLM Feedback** — Per-question qualitative feedback and keyword/topic insights
- **Session History** — Persisted to PostgreSQL; view past sessions and track progress
- **Analytics Dashboard** — Score trends, best/average scores, top roles & industries
- **Authentication** — JWT-based login & registration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLModel, asyncpg |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| LLM | OpenRouter API (configurable model) |
| Frontend | Next.js 16 (TypeScript), Tailwind CSS |
| Orchestration | Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- An [OpenRouter API key](https://openrouter.ai/)

---

## Quickstart (Docker Compose)

### 1. Clone the repository

```bash
git clone https://github.com/Arfiadi/app-interview.git
cd app-interview
```

### 2. Create `.env` file

Create a `.env` file in the **repository root**:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
LLM_MODEL=openai/gpt-4o-mini        # or any OpenRouter model
SECRET_KEY=change_this_to_a_strong_secret_key
```

### 3. Run the application

**Windows:**
```batch
run_app.bat
```

**Linux/macOS:**
```bash
docker-compose up --build -d
```

### 4. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3005 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | ✅ |
| `LLM_MODEL` | OpenRouter model ID (e.g. `openai/gpt-4o-mini`) | ✅ |
| `SECRET_KEY` | JWT signing secret | ✅ |
| `DATABASE_URL` | PostgreSQL connection string (auto-set in Docker) | Auto |
| `REDIS_URL` | Redis connection string (auto-set in Docker) | Auto |

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt

# Run migrations & server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> Make sure PostgreSQL and Redis are running locally, and set `DATABASE_URL` / `REDIS_URL` in `.env`.

### Frontend

```bash
cd frontend-app
npm ci
npm run dev      # http://localhost:3000
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/token` | Login (returns JWT) |

### Interview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/interview/generate` | Generate questions for a session |

**Request body:**
```json
{
  "job_role": "Software Engineer",
  "experience_level": "Mid",
  "industry": "FinTech",
  "num_questions": 5
}
```

### Scoring

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/scoring/submit` | Submit a single answer |
| `POST` | `/scoring/evaluate` | Evaluate full session (returns scores & feedback) |

### History

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/history/all` | Get all past sessions |
| `GET` | `/history/{session_id}` | Get single session detail |
| `DELETE` | `/history/delete` | Delete a session |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/summary` | Overall stats (total sessions, avg/best score, top role) |
| `GET` | `/analytics/trend?limit=10` | Score trend over last N sessions |

---

## Running Tests

```bash
pytest -c backend/pytest.ini
```

All 7 tests should pass:

```
7 passed in ~10s
```

---

## Project Structure

```
app-interview/
├── backend/
│   ├── api/              # FastAPI routers (auth, interview, scoring, history, analytics)
│   ├── core/             # Config, database, security, deps
│   ├── models/           # SQLModel DB models & Pydantic schemas
│   ├── services/         # LLM feedback, OpenRouter client, similarity service
│   ├── tests/            # Pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend-app/
│   ├── src/
│   │   ├── pages/        # Next.js pages & API routes
│   │   ├── components/   # UI components
│   │   ├── context/      # AuthContext
│   │   ├── hooks/        # useApi, useInterviewSession
│   │   └── styles/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yaml
├── .env                  # (not committed — create manually)
└── run_app.bat           # Windows one-click launcher
```

---

## Changelog

### v0.2.0
- ♻️ Refactored scoring to use OpenRouter API (removed PyTorch / sentence-transformers — saves ~1.5 GB)
- 🗄️ Migrated session storage from JSON file to PostgreSQL
- 📊 Added analytics dashboard (score trends, KPI cards)
- 🔐 Added JWT authentication (register / login)
- 🧪 Added full pytest test suite (7 tests)
- 🐳 Updated Docker Compose with PostgreSQL & Redis services
- 🔄 Frontend migrated from JavaScript to TypeScript

### v0.1.0
- Initial release: FastAPI backend + Next.js frontend
- Local sentence-transformers model for similarity scoring

---

## Contributing

Fork the repo, create a feature branch, and open a Pull Request. Keep dependency upgrades in separate PRs.

---

## License

MIT

---

## Contact

Repo owner: **Arfiadi** — [GitHub](https://github.com/Arfiadi)
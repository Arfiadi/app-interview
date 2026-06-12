<div align="center">

<img src="https://via.placeholder.com/1000x120/0f172a/38bdf8?text=AI+Interview+Coach" alt="AI Interview Coach Banner" width="100%">

<br/>

# 🎙️ AI Interview Coach
**Elevate your career with AI-driven interview simulations.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

[**Live Application**](https://app-interview-xi.vercel.app/) • [**Backend API (Swagger)**](https://interview-backend-737275753890.asia-southeast1.run.app/docs) • [**Report a Bug**](https://github.com/Arfiadi/app-interview/issues)

</div>

---

## 🌟 Executive Summary

**AI Interview Coach** is a state-of-the-art practice platform designed to simulate high-stakes professional interviews. By leveraging advanced Large Language Models (LLMs) via OpenRouter, it provides dynamic, role-specific questions and instantaneous, human-like qualitative feedback—empowering candidates to land their dream jobs.

---

## ✨ Premium Features

| Feature | Description |
| :--- | :--- |
| 🎯 **Dynamic Tailoring** | Auto-generates nuanced questions based on your specific **Job Role**, **Industry**, and **Experience Level**. |
| 🧠 **Semantic NLP Scoring** | Answers are evaluated for conceptual accuracy (0-100) using AI, moving beyond simple keyword matching. |
| 💡 **STAR-Method Coaching** | Receive actionable, structured feedback. The AI rewrites your answers into compelling, professional narratives. |
| 📊 **Advanced Analytics** | Visualize your growth through an interactive dashboard mapping your score trends and career focus areas. |
| 🖨️ **Exportable Portfolios** | Generate clean, print-ready PDF reports of your interview performance for personal archiving or mentoring. |

---

## 🏗️ System Architecture

Our platform utilizes a highly scalable, asynchronous microservices architecture to ensure real-time AI processing without latency bottlenecks.

```mermaid
graph LR
    User([Candidate]) <--> |REST API| UI[Next.js Frontend\nHosted on Vercel]
    UI <--> |Async HTTP| API[FastAPI Backend\nGoogle Cloud Run]
    
    API --> |Session Cache| Redis[(Upstash Redis)]
    API --> |Persistent Storage| DB[(Neon PostgreSQL)]
    
    API <--> |LLM Prompts| AI[OpenRouter API\nGPT / DeepSeek]
```

---

## 🚀 Live Deployment

Experience the application in production:

- **Web Interface:** [app-interview-xi.vercel.app](https://app-interview-xi.vercel.app/)
- **Core Backend:** [interview-backend-737275753890.asia-southeast1.run.app](https://interview-backend-737275753890.asia-southeast1.run.app)

---

## ⚙️ Environment Variables

Before running the application, create a `.env` file in the repository root:

| Variable | Description | Required |
|---|---|:---:|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | ✅ |
| `LLM_MODEL` | OpenRouter model ID (e.g. `openai/gpt-4o-mini`) | ✅ |
| `SECRET_KEY` | JWT signing secret | ✅ |
| `DATABASE_URL` | PostgreSQL connection string (auto-set in Docker) | Auto |
| `REDIS_URL` | Redis connection string (auto-set in Docker) | Auto |

---

## 💻 Developer Setup

Get the environment up and running on your local machine in under 2 minutes.

### 1. Ignition (Via Docker) - Recommended

Boot up the entire stack—Frontend, Backend, Database, and Cache—with a single command:

**Windows:**
```batch
run_app.bat
```

**Linux / macOS:**
```bash
docker-compose up --build -d
```

> **Access Points:**
> - Frontend: `http://localhost:3005`
> - Backend Swagger UI: `http://localhost:8000/docs`

### 2. Run Manually (Without Docker)

<details>
<summary><strong>Backend Setup</strong></summary>

```bash
cd backend
python -m venv .venv

# Activate Virtual Env (Windows)
.venv\Scripts\activate
# Activate Virtual Env (Mac/Linux)
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*(Ensure PostgreSQL and Redis are running locally and add `DATABASE_URL` / `REDIS_URL` to `.env`)*
</details>

<details>
<summary><strong>Frontend Setup</strong></summary>

```bash
cd frontend-app
npm install
npm run dev
```
</details>

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/token` | Login (returns JWT) |

### Interview & Scoring
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/interview/generate` | Generate questions for a session |
| `POST` | `/scoring/submit` | Submit a single answer |
| `POST` | `/scoring/evaluate` | Evaluate full session (returns scores & feedback) |

### History & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/history/all` | Get all past sessions |
| `GET` | `/history/{session_id}` | Get single session detail |
| `DELETE` | `/history/delete` | Delete a session |
| `GET` | `/analytics/summary` | Overall stats (total sessions, avg/best score, top role) |
| `GET` | `/analytics/trend?limit=10` | Score trend over last N sessions |

---

## 📁 Project Structure

```text
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
└── run_app.bat           # Windows one-click launcher
```

---

## 🧪 Testing

The backend includes a comprehensive, asynchronous Pytest test suite with an in-memory SQLite database.

```bash
cd backend
pytest -c pytest.ini
```

---

## 📝 Changelog

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

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Architected and Developed by <strong>Arfiadi</strong></p>
  <a href="https://github.com/Arfiadi">
    <img src="https://img.shields.io/github/followers/Arfiadi?label=Follow&style=social" alt="GitHub" />
  </a>
</div>
<div align="center">
  <h1>🎙️ AI Interview Coach</h1>
  <p><em>An intelligent, AI-powered interview practice platform. Generate role-specific questions, submit answers, and receive instant semantic scoring and qualitative STAR-method feedback.</em></p>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel)](https://vercel.com/)
</div>

---

## 🚀 Live Deployment

The application is fully deployed and accessible online:

- **Frontend (Web App):** [https://app-interview-xi.vercel.app/](https://app-interview-xi.vercel.app/)
- **Backend API:** [https://interview-backend-737275753890.asia-southeast1.run.app](https://interview-backend-737275753890.asia-southeast1.run.app)
- **API Documentation (Swagger):** [Backend Docs](https://interview-backend-737275753890.asia-southeast1.run.app/docs)

---

## ✨ Key Features

- 🎯 **Dynamic Question Generation** — Tailored interview questions based on Job Role, Industry, and Experience Level, powered by advanced LLMs (OpenRouter).
- 🧠 **Semantic Scoring & Insights** — Answers are evaluated semantically against an AI-generated ideal answer, scoring from 0 to 100 based on conceptual accuracy, not just keyword matching.
- 💡 **Constructive Feedback (STAR Method)** — Get qualitative feedback on your answers with a re-written, professional example using the STAR (Situation, Task, Action, Result) framework.
- 📊 **Analytics Dashboard** — Track your progress over time with interactive charts showing your average score, top roles, and recent session trends.
- 🖨️ **PDF Report Export** — Print or save your interview evaluation reports cleanly with an optimized print layout.
- 🔐 **Secure Authentication** — JWT-based registration and login system to protect your personal interview history.

---

## 🏗️ Tech Stack & Architecture

This project is built using a modern, scalable, and fully asynchronous architecture:

### Frontend
- **Framework:** Next.js (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel Serverless Functions

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM & Database:** SQLModel, PostgreSQL (Neon DB via `asyncpg`)
- **Caching & State:** Redis (Upstash)
- **AI Integration:** OpenRouter API (supports GPT-4, DeepSeek, Claude, etc.)
- **Deployment:** Google Cloud Run

---

## 💻 Local Development Setup

You can run the application locally using Docker (Recommended) or manually.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Docker setup)
- Node.js & Python 3.11+ (for Manual setup)
- An [OpenRouter API key](https://openrouter.ai/)

### 1. Environment Configuration

Create a `.env` file in the root of the project:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
LLM_MODEL=openai/gpt-4o-mini        # Or your preferred OpenRouter model
SECRET_KEY=change_this_to_a_strong_secret_key
```

### 2. Run with Docker Compose (Recommended)

**Windows:**
```batch
run_app.bat
```

**Linux / macOS:**
```bash
docker-compose up --build -d
```

Access the local services:
- **Frontend:** `http://localhost:3005`
- **Backend API:** `http://localhost:8000`

### 3. Run Manually (Without Docker)

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

## 🧪 Testing

The backend includes a comprehensive, asynchronous Pytest test suite with an in-memory SQLite database.

```bash
cd backend
pytest -c pytest.ini
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License.

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Arfiadi">Arfiadi</a></p>
</div>
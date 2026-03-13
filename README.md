# AI Interview

A lightweight AI-powered interview practice app.

The repository contains:
- backend: FastAPI backend that generates interview questions, ideal answers, accepts user answers, computes similarity/insights and requests qualitative feedback from an LLM.
- frontend-app: Next.js frontend that interacts with the backend.
- docker-compose.yaml to run backend and frontend together.

Features
- Generate role- and experience-specific interview questions
- Generate ideal/reference answers
- Submit answers and evaluate sessions with similarity scoring, keyword/topic insights, and LLM feedback
- In-memory session store and persisted history (backend/data/history.json)

Tech stack
- Backend: Python 3.10, FastAPI, uvicorn, sentence-transformers
- Frontend: Next.js (Node 18)
- Orchestration: docker-compose

Environment variables
Based on docker-compose and code, the project expects the following environment variables (create a .env at repo root or backend/.env):

OPENROUTER_API_KEY=your_openrouter_key
LLM_MODEL=your_model_name
SECRET_KEY=change_this_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
PYTHON_API_URL=http://backend:8000

Quickstart (recommended: Docker Compose)
1. Create a .env file in the repository root with the variables above.
2. Build and start:
   docker-compose up --build
3. After startup:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

Local development
Backend
1. cd backend
2. python -m venv .venv
3. source .venv/bin/activate   (Windows: .venv\Scripts\activate)
4. pip install -r requirements.txt
5. Create .env with the variables above
6. Run:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
7. Root endpoint responds with {"message": "AI Interview Backend is running 🚀"}

Notes: the backend lazy-loads a sentence-transformers model by default: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2". The first load may take time and use significant memory.

Frontend
1. cd frontend-app
2. npm ci
3. For development:
   npm run dev
   - Default dev port: 3000
4. For production build:
   npm run build
   npm run start

Build / Docker notes
- backend/Dockerfile: python:3.10-slim, exposes port 8000, runs uvicorn main:app
- frontend-app/Dockerfile: multi-stage Node 18 build, produces a standalone Next.js output and runs server.js inside container. The Dockerfile sets PORT=3001 in the image; docker-compose maps frontend to host port 3000 — verify server port configuration if you encounter mismatches.
- docker-compose.yaml maps backend service to port 8000 and frontend to port 3000, and sets PYTHON_API_URL for the frontend to http://backend:8000

API (examples)
- Generate interview
  POST /interview/generate
  Body:
  {
    "job_role": "Software Engineer",
    "experience_level": "Mid",
    "industry": "FinTech",
    "num_questions": 5
  }
  Response:
  {
    "session_id": "uuid",
    "questions": ["Q1", "Q2", ...]
  }

- Submit an answer
  POST /scoring/submit
  Body:
  {
    "session_id": "uuid",
    "question_index": 0,
    "answer": "My answer text..."
  }

- Evaluate session
  POST /scoring/evaluate
  Body:
  { "session_id": "uuid" }
  Response includes per-question similarity_score, keywords, topics, feedback, and overall_score.

Data & persistence
- Active sessions: in-memory (backend/utils/model_loader.cache_session_store)
- Evaluations are persisted to backend/data/history.json using atomic writes (backend/utils/model_loader.persist_result_to_history)

Contributing
- Fork the repo, create a branch, open a PR. Keep dependency and model upgrades in separate PRs.

License
- No LICENSE 

Contact
- Repo owner: Arfiadi
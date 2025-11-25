# app/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from backend.api import interview, scoring, history


app = FastAPI(title="AI Interview Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only; lock this down for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router, prefix="/interview", tags=["interview"])
app.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
app.include_router(history.router, prefix="/history", tags=["history"])


@app.get("/")
def root():
    return {"message": "AI Interview Backend is running"}

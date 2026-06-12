import sys
import os

# Menambahkan root directory ke sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.core.database import init_db

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and run migrations
    await init_db()
    
    
    yield

# 1. IMPORT ROUTER AUTH DI SINI
from backend.api import interview, scoring, history, auth, analytics 

app = FastAPI(title="AI Interview Backend", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3005",
        "https://*.vercel.app",
        "https://app-interview.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DAFTARKAN ROUTER AUTH
app.include_router(auth.router, prefix="/auth", tags=["auth"]) 

# Router lainnya
app.include_router(interview.router, prefix="/interview", tags=["interview"])
app.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

@app.get("/")
def root():
    return {"message": "AI Interview Backend is running 🚀"}

@app.get("/health")
def health_check():
    """Health check endpoint for Cloud Run."""
    return {"status": "healthy", "version": "0.2.0"}
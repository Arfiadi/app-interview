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
    
    # Pre-load sentence-transformer embedding model to eliminate cold-start latency
    try:
        from backend.utils.model_loader import get_embedding_model
        import asyncio
        await asyncio.to_thread(get_embedding_model)
        print("Embedding model loaded successfully.")
    except Exception as e:
        print(f"Failed to pre-load embedding model: {e}")
        
    yield

# 1. IMPORT ROUTER AUTH DI SINI
from backend.api import interview, scoring, history, auth, analytics 

app = FastAPI(title="AI Interview Backend", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
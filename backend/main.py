import sys
import os

# Menambahkan root directory ke sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# 1. IMPORT ROUTER AUTH DI SINI
from backend.api import interview, scoring, history, auth 

app = FastAPI(title="AI Interview Backend", version="1.0")

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

@app.get("/")
def root():
    return {"message": "AI Interview Backend is running 🚀"}
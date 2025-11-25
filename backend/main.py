import sys
import os

# --- FIX PENTING: Tambahkan root project ke path python ---
# Ini agar python bisa menemukan folder 'backend' sebagai module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# -----------------------------------------------------------

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env dari folder backend atau root
load_dotenv() 

# Import Router
from backend.api import interview, scoring, history

app = FastAPI(title="AI Interview Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router, prefix="/interview", tags=["interview"])
app.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
app.include_router(history.router, prefix="/history", tags=["history"])

@app.get("/")
def root():
    return {"message": "Backend is running!"}
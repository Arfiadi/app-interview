import sys
import os

# Tambahkan root directory ke sys.path agar modul 'backend' bisa dikenali
# Ini penting agar import "from backend.api..." tetap jalan meskipun dijalankan dari dalam folder backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env
load_dotenv()

# Import Router dengan path absolut (karena sys.path sudah diatur)
from backend.api import interview, scoring, history

app = FastAPI(title="AI Interview Backend", version="1.0")

# Konfigurasi CORS (Agar Frontend Next.js bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development, boleh "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan Router
app.include_router(interview.router, prefix="/interview", tags=["interview"])
app.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
app.include_router(history.router, prefix="/history", tags=["history"])

@app.get("/")
def root():
    return {"message": "AI Interview Backend is running 🚀"}
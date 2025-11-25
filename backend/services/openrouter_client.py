import os
import requests
import logging
from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

load_dotenv()

# --- PERBAIKAN PENTING ---
# Gunakan URL endpoint yang benar (tanpa /chat/completions di BASE_URL agar fleksibel)
# atau pastikan strukturnya tepat.
# Dokumentasi OpenRouter: https://openrouter.ai/api/v1/chat/completions
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions" 

HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    # Header tambahan yang disarankan OpenRouter
    "HTTP-Referer": "http://localhost:3000", 
    "X-Title": "InterviewCoach Local"
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_session():
    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["POST"]
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("https://", adapter)
    return session

def ask_openrouter(model: str, messages: list, temperature: float = 0.7):
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1000, # Tambahkan limit token agar aman
    }
    
    session = get_session()

    try:
        logger.info(f"Mengirim request ke OpenRouter ({model})...")
        # Debugging: Print URL dan Model
        logger.info(f"URL: {BASE_URL}")
        
        response = session.post(BASE_URL, json=payload, headers=HEADERS, timeout=45)
        
        # Debugging: Cek respon jika error
        if response.status_code != 200:
            logger.error(f"OpenRouter Error {response.status_code}: {response.text}")
            return None

        response.raise_for_status()
        data = response.json()
        
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
        else:
            logger.warning(f"Respon kosong: {data}")
            return None

    except Exception as e:
        logger.error(f"Gagal menghubungi AI: {e}")
        return None
    finally:
        session.close()

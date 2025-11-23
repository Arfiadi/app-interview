# app/backend/services/openrouter_client.py
import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

def ask_openrouter(model: str, messages: list, temperature: float = 0.0, max_retries: int = 3):
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    for attempt in range(max_retries):
        try:
            r = requests.post(BASE_URL, json=payload, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                data = r.json()
                # OpenRouter common response structure:
                return data["choices"][0]["message"]["content"]
            elif r.status_code == 429:
                time.sleep(1.5 * (attempt + 1))
                continue
            else:
                r.raise_for_status()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(1.0)
    return None

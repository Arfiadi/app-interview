# app/backend/services/llm_feedback.py
from services.openrouter_client import ask_openrouter
import os

MODEL = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")

FEEDBACK_PROMPT = """
Anda adalah interview coach. Berikan feedback singkat 2-3 kalimat:
Pertanyaan: {question}
Jawaban user: {user_answer}
Jawaban ideal: {ideal_answer}

Format:
- Kekuatan:
- Perbaikan:
Ringkas dan actionable.
"""

def get_feedback(question, user_answer, ideal_answer):
    prompt = FEEDBACK_PROMPT.format(question=question, user_answer=user_answer, ideal_answer=ideal_answer)
    resp = ask_openrouter(MODEL, [{"role":"user","content":prompt}], temperature=0.0)
    return resp or ""

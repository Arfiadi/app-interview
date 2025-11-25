# app/backend/services/llm_ideal_answer.py
from backend.services.openrouter_client import ask_openrouter
import os

MODEL = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")

PROMPT = """
Berikan jawaban ideal singkat (4-6 kalimat) untuk pertanyaan interview berikut.
Pertanyaan: {question}
Role: {role}
Experience: {exp}
Industry: {industry}

Jawaban harus jelas, relevan, dan dalam bahasa Indonesia.
"""
def generate_ideal_answer(question, role, exp, industry):
    prompt = PROMPT.format(question=question, role=role, exp=exp, industry=industry)
    resp = ask_openrouter(MODEL, [{"role":"user", "content": prompt}], temperature=0.0)
    return resp or ""

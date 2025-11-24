# app/backend/services/llm_question_generator.py
from backend.services.openrouter_client import ask_openrouter

import json
import os

MODEL = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")  # or model you prefer

PROMPT_TEMPLATE = """
Buat {n} pertanyaan interview singkat, relevan, dan praktis untuk:
Role: {role}
Experience level: {exp}
Industry: {industry}

Kembalikan output dalam format JSON array (contoh: ["Q1","Q2",...])
"""
def generate_questions(role, exp, industry, n=5):
    prompt = PROMPT_TEMPLATE.format(n=n, role=role, exp=exp, industry=industry)
    resp = ask_openrouter(MODEL, [{"role": "user", "content": prompt}], temperature=0.0)
    if not resp:
        # fallback simple questions
        return [
            f"Ceritakan tentang pengalaman Anda terkait {role}",
            f"Apa motivasi Anda melamar posisi {role}?",
            f"Ceritakan tantangan teknis yang pernah Anda hadapi",
            f"Bagaimana Anda bekerja dalam tim?",
            f"Apa prestasi yang paling membanggakan?"
        ][:n]
    # try parse JSON
    try:
        parsed = json.loads(resp)
        if isinstance(parsed, list):
            return parsed[:n]
    except:
        # try to split by newline
        lines = [l.strip("- ").strip() for l in resp.splitlines() if l.strip()]
        return lines[:n]

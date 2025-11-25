from backend.services.openrouter_client import ask_openrouter
import json
import os
import re

MODEL = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")

# Load template dari file agar rapi
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "../data/prompt_templates/generate_questions.txt")

def load_template():
    try:
        with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except:
        return """
        Buat {n} pertanyaan interview untuk {role} ({exp}, {industry}).
        Output JSON Array string saja.
        """

def clean_json_string(s: str) -> str:
    """
    Membersihkan string dari format Markdown code block ```json ... ```
    yang sering ditambahkan oleh LLM.
    """
    if not s: 
        return ""
    # Hapus ```json di awal dan ``` di akhir
    pattern = r"```json\s*(.*?)\s*```"
    match = re.search(pattern, s, re.DOTALL)
    if match:
        return match.group(1)
    # Coba hapus ``` saja jika tanpa label json
    return s.replace("```", "").strip()

def generate_questions(role, exp, industry, n=5):
    template = load_template()
    prompt = template.format(n=n, role=role, exp=exp, industry=industry)
    
    resp = ask_openrouter(MODEL, [{"role": "user", "content": prompt}], temperature=0.7)
    
    if not resp:
        return get_fallback_questions(role, n)

    # 1. Bersihkan output AI
    clean_resp = clean_json_string(resp)

    # 2. Coba Parse JSON
    try:
        parsed = json.loads(clean_resp)
        if isinstance(parsed, list):
            # Pastikan elemennya string semua
            return [str(q) for q in parsed[:n]]
    except json.JSONDecodeError:
        print(f"[WARN] Gagal parse JSON dari AI. Raw: {resp[:50]}...")
        # Fallback: Coba split by newline jika formatnya list biasa
        lines = [l.strip("- ").strip() for l in resp.splitlines() if l.strip() and "?" in l]
        if len(lines) >= 3:
            return lines[:n]
            
    # 3. Jika gagal total, gunakan fallback statis
    return get_fallback_questions(role, n)

def get_fallback_questions(role, n):
    """Pertanyaan cadangan jika AI mati/error"""
    base = [
        f"Ceritakan pengalaman Anda yang paling relevan dengan posisi {role}.",
        f"Apa tantangan terbesar yang pernah Anda hadapi dalam peran {role}?",
        "Bagaimana Anda menangani konflik atau perbedaan pendapat dalam tim?",
        "Jelaskan proyek tersulit yang pernah Anda selesaikan.",
        "Mengapa Anda tertarik dengan industri ini?"
    ]
    return base[:n]
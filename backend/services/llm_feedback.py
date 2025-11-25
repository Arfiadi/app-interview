import os
from backend.services.openrouter_client import ask_openrouter

# Load Model dari Env
MODEL = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")

# Load Template
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "../data/prompt_templates/feedback_template.txt")

def load_template():
    try:
        with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error loading template: {e}")
        # Fallback template jika file tidak ketemu
        return """
        Pertanyaan: {question}
        Jawaban User: {user_answer}
        Jawaban Ideal: {ideal_answer}
        Berikan feedback:
        ### Kekuatan
        ### Perbaikan
        """

def get_feedback(question, user_answer, ideal_answer, role="General", exp="Mid", industry="General"):
    """
    Menghasilkan feedback menggunakan LLM.
    Sekarang mendukung konteks Role, Exp, dan Industry untuk hasil lebih tajam.
    """
    template = load_template()
    
    # Formatting prompt dengan data dinamis
    # Kita menggunakan .format() dengan parameter yang aman
    try:
        prompt = template.format(
            question=question, 
            user_answer=user_answer, 
            ideal_answer=ideal_answer,
            role=role,
            exp=exp,
            industry=industry
        )
    except KeyError:
        # Fallback jika template memiliki placeholder yang tidak sesuai
        prompt = f"Berikan feedback interview untuk posisi {role}.\nPertanyaan: {question}\nJawaban: {user_answer}"

    resp = ask_openrouter(MODEL, [{"role": "user", "content": prompt}], temperature=0.7)
    return resp or "Maaf, tidak dapat menghasilkan feedback saat ini."
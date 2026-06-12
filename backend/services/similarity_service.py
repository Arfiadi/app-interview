# app/backend/services/similarity_service.py
import os
import logging
from backend.services.openrouter_client import ask_openrouter_async

# Load Model dari Env
MODEL = os.getenv("LLM_MODEL", "deepseek/deepseek-chat")
logger = logging.getLogger(__name__)

async def compute_similarity_score(text_a: str, text_b: str, question: str = "") -> int:
    """
    Returns similarity as integer 0-100 using OpenRouter API.
    """
    if not text_a or not text_a.strip():
        return 0
    if not text_b or not text_b.strip():
        return 0

    prompt = f"""
Tugas: Berikan skor kemiripan semantik/konseptual antara Jawaban Pengguna dan Jawaban Ideal dalam skala 0 sampai 100.
Konteks Pertanyaan: {question}
Jawaban Pengguna: {text_a}
Jawaban Ideal: {text_b}

Kriteria Penilaian:
- 100: Jawaban Pengguna sepenuhnya tepat, mencakup seluruh poin penting atau esensi dari Jawaban Ideal.
- 70-99: Jawaban Pengguna hampir lengkap, mencakup sebagian besar poin penting, namun ada sedikit detail kecil yang terlewat.
- 40-69: Jawaban Pengguna relevan tetapi kurang lengkap, hanya mencakup sebagian kecil poin penting dari Jawaban Ideal.
- 1-39: Jawaban Pengguna kurang relevan atau salah arah, namun masih ada sedikit kata kunci atau konteks yang berhubungan.
- 0: Jawaban Pengguna kosong, sama sekali salah, atau tidak relevan dengan Jawaban Ideal.

Keluarkan HANYA nilai angka integer antara 0 dan 100 (misalnya: 85), tanpa penjelasan, tanpa format markdown (seperti ``` atau **), dan tanpa teks tambahan lainnya.
"""
    try:
        resp = await ask_openrouter_async(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        if resp:
            # Parse response to get the score
            cleaned_resp = resp.strip()
            # extract only digits
            digits = ''.join(c for c in cleaned_resp if c.isdigit())
            if digits:
                score = int(digits)
                # clamp to 0-100
                return max(0, min(100, score))
    except Exception as e:
        logger.error(f"Gagal menghitung similarity score menggunakan OpenRouter: {e}")

    # Fallback ke pencocokan kata dasar (Jaccard Similarity) jika API error
    words_a = set(text_a.lower().split())
    words_b = set(text_b.lower().split())
    if not words_a or not words_b:
        return 0
    intersection = words_a.intersection(words_b)
    union = words_a.union(words_b)
    fallback_score = int(round((len(intersection) / len(union)) * 100))
    return fallback_score


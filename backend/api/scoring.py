from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio
from backend.services.similarity_service import compute_similarity_score
from backend.services.nlp_insights import extract_keywords_and_missing, topic_coverage_simple
from backend.services.llm_feedback import get_feedback
from backend.utils.model_loader import cache_session_store, persist_result_to_history

router = APIRouter()

# --- Request Models ---
class AnswerSubmitRequest(BaseModel):
    session_id: str
    question_index: int
    answer: str

class EvaluateRequest(BaseModel):
    session_id: str

# --- Endpoints ---

@router.post("/submit")
def submit_answer(req: AnswerSubmitRequest):
    """
    Menyimpan jawaban user untuk pertanyaan tertentu ke dalam session cache.
    """
    session = cache_session_store.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Validasi index pertanyaan
    if req.question_index < 0 or req.question_index >= len(session["questions"]):
        raise HTTPException(status_code=400, detail="Invalid question index")
    
    # Simpan jawaban di memori sementara
    session["answers"][req.question_index] = req.answer
    return {"status": "ok"}

@router.post("/evaluate")
async def evaluate_session(req: EvaluateRequest):
    """
    Mengevaluasi seluruh sesi wawancara setelah user selesai menjawab semua pertanyaan.
    Menghitung skor similarity, keyword matching, dan meminta feedback kualitatif dari LLM.
    """
    session = cache_session_store.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 1. AMBIL KONTEKS SESI (PENTING UNTUK FEEDBACK AI)
    # Default value disediakan untuk keamanan jika data tidak lengkap
    job_role = session.get("job_role", "General")
    experience_level = session.get("experience_level", "Mid")
    industry = session.get("industry", "General")

    questions = session["questions"]
    ideal_answers = session["ideal_answers"]
    user_answers = session["answers"]
    
    # A. Buat tasks untuk feedback LLM secara paralel (I/O Bound)
    feedback_tasks = []
    for idx, q in enumerate(questions):
        user_ans = user_answers[idx] or ""
        ideal_ans = ideal_answers[idx] or ""
        feedback_tasks.append(
            get_feedback(
                question=q, 
                user_answer=user_ans, 
                ideal_answer=ideal_ans,
                role=job_role,
                exp=experience_level,
                industry=industry
            )
        )
    
    feedbacks = await asyncio.gather(*feedback_tasks)
    
    results = []
    similarity_scores = []
    
    # B. Hitung kesamaan & analisis NLP lokal
    for idx, q in enumerate(questions):
        user_ans = user_answers[idx] or ""
        ideal_ans = ideal_answers[idx] or ""
        
        # A. Hitung Cosine Similarity (Kuantitatif)
        sim = compute_similarity_score(user_ans, ideal_ans)
        similarity_scores.append(sim)
        
        # B. Analisis Keyword (NLP)
        keywords = extract_keywords_and_missing(user_ans, ideal_ans)
        
        # C. Analisis Topik (NLP Simple)
        topics = topic_coverage_simple(ideal_ans, user_ans)
        
        # D. Ambil feedback hasil LLM
        feedback = feedbacks[idx]
        
        # Kumpulkan hasil per pertanyaan
        results.append({
            "question": q,
            "user_answer": user_ans,
            "ideal_answer": ideal_ans,
            "similarity_score": sim,
            "keywords": keywords,
            "topics": topics,
            "feedback": feedback
        })
    
    # 3. HITUNG SKOR AKHIR (RATA-RATA)
    overall = round(sum(similarity_scores) / len(similarity_scores), 2) if similarity_scores else 0.0
    
    final_result = {
        "session_id": req.session_id,
        "overall_score": overall,
        "results": results,
        "meta": {
            "job_role": job_role,
            "experience_level": experience_level,
            "industry": industry
        }
    }
    
    # 4. SIMPAN KE RIWAYAT (HISTORY.JSON)
    persist_result_to_history(final_result, session_meta={
        "job_role": job_role,
        "experience_level": experience_level,
        "industry": industry
    })
    
    return final_result
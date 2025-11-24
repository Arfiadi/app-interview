from fastapi import APIRouter, HTTPException
import uuid

# Import dari struktur baru yang lebih bersih
from backend.models.interview import InterviewStartRequest
from backend.services.llm_question_generator import generate_questions
from backend.services.llm_ideal_answer import generate_ideal_answer
from backend.utils.model_loader import cache_session_store

router = APIRouter()

@router.post("/generate")
def generate_interview(req: InterviewStartRequest):
    try:
        # 1. Generate Pertanyaan via Service
        questions = generate_questions(
            req.job_role,
            req.experience_level,
            req.industry,
            req.num_questions
        )
        
        # 2. Generate Jawaban Ideal (Background Process idealnya, tapi sync untuk MVP)
        ideal_answers = [
            generate_ideal_answer(q, req.job_role, req.experience_level, req.industry)
            for q in questions
        ]
        
        # 3. Simpan Session di Cache
        session_id = str(uuid.uuid4())
        cache_session_store[session_id] = {
            "job_role": req.job_role,
            "experience_level": req.experience_level,
            "industry": req.industry,
            "questions": questions,
            "ideal_answers": ideal_answers,
            "answers": [None] * len(questions)
        }
        
        return {"session_id": session_id, "questions": questions}
    except Exception as e:
        # Log error sebenarnya di server logs
        print(f"[ERROR] Generate Interview: {e}")
        raise HTTPException(status_code=500, detail="Gagal membuat sesi wawancara.")
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

from backend.services.llm_question_generator import generate_questions
from backend.services.llm_ideal_answer import generate_ideal_answer
from backend.utils.model_loader import cache_session_store

router = APIRouter()


class InterviewStartRequest(BaseModel):
    job_role: str
    experience_level: str
    industry: str
    num_questions: int = 5


@router.post("/generate")
def generate_interview(req: InterviewStartRequest):
    try:
        questions = generate_questions(
            req.job_role,
            req.experience_level,
            req.industry,
            req.num_questions
        )
        ideal_answers = [
            generate_ideal_answer(q, req.job_role, req.experience_level, req.industry)
            for q in questions
        ]

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
        raise HTTPException(status_code=500, detail=str(e))

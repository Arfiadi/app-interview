from fastapi import APIRouter, HTTPException, Depends
import uuid
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

# Import dari layer Services, Core, Models, dan Deps
from backend.models.interview import InterviewStartRequest
from backend.models.db_models import SessionDB, UserDB
from backend.services.llm_question_generator import generate_questions
from backend.services.llm_ideal_answer import generate_ideal_answer
from backend.core.database import get_session
from backend.core.deps import get_current_user
from backend.core.redis import set_session

router = APIRouter()

@router.post("/generate")
async def generate_interview(
    req: InterviewStartRequest,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    try:
        # 1. Generate Pertanyaan via Service
        questions = await generate_questions(
            req.job_role,
            req.experience_level,
            req.industry,
            req.num_questions
        )
        
        # 2. Generate Jawaban Ideal secara paralel
        tasks = [
            generate_ideal_answer(q, req.job_role, req.experience_level, req.industry)
            for q in questions
        ]
        ideal_answers = await asyncio.gather(*tasks)
        
        # 3. Create Session in PostgreSQL
        session_id = str(uuid.uuid4())
        db_session = SessionDB(
            id=uuid.UUID(session_id),
            user_id=current_user.id,
            job_role=req.job_role,
            experience_level=req.experience_level,
            industry=req.industry,
            num_questions=req.num_questions,
            questions=questions,
            ideal_answers=ideal_answers,
            status="active"
        )
        db.add(db_session)
        await db.commit()
        
        # 4. Cache Session in Redis (Expires in 2 hours)
        session_data = {
            "session_id": session_id,
            "user_id": str(current_user.id),
            "job_role": req.job_role,
            "experience_level": req.experience_level,
            "industry": req.industry,
            "questions": questions,
            "ideal_answers": ideal_answers,
            "answers": [None] * len(questions)
        }
        await set_session(session_id, session_data)
        
        return {"session_id": session_id, "questions": questions}
    except Exception as e:
        print(f"[ERROR] Generate Interview: {e}")
        raise HTTPException(status_code=500, detail="Gagal membuat sesi wawancara.")
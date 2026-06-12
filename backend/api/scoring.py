from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

# Services & Helpers
from backend.services.similarity_service import compute_similarity_score
from backend.services.nlp_insights import extract_keywords_and_missing, topic_coverage_simple
from backend.services.llm_feedback import get_feedback
from backend.core.database import get_session
from backend.core.deps import get_current_user
from backend.core.redis import get_session as get_cached_session, set_session, delete_session
from backend.models.db_models import UserDB, SessionDB, AnswerDB, EvaluationDB

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
async def submit_answer(
    req: AnswerSubmitRequest,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Menyimpan jawaban user untuk pertanyaan tertentu ke dalam session cache (Redis) dan PostgreSQL.
    """
    # 1. Fetch session from Redis or DB to verify ownership
    session = await get_cached_session(req.session_id)
    db_session = None
    
    if not session:
        # Fallback to Database
        stmt = select(SessionDB).where(SessionDB.id == uuid.UUID(req.session_id))
        res = await db.execute(stmt)
        db_session = res.scalars().first()
        if not db_session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify ownership
        if db_session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        # Reconstruct session data for cache
        # Fetch other answers
        ans_stmt = select(AnswerDB).where(AnswerDB.session_id == db_session.id)
        ans_res = await db.execute(ans_stmt)
        db_answers = {ans.question_index: ans.user_answer for ans in ans_res.scalars().all()}
        
        session = {
            "session_id": str(db_session.id),
            "user_id": str(db_session.user_id),
            "job_role": db_session.job_role,
            "experience_level": db_session.experience_level,
            "industry": db_session.industry,
            "questions": db_session.questions,
            "ideal_answers": db_session.ideal_answers,
            "answers": [db_answers.get(i, None) for i in range(len(db_session.questions))]
        }
    else:
        # Verify ownership
        if session.get("user_id") != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")

    # 2. Validasi index pertanyaan
    questions = session["questions"]
    if req.question_index < 0 or req.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    # 3. Update jawaban di cache (Redis)
    session["answers"][req.question_index] = req.answer
    await set_session(req.session_id, session)

    # 4. Simpan/Update jawaban di PostgreSQL
    ans_stmt = select(AnswerDB).where(
        AnswerDB.session_id == uuid.UUID(req.session_id),
        AnswerDB.question_index == req.question_index
    )
    ans_res = await db.execute(ans_stmt)
    db_answer = ans_res.scalars().first()
    
    if db_answer:
        db_answer.user_answer = req.answer
        db_answer.submitted_at = datetime.utcnow()
    else:
        db_answer = AnswerDB(
            session_id=uuid.UUID(req.session_id),
            question_index=req.question_index,
            user_answer=req.answer,
            submitted_at=datetime.utcnow()
        )
        
    db.add(db_answer)
    await db.commit()
    
    return {"status": "ok"}

@router.post("/evaluate")
async def evaluate_session(
    req: EvaluateRequest,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Mengevaluasi seluruh sesi wawancara setelah user selesai menjawab semua pertanyaan.
    Menghitung skor similarity, keyword matching, dan meminta feedback kualitatif dari LLM.
    """
    # 1. Fetch session from Redis or DB
    session = await get_cached_session(req.session_id)
    db_session = None
    
    if not session:
        # Fallback to Database
        stmt = select(SessionDB).where(SessionDB.id == uuid.UUID(req.session_id))
        res = await db.execute(stmt)
        db_session = res.scalars().first()
        if not db_session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify ownership
        if db_session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
            
        ans_stmt = select(AnswerDB).where(AnswerDB.session_id == db_session.id)
        ans_res = await db.execute(ans_stmt)
        db_answers = {ans.question_index: ans.user_answer for ans in ans_res.scalars().all()}
        
        session = {
            "session_id": str(db_session.id),
            "user_id": str(db_session.user_id),
            "job_role": db_session.job_role,
            "experience_level": db_session.experience_level,
            "industry": db_session.industry,
            "questions": db_session.questions,
            "ideal_answers": db_session.ideal_answers,
            "answers": [db_answers.get(i, "") for i in range(len(db_session.questions))]
        }
    else:
        # Verify ownership
        if session.get("user_id") != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")

    # 2. AMBIL KONTEKS SESI
    job_role = session.get("job_role", "General")
    experience_level = session.get("experience_level", "Mid")
    industry = session.get("industry", "General")
    questions = session["questions"]
    ideal_answers = session["ideal_answers"]
    user_answers = session["answers"]

    # Buat tasks untuk feedback LLM & similarity scoring secara paralel
    feedback_tasks = []
    similarity_tasks = []
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
        similarity_tasks.append(
            compute_similarity_score(user_ans, ideal_ans, question=q)
        )
    
    # Run both lists of tasks concurrently
    feedbacks, similarity_scores = await asyncio.gather(
        asyncio.gather(*feedback_tasks),
        asyncio.gather(*similarity_tasks)
    )
    
    results = []
    
    # Analisis NLP lokal & Gabungkan hasil
    for idx, q in enumerate(questions):
        user_ans = user_answers[idx] or ""
        ideal_ans = ideal_answers[idx] or ""
        sim = similarity_scores[idx]
        
        # Analisis Keyword
        keywords = extract_keywords_and_missing(user_ans, ideal_ans)
        
        # Analisis Topik
        topics = topic_coverage_simple(ideal_ans, user_ans)
        
        # Ambil feedback hasil LLM
        feedback = feedbacks[idx]
        
        results.append({
            "question": q,
            "user_answer": user_ans,
            "ideal_answer": ideal_ans,
            "similarity_score": sim,
            "keywords": keywords,
            "topics": topics,
            "feedback": feedback
        })
    
    # Hitung skor akhir
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
    
    # 3. SIMPAN KE POSTGRESQL (tabel evaluations)
    # Hapus evaluasi lama jika sudah pernah di-evaluate sebelumnya
    eval_del_stmt = select(EvaluationDB).where(EvaluationDB.session_id == uuid.UUID(req.session_id))
    eval_del_res = await db.execute(eval_del_stmt)
    old_eval = eval_del_res.scalars().first()
    if old_eval:
        await db.delete(old_eval)
        
    db_eval = EvaluationDB(
        session_id=uuid.UUID(req.session_id),
        overall_score=overall,
        per_question_results=results,
        evaluated_at=datetime.utcnow()
    )
    db.add(db_eval)

    # 4. UPDATE STATUS SESSION DI POSTGRESQL
    if not db_session:
        stmt = select(SessionDB).where(SessionDB.id == uuid.UUID(req.session_id))
        res = await db.execute(stmt)
        db_session = res.scalars().first()
        
    if db_session:
        db_session.status = "completed"
        db_session.completed_at = datetime.utcnow()
        db.add(db_session)
        
    await db.commit()
    
    # 5. BERSIHKAN CACHE REDIS
    await delete_session(req.session_id)
    
    return final_result
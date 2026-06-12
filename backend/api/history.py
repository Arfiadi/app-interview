from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
import uuid

from backend.core.database import get_session
from backend.core.deps import get_current_user
from backend.models.db_models import UserDB, SessionDB, EvaluationDB

router = APIRouter()

@router.get("/all")
async def get_all_history(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Menampilkan daftar semua sesi wawancara yang telah selesai milik user yang sedang login.
    """
    statement = select(SessionDB).where(
        SessionDB.user_id == current_user.id,
        SessionDB.status == "completed"
    ).options(selectinload(SessionDB.evaluation)).order_by(SessionDB.created_at.desc())
    
    result = await db.execute(statement)
    sessions = result.scalars().all()
    
    history_list = []
    for sess in sessions:
        if sess.evaluation:
            history_list.append({
                "session_id": str(sess.id),
                "overall_score": sess.evaluation.overall_score,
                "meta": {
                    "job_role": sess.job_role,
                    "experience_level": sess.experience_level,
                    "industry": sess.industry
                },
                "results": sess.evaluation.per_question_results,
                "timestamp": sess.completed_at.strftime("%Y-%m-%d %H:%M:%S") if sess.completed_at else sess.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
            
    return history_list

@router.get("/{session_id}")
async def get_history(
    session_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Menampilkan detail lengkap sesi wawancara milik user berdasarkan session_id.
    """
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    stmt = select(SessionDB).where(
        SessionDB.id == session_uuid
    ).options(selectinload(SessionDB.evaluation))
    
    res = await db.execute(stmt)
    sess = res.scalars().first()
    
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if sess.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if not sess.evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found for this session")
        
    return {
        "session_id": str(sess.id),
        "overall_score": sess.evaluation.overall_score,
        "meta": {
            "job_role": sess.job_role,
            "experience_level": sess.experience_level,
            "industry": sess.industry
        },
        "results": sess.evaluation.per_question_results,
        "timestamp": sess.completed_at.strftime("%Y-%m-%d %H:%M:%S") if sess.completed_at else sess.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.delete("/delete/{session_id}")
async def delete_history(
    session_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Menghapus riwayat sesi wawancara.
    """
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id format")

    stmt = select(SessionDB).where(SessionDB.id == session_uuid)
    res = await db.execute(stmt)
    sess = res.scalars().first()
    
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if sess.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    await db.delete(sess)
    await db.commit()
    
    return {"status": "ok", "message": "History deleted successfully"}

@router.post("/save")
async def save_history(
    payload: dict,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Memastikan data riwayat wawancara tersimpan.
    """
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
        
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id format")
        
    stmt = select(SessionDB).where(SessionDB.id == session_uuid)
    res = await db.execute(stmt)
    sess = res.scalars().first()
    
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if sess.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return {"status": "ok", "message": "History already saved automatically"}

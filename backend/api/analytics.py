from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, func, col
from typing import List, Dict, Any
from backend.core.database import get_session
from backend.core.deps import get_current_user
from backend.models.db_models import UserDB, SessionDB, EvaluationDB
from backend.models.user import User

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(
    current_user: UserDB = Depends(get_current_user),
    db=Depends(get_session)
):
    """
    Get overall analytics summary for the logged-in user.
    """
    # 1. Query general stats: total, avg, max
    stmt_general = select(
        func.count(SessionDB.id),
        func.avg(EvaluationDB.overall_score),
        func.max(EvaluationDB.overall_score)
    ).outerjoin(
        EvaluationDB, SessionDB.id == EvaluationDB.session_id
    ).where(
        SessionDB.user_id == current_user.id,
        SessionDB.status == "completed"
    )
    res_gen_raw = await db.execute(stmt_general)
    res_gen = res_gen_raw.first()
    
    total_sessions = res_gen[0] if res_gen else 0
    avg_score = round(res_gen[1], 1) if res_gen and res_gen[1] is not None else 0.0
    best_score = round(res_gen[2], 1) if res_gen and res_gen[2] is not None else 0.0

    # 2. Query top role
    stmt_role = select(
        SessionDB.job_role,
        func.count(SessionDB.id)
    ).where(
        SessionDB.user_id == current_user.id,
        SessionDB.status == "completed"
    ).group_by(
        SessionDB.job_role
    ).order_by(
        func.count(SessionDB.id).desc()
    ).limit(1)
    res_role_raw = await db.execute(stmt_role)
    res_role = res_role_raw.first()
    top_role = res_role[0] if res_role else "N/A"

    # 3. Query top industry
    stmt_industry = select(
        SessionDB.industry,
        func.count(SessionDB.id)
    ).where(
        SessionDB.user_id == current_user.id,
        SessionDB.status == "completed"
    ).group_by(
        SessionDB.industry
    ).order_by(
        func.count(SessionDB.id).desc()
    ).limit(1)
    res_ind_raw = await db.execute(stmt_industry)
    res_ind = res_ind_raw.first()
    top_industry = res_ind[0] if res_ind else "N/A"

    return {
        "total_sessions": total_sessions,
        "avg_score": avg_score,
        "best_score": best_score,
        "top_role": top_role,
        "top_industry": top_industry
    }


@router.get("/trend")
async def get_analytics_trend(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: UserDB = Depends(get_current_user),
    db=Depends(get_session)
):
    """
    Get score trends over time (chronological order).
    """
    stmt = select(
        SessionDB.id,
        SessionDB.job_role,
        SessionDB.completed_at,
        EvaluationDB.overall_score
    ).join(
        EvaluationDB, SessionDB.id == EvaluationDB.session_id
    ).where(
        SessionDB.user_id == current_user.id,
        SessionDB.status == "completed"
    ).order_by(
        SessionDB.completed_at.desc()
    ).limit(limit)
    
    res_trend = await db.execute(stmt)
    results = res_trend.all()
    
    trend_data = []
    # Reverse so it's in chronological order
    for row in reversed(results):
        trend_data.append({
            "session_id": str(row[0]),
            "job_role": row[1],
            "date": row[2].strftime("%Y-%m-%d") if row[2] else "",
            "score": round(row[3], 1)
        })
        
    return trend_data

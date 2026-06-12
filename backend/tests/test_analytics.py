import pytest
import uuid
from httpx import AsyncClient
from datetime import datetime
from backend.models.db_models import SessionDB, EvaluationDB

@pytest.mark.asyncio
async def test_analytics_endpoints(client: AsyncClient, db_session):
    # 1. Register and login to get token
    reg_res = await client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    assert reg_res.status_code == 200
    user_id = reg_res.json()["id"]
    
    login_res = await client.post(
        "/auth/token",
        data={"username": "testuser", "password": "testpassword"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify summary is empty initially
    summary_res = await client.get("/analytics/summary", headers=headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["total_sessions"] == 0
    assert summary_data["avg_score"] == 0.0
    assert summary_data["best_score"] == 0.0
    assert summary_data["top_role"] == "N/A"
    assert summary_data["top_industry"] == "N/A"

    trend_res = await client.get("/analytics/trend", headers=headers)
    assert trend_res.status_code == 200
    assert len(trend_res.json()) == 0

    # 3. Insert mock data
    u_uuid = uuid.UUID(user_id)
    
    sess1 = SessionDB(
        user_id=u_uuid,
        job_role="Product Manager",
        experience_level="Mid",
        industry="Tech",
        num_questions=2,
        questions=["Q1", "Q2"],
        ideal_answers=["A1", "A2"],
        status="completed",
        completed_at=datetime.utcnow()
    )
    db_session.add(sess1)
    await db_session.commit()
    await db_session.refresh(sess1)

    eval1 = EvaluationDB(
        session_id=sess1.id,
        overall_score=85.0,
        per_question_results=[]
    )
    db_session.add(eval1)

    sess2 = SessionDB(
        user_id=u_uuid,
        job_role="Product Manager",
        experience_level="Mid",
        industry="Finance",
        num_questions=2,
        questions=["Q1", "Q2"],
        ideal_answers=["A1", "A2"],
        status="completed",
        completed_at=datetime.utcnow()
    )
    db_session.add(sess2)
    await db_session.commit()
    await db_session.refresh(sess2)

    eval2 = EvaluationDB(
        session_id=sess2.id,
        overall_score=90.0,
        per_question_results=[]
    )
    db_session.add(eval2)
    await db_session.commit()

    # 4. Verify summary with data
    summary_res = await client.get("/analytics/summary", headers=headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["total_sessions"] == 2
    assert summary_data["avg_score"] == 87.5
    assert summary_data["best_score"] == 90.0
    assert summary_data["top_role"] == "Product Manager"
    assert summary_data["top_industry"] in ["Tech", "Finance"]

    # 5. Verify trend with data
    trend_res = await client.get("/analytics/trend", headers=headers)
    assert trend_res.status_code == 200
    trend_data = trend_res.json()
    assert len(trend_data) == 2
    assert trend_data[0]["score"] == 85.0
    assert trend_data[1]["score"] == 90.0
    assert trend_data[0]["job_role"] == "Product Manager"

import pytest
from unittest.mock import patch
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
@patch("backend.api.interview.generate_questions")
@patch("backend.api.interview.generate_ideal_answer")
@patch("backend.api.scoring.compute_similarity_score")
@patch("backend.api.scoring.extract_keywords_and_missing")
@patch("backend.api.scoring.topic_coverage_simple")
@patch("backend.api.scoring.get_feedback")
async def test_scoring_and_evaluation(
    mock_get_feedback,
    mock_topic_coverage,
    mock_extract_keywords,
    mock_compute_similarity,
    mock_ideal_answer,
    mock_questions,
    client: AsyncClient
):
    # Register and login first to get JWT token
    await client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    login_res = await client.post(
        "/auth/token",
        data={"username": "testuser", "password": "testpassword"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Setup mock returns
    mock_questions.return_value = ["Question 1?"]
    mock_ideal_answer.return_value = "Ideal answer text."
    mock_compute_similarity.return_value = 85.0
    mock_extract_keywords.return_value = {"user_keywords": [], "ideal_keywords": []}
    mock_topic_coverage.return_value = {"expected_topics": []}
    mock_get_feedback.return_value = "Feedback text."

    # 1. Generate interview
    gen_response = await client.post(
        "/interview/generate",
        json={
            "job_role": "Software Engineer",
            "experience_level": "Junior",
            "industry": "Tech",
            "num_questions": 1
        },
        headers=headers
    )
    session_id = gen_response.json()["session_id"]

    # 2. Submit answer
    submit_response = await client.post(
        "/scoring/submit",
        json={
            "session_id": session_id,
            "question_index": 0,
            "answer": "My user answer text."
        },
        headers=headers
    )
    assert submit_response.status_code == 200
    assert submit_response.json()["status"] == "ok"

    # 3. Evaluate session
    evaluate_response = await client.post(
        "/scoring/evaluate",
        json={
            "session_id": session_id
        },
        headers=headers
    )
    assert evaluate_response.status_code == 200
    eval_data = evaluate_response.json()
    assert eval_data["session_id"] == session_id
    assert eval_data["overall_score"] == 85.0
    assert len(eval_data["results"]) == 1
    assert eval_data["results"][0]["feedback"] == "Feedback text."

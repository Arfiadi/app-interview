import pytest
from unittest.mock import patch
from httpx import AsyncClient

@pytest.mark.asyncio
@patch("backend.api.interview.generate_questions")
@patch("backend.api.interview.generate_ideal_answer")
async def test_generate_interview_success(
    mock_ideal_answer, mock_questions, client: AsyncClient
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
    mock_questions.return_value = ["Question 1?", "Question 2?"]
    mock_ideal_answer.return_value = "Ideal answer text."

    # Call generate endpoint
    response = await client.post(
        "/interview/generate",
        json={
            "job_role": "Software Engineer",
            "experience_level": "Junior",
            "industry": "Tech",
            "num_questions": 2
        },
        headers=headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["questions"]) == 2
    assert data["questions"][0] == "Question 1?"

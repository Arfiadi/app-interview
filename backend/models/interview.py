from pydantic import BaseModel
from typing import List, Optional

# --- Request Schemas ---

class InterviewStartRequest(BaseModel):
    job_role: str
    experience_level: str
    industry: str
    num_questions: int = 5

class AnswerSubmitRequest(BaseModel):
    session_id: str
    question_index: int
    answer: str

class EvaluateRequest(BaseModel):
    session_id: str

# --- Response Schemas (Opsional, untuk dokumentasi API yang lebih baik) ---
class InterviewSessionResponse(BaseModel):
    session_id: str
    questions: List[str]
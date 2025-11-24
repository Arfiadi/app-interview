from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.services.similarity_service import compute_similarity_score
from backend.services.nlp_insights import extract_keywords_and_missing, topic_coverage_simple
from backend.services.llm_feedback import get_feedback
from backend.utils.model_loader import cache_session_store, persist_result_to_history

router = APIRouter()

class AnswerSubmitRequest(BaseModel):
    session_id: str
    question_index: int
    answer: str

@router.post("/submit")
def submit_answer(req: AnswerSubmitRequest):
    session = cache_session_store.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if req.question_index < 0 or req.question_index >= len(session["questions"]):
        raise HTTPException(status_code=400, detail="Invalid question index")

    session["answers"][req.question_index] = req.answer
    return {"status": "ok"}


class EvaluateRequest(BaseModel):
    session_id: str

@router.post("/evaluate")
def evaluate_session(req: EvaluateRequest):
    session = cache_session_store.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions = session["questions"]
    ideal_answers = session["ideal_answers"]
    user_answers = session["answers"]

    results = []
    similarity_scores = []

    for idx, q in enumerate(questions):
        user_ans = user_answers[idx] or ""
        ideal_ans = ideal_answers[idx] or ""

        sim = compute_similarity_score(user_ans, ideal_ans)
        similarity_scores.append(sim)

        keywords = extract_keywords_and_missing(user_ans, ideal_ans)
        topics = topic_coverage_simple(ideal_ans, user_ans)
        feedback = get_feedback(q, user_ans, ideal_ans)

        results.append({
            "question": q,
            "user_answer": user_ans,
            "ideal_answer": ideal_ans,
            "similarity_score": sim,
            "keywords": keywords,
            "topics": topics,
            "feedback": feedback
        })

    overall = round(sum(similarity_scores) / len(similarity_scores), 2) if similarity_scores else 0.0

    final = {
        "session_id": req.session_id,
        "overall_score": overall,
        "results": results
    }

    persist_result_to_history(final, session_meta={
        "job_role": session["job_role"],
        "experience_level": session["experience_level"],
        "industry": session["industry"]
    })

    return final

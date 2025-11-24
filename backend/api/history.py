from fastapi import APIRouter
from backend.utils.model_loader import load_history, load_history_item, persist_result_to_history

router = APIRouter()

@router.get("/")
def list_history():
    return load_history()   # return list, bukan {history: []}

@router.get("/all")
def get_all_history():
    return load_history()

@router.get("/{session_id}")
def get_history(session_id: str):
    item = load_history_item(session_id)
    if not item:
        return {"error": "not found"}
    return item


@router.post("/save")
def save_history(payload: dict):
    session_id = payload.get("session_id")
    if not session_id:
        return {"error": "session_id is required"}

    # history sudah tersimpan otomatis waktu evaluate(),
    # jadi cukup cek apakah session_id ada di history
    item = load_history_item(session_id)
    if not item:
        return {"error": "Session not found in history"}

    return {"status": "ok", "message": "History already saved automatically"}

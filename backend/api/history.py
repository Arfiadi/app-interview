from fastapi import APIRouter
from utils.model_loader import load_history, load_history_item

router = APIRouter()

@router.get("/")
def list_history():
    return load_history()

@router.get("/all")
def get_all_history():
    return load_history()

@router.get("/{session_id}")
def get_history(session_id: str):
    item = load_history_item(session_id)
    if not item:
        return {"error": "not found"}
    return item

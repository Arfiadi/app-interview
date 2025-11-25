from fastapi import APIRouter, HTTPException
# PERBAIKAN DI SINI: Tambahkan delete_history_item ke dalam import
from backend.utils.model_loader import load_history, load_history_item, persist_result_to_history, delete_history_item

router = APIRouter()

@router.get("/all")
def get_all_history():
    return load_history()

@router.get("/{session_id}")
def get_history(session_id: str):
    item = load_history_item(session_id)
    if not item:
        return {"error": "not found"}
    return item

@router.delete("/delete/{session_id}")
def delete_history(session_id: str):
    # Sekarang fungsi ini sudah dikenali
    success = delete_history_item(session_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or failed to delete")
        
    return {"status": "ok", "message": "History deleted successfully"}


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

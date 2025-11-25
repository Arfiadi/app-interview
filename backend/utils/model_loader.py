# app/backend/utils/model_loader.py
import threading
import json
import os
import time
import tempfile
from typing import List, Dict, Optional, Any

_model = None
_model_lock = threading.Lock()

# In-memory simple session store (MVP)
cache_session_store: Dict[str, Any] = {}

# HISTORY file path: app/backend/data/history.json
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")
HISTORY_LOCK = threading.Lock()  # protect read/write to history file


def _ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)


def get_embedding_model():
    """
    Lazy-load the sentence-transformers model (thread-safe).
    """
    global _model
    with _model_lock:
        if _model is None:
            # recommended model for multilingual similarity
            from sentence_transformers import SentenceTransformer  # local import
            _model = SentenceTransformer(
                "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
        return _model


def _atomic_write_json(path: str, data):
    """
    Write JSON to a temp file and replace to ensure atomicity.
    """
    dirpath = os.path.dirname(path)
    if not os.path.exists(dirpath):
        os.makedirs(dirpath, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=dirpath, prefix=".tmp_history_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
    except Exception:
        # try to remove temp file if exists
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass
        raise


def persist_result_to_history(result_obj: Dict[str, Any], session_meta: Optional[Dict[str, Any]] = None) -> bool:
    """
    Append a result object to history.json in a thread-safe & atomic way.
    Returns True on success, False on failure.
    """
    try:
        _ensure_data_dir()
        with HISTORY_LOCK:
            history: List[Dict[str, Any]] = []
            if os.path.exists(HISTORY_FILE):
                with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                    try:
                        history = json.load(f)
                        if not isinstance(history, list):
                            # Normalize to list if somehow corrupted
                            history = list(history)
                    except Exception:
                        history = []

            # Build item
            item = {
                "session_id": result_obj.get("session_id"),
                "overall_score": result_obj.get("overall_score"),
                "meta": session_meta or {},
                "results": result_obj.get("results"),
                "timestamp": result_obj.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S"),
            }

            # prevent exact duplicate session_id if exists (update instead)
            existing_idx = None
            for idx, h in enumerate(history):
                if h.get("session_id") == item["session_id"]:
                    existing_idx = idx
                    break

            if existing_idx is not None:
                history[existing_idx] = item
            else:
                history.append(item)

            _atomic_write_json(HISTORY_FILE, history)
        return True
    except Exception as e:
        print("Failed to persist history:", e)
        return False


def load_history() -> List[Dict[str, Any]]:
    """
    Load and return the full history list (empty list if not present).
    """
    try:
        _ensure_data_dir()
        if not os.path.exists(HISTORY_FILE):
            return []
        with HISTORY_LOCK:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
                    # if stored as dict somehow, try to convert
                    return list(data)
                except Exception:
                    return []
    except Exception:
        return []


def load_history_item(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Find a single history item by session_id.
    """
    if not session_id:
        return None
    h = load_history()
    for item in h:
        if item.get("session_id") == session_id:
            return item
    return None


def save_history_item(session_id: str) -> bool:
    """
    Ensure that the session result (if present in cache_session_store) is persisted to history.json.
    Returns True if saved or already exists, False otherwise.
    """
    if not session_id:
        return False

    # First try to find in history already
    existing = load_history_item(session_id)
    if existing:
        return True  # already saved

    # Then try to get from cache_session_store (in-memory)
    session = cache_session_store.get(session_id)
    if not session:
        # nothing to save
        return False

    # build a minimal result object compatible with persist_result_to_history
    result_obj = {
        "session_id": session_id,
        "overall_score": session.get("overall_score", 0),
        "results": session.get("answers_result") or session.get("results") or [],
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    # session_meta: include job_role, experience_level, industry if available
    session_meta = {
        "job_role": session.get("job_role"),
        "experience_level": session.get("experience_level"),
        "industry": session.get("industry"),
    }

    return persist_result_to_history(result_obj, session_meta=session_meta)


def get_history_summary(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Return recent history items (most recent last). Limit optional.
    """
    h = load_history()
    # sort by timestamp descending if present
    try:
        sorted_h = sorted(h, key=lambda x: x.get("timestamp", ""), reverse=True)
    except Exception:
        sorted_h = h
    return sorted_h[:limit]

# Tambahkan fungsi ini di file model_loader.py
def delete_history_item(session_id: str) -> bool:
    """
    Menghapus item history berdasarkan session_id.
    Returns True jika berhasil dihapus, False jika tidak ditemukan.
    """
    try:
        _ensure_data_dir()
        with HISTORY_LOCK:
            history = []
            if os.path.exists(HISTORY_FILE):
                with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                    try:
                        history = json.load(f)
                        if not isinstance(history, list): history = []
                    except:
                        history = []
            
            # Cari dan hapus
            initial_len = len(history)
            new_history = [h for h in history if h.get("session_id") != session_id]
            
            if len(new_history) == initial_len:
                return False # Tidak ada yang dihapus (ID tidak ketemu)
            
            _atomic_write_json(HISTORY_FILE, new_history)
            return True
    except Exception as e:
        print(f"Failed to delete history: {e}")
        return False


# app/backend/utils/model_loader.py
from sentence_transformers import SentenceTransformer
import threading
import json
import os

_model = None
_model_lock = threading.Lock()

# In-memory simple session store (MVP)
cache_session_store = {}
HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "history.json")

def get_embedding_model():
    global _model
    with _model_lock:
        if _model is None:
            # recommended model for multilingual similarity
            _model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
        return _model

def persist_result_to_history(result_obj, session_meta=None):
    # append to history.json (thread-safe naive)
    try:
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        item = {
            "session_id": result_obj.get("session_id"),
            "overall_score": result_obj.get("overall_score"),
            "meta": session_meta or {},
            "results": result_obj.get("results")
        }
        history.append(item)
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Failed to persist history:", e)

def load_history():
    try:
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return []
    except:
        return []

def load_history_item(session_id):
    h = load_history()
    for item in h:
        if item.get("session_id") == session_id:
            return item
    return None

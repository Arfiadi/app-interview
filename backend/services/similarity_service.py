# app/backend/services/similarity_service.py
from sentence_transformers import SentenceTransformer, util
from utils.model_loader import get_embedding_model
import torch

# Lazy load model from utils.model_loader (singleton)
model = get_embedding_model()  # uses "paraphrase-multilingual-MiniLM-L12-v2"

def compute_similarity_score(text_a: str, text_b: str) -> int:
    """
    Returns similarity as integer 0-100
    """
    if not text_a:
        text_a = ""
    if not text_b:
        text_b = ""

    emb_a = model.encode(text_a, convert_to_tensor=True)
    emb_b = model.encode(text_b, convert_to_tensor=True)
    sim = util.cos_sim(emb_a, emb_b).item()  # float
    # clamp to [-1,1] then to 0-1
    sim = max(-1.0, min(1.0, sim))
    sim01 = (sim + 1.0) / 2.0  # map -1..1 -> 0..1 to be safer
    score = int(round(sim01 * 100))
    return score

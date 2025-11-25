# app/backend/utils/text_cleaner.py
import re

def clean_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

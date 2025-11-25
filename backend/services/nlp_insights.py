# app/backend/services/nlp_insights.py
import yake
from collections import Counter

# YAKE configuration
_kw_extractor = yake.KeywordExtractor(lan="id", n=2, top=6)  # id for Indonesian

def extract_keywords_and_missing(user_text: str, ideal_text: str):
    user_kw = [kw for kw, score in _kw_extractor.extract_keywords(user_text)]
    ideal_kw = [kw for kw, score in _kw_extractor.extract_keywords(ideal_text)]

    # normalize simple (lower)
    user_set = set([k.lower() for k in user_kw])
    ideal_set = set([k.lower() for k in ideal_kw])

    missing = [k for k in ideal_kw if k.lower() not in user_set]
    extra = [k for k in user_kw if k.lower() not in ideal_set]

    return {
        "user_keywords": user_kw,
        "ideal_keywords": ideal_kw,
        "missing_keywords": missing,
        "extra_keywords": extra
    }

def topic_coverage_simple(ideal_text: str, user_text: str):
    """
    Simple topic coverage: use top keywords from ideal_text as 'expected topics',
    check which of them appear in user_text keywords.
    """
    ideal_kw = [kw for kw, _ in _kw_extractor.extract_keywords(ideal_text)]
    user_kw = [kw for kw, _ in _kw_extractor.extract_keywords(user_text)]

    expected = ideal_kw
    found = [k for k in user_kw if k in expected]
    missing = [k for k in expected if k not in found]

    return {"expected_topics": expected, "covered_topics": found, "missing_topics": missing}

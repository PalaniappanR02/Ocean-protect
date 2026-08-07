import json
import os
from typing import Dict, List, Optional, Tuple

DICTIONARIES_DIR = os.path.join(os.path.dirname(__file__), "dictionaries")


def load_dictionaries() -> Dict[str, Dict]:
    dicts = {}
    for lang_file in os.listdir(DICTIONARIES_DIR):
        if lang_file.endswith(".json"):
            lang_code = lang_file.split(".")[0]
            with open(os.path.join(DICTIONARIES_DIR, lang_file), "r", encoding="utf-8") as f:
                dicts[lang_code] = json.load(f)
    return dicts


DICTIONARIES = load_dictionaries()

# ---------------------------------------------------------------------------
# Optional machine-learning validation.
#
# OceanGuard ships with a lightweight keyword/rule classifier that runs
# everywhere. If a trained model + vectorizer are placed at
# `app/model.joblib` / `app/vectorizer.joblib` (e.g. produced by training on
# labelled coastal reports), the classifier switches to ML mode for relevance
# scoring while keeping the rule signals for urgency etc. Without those files
# the service stays fully functional in rule-based mode.
# ---------------------------------------------------------------------------
_model: Optional[object] = None
_vectorizer: Optional[object] = None
try:
    import joblib  # type: ignore

    _model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
    _vectorizer_path = os.path.join(os.path.dirname(__file__), "vectorizer.joblib")
    if os.path.exists(_model_path) and os.path.exists(_vectorizer_path):
        _vectorizer = joblib.load(_vectorizer_path)
        _model = joblib.load(_model_path)
except Exception:
    _model = None
    _vectorizer = None

STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "at", "is", "are",
    "was", "were", "it", "this", "that", "with", "from", "for", "by", "as",
    "be", "been", "i", "we", "you", "they", "he", "she", "there", "has", "have",
    "had", "not", "but", "so", "if", "then", "than", "too", "very", "can", "will",
    "just", "please", "today", "now", "still", "about", "here", "there",
}


def _classify_rules(text_lower: str, lang_dict: Dict) -> Tuple[bool, str, float, float, List[str]]:
    matched_keywords: List[str] = []
    predicted_hazard = "other"
    max_relevance = 0.0

    for hazard_type, keywords in lang_dict.get("hazard_keywords", {}).items():
        for kw in keywords:
            if kw.lower() in text_lower:
                matched_keywords.append(kw)
                # Simple relevance: more keywords found = higher relevance
                relevance = min(1.0, 0.5 + (len(matched_keywords) * 0.1))
                if relevance > max_relevance:
                    max_relevance = relevance
                    predicted_hazard = hazard_type

    is_hazard_relevant = max_relevance > 0.0

    urgency_score = 0.0
    for urgency_kw in lang_dict.get("urgency_keywords", []):
        if urgency_kw.lower() in text_lower:
            urgency_score = min(1.0, urgency_score + 0.3)

    return is_hazard_relevant, predicted_hazard, max_relevance, urgency_score, matched_keywords


def _classify_ml(text: str) -> Optional[Tuple[bool, float]]:
    """Returns (is_relevant, relevance) when a trained model is available."""
    if _model is None or _vectorizer is None:
        return None
    try:
        vector = _vectorizer.transform([text])
        probabilities = _model.predict_proba(vector)[0]
        classes = list(getattr(_model, "classes_", []))
        if len(classes) < 2:
            return None
        pos_index = classes.index("relevant") if "relevant" in classes else 1
        relevance = float(probabilities[pos_index])
        return relevance >= 0.5, relevance
    except Exception:
        return None


def _score_sentiment(text_lower: str) -> float:
    positive = ["safe", "good", "calm", "clear", "help", "helping", "rescued", "grateful", "thank", "recovered"]
    negative = ["drowning", "danger", "flood", "fear", "panic", "injured", "dead", "emergency", "warning", "stranded", "missing"]
    pos = sum(1 for w in positive if w in text_lower)
    neg = sum(1 for w in negative if w in text_lower)
    total = pos + neg
    if total == 0:
        return 0.0
    return round((pos - neg) / total, 2)


def _score_engagement(text: str, text_lower: str) -> float:
    score = 0.0
    score += min(0.4, text.count("#") * 0.1)                # hashtags
    score += min(0.3, text.count("@") * 0.15)               # mentions
    score += min(0.2, text.lower().count("http") * 0.1)     # links
    score += 0.1 if "?" in text else 0.0
    score += 0.1 if "!" in text else 0.0
    score += 0.1 if "urgent" in text_lower or "please share" in text_lower else 0.0
    return round(min(1.0, score), 2)


def _score_misinfo(text_lower: str) -> float:
    """Heuristic signals that content is unverified/rumour-like — for human review."""
    score = 0.0
    rumour_terms = [
        "rumour", "rumor", "heard", "apparently", "someone said", "friend told",
        "whatsapp forward", "they say", "viral", "unconfirmed", "reportedly",
    ]
    denial_terms = ["no danger", "all clear", "totally safe", "nothing happened", "fake news", "hoax"]
    if any(t in text_lower for t in rumour_terms):
        score += 0.4
    if any(t in text_lower for t in denial_terms):
        score += 0.3
    if text_lower.count("!") >= 3:
        score += 0.2
    if len(text_lower) > 40 and text_lower == text_lower.upper():
        score += 0.1
    return round(min(1.0, score), 2)


def _extract_keywords(text_lower: str) -> List[str]:
    words = [w.strip(".,!?;:#@()[]\"'") for w in text_lower.split()]
    return [w for w in words if len(w) > 3 and w not in STOPWORDS]


def classify_text(text: str, language_code: str) -> Tuple[bool, str, float, float, List[str], bool]:
    lang_code = language_code.lower()
    supported = lang_code in DICTIONARIES

    if not supported:
        return False, "other", 0.0, 0.0, [], False

    lang_dict = DICTIONARIES[lang_code]
    text_lower = text.lower()

    is_hazard_relevant, predicted_hazard, relevance, urgency, matched_keywords = _classify_rules(text_lower, lang_dict)

    # Optional ML relevance override (only when a trained model is present).
    ml_result = _classify_ml(text)
    if ml_result is not None:
        ml_relevant, ml_relevance = ml_result
        is_hazard_relevant = is_hazard_relevant or ml_relevant
        relevance = max(relevance, ml_relevance)

    return is_hazard_relevant, predicted_hazard, relevance, urgency, matched_keywords, True


def enrich_text(text: str, language_code: str) -> Dict:
    """Full NLP profile: relevance + urgency + sentiment + engagement + misinfo."""
    text_lower = text.lower()
    is_relevant, hazard_type, relevance, urgency, keywords, supported = classify_text(text, language_code)
    return {
        "isHazardRelevant": is_relevant,
        "predictedHazardType": hazard_type,
        "relevanceScore": round(relevance, 2),
        "urgencyScore": round(urgency, 2),
        "sentimentScore": _score_sentiment(text_lower),
        "engagementScore": _score_engagement(text, text_lower),
        "misinfoScore": _score_misinfo(text_lower),
        "topKeywords": _extract_keywords(text_lower)[:10],
        "matchedKeywords": keywords,
        "supportedLanguage": supported,
        "analysisMode": "ml" if (_model is not None and _vectorizer is not None) else "rule_based",
        "classifierVersion": "rules-v2",
    }

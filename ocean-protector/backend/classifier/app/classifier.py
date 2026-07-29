import json
import os
from typing import Dict, List, Tuple

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

def classify_text(text: str, language_code: str) -> Tuple[bool, str, float, float, List[str], bool]:
    lang_code = language_code.lower()
    supported = lang_code in DICTIONARIES
    
    if not supported:
        return False, "other", 0.0, 0.0, [], False
        
    lang_dict = DICTIONARIES[lang_code]
    text_lower = text.lower()
    
    matched_keywords = []
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

    return is_hazard_relevant, predicted_hazard, max_relevance, urgency_score, matched_keywords, True
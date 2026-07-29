from pydantic import BaseModel, Field
from typing import List

class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1)
    languageCode: str = Field(..., min_length=2, max_length=2)

class ClassifyResponse(BaseModel):
    isHazardRelevant: bool
    predictedHazardType: str
    relevanceScore: float
    urgencyScore: float
    matchedKeywords: List[str]
    supportedLanguage: bool
    analysisMode: str
    classifierVersion: str
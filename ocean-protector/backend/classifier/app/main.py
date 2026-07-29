from fastapi import FastAPI, HTTPException
from app.schemas import ClassifyRequest, ClassifyResponse
from app.classifier import classify_text

app = FastAPI(title="OceanGuard Text Classifier", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "classifier"}

@app.post("/classify", response_model=ClassifyResponse)
def classify_endpoint(request: ClassifyRequest):
    try:
        is_relevant, hazard_type, relevance, urgency, keywords, supported = classify_text(request.text, request.languageCode)
        
        return ClassifyResponse(
            isHazardRelevant=is_relevant,
            predictedHazardType=hazard_type,
            relevanceScore=round(relevance, 2),
            urgencyScore=round(urgency, 2),
            matchedKeywords=keywords,
            supportedLanguage=supported,
            analysisMode="rule_based",
            classifierVersion="rules-v1"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
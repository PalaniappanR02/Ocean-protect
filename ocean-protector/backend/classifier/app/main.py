from fastapi import FastAPI, HTTPException
from app.schemas import ClassifyRequest, ClassifyResponse
from app.classifier import enrich_text

app = FastAPI(title="OceanGuard Text Classifier", version="1.1.0")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "classifier"}


@app.post("/classify", response_model=ClassifyResponse)
def classify_endpoint(request: ClassifyRequest):
    try:
        result = enrich_text(request.text, request.languageCode)
        return ClassifyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

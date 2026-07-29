from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_classify_english_hazard():
    response = client.post("/classify", json={"text": "Large waves are approaching boats", "languageCode": "en"})
    assert response.status_code == 200
    data = response.json()
    assert data["isHazardRelevant"] is True
    assert data["predictedHazardType"] == "high_waves"
    assert data["analysisMode"] == "rule_based"

def test_classify_unsupported_language():
    response = client.post("/classify", json={"text": "Quelque chose", "languageCode": "fr"})
    assert response.status_code == 200
    data = response.json()
    assert data["supportedLanguage"] is False
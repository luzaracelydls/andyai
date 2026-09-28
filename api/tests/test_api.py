from fastapi.testclient import TestClient

from app import ai
from app.main import app
from app.schemas import SkillLevel

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_assess_devuelve_nivel(monkeypatch):
    monkeypatch.setattr(ai, "assess_skill_level", lambda img, mime: SkillLevel.intermediate)
    res = client.post("/assess", json={"image_base64": "abc", "mime_type": "image/png"})
    assert res.status_code == 200
    assert res.json() == {"level": "Intermediate"}


def test_challenge_rechaza_medio_invalido():
    res = client.post("/challenge", json={
        "level": "Newbie", "medium": "Crayones", "subject": "Animals",
    })
    assert res.status_code == 422   # Pydantic lo rechaza solo


def test_assess_error_de_gemini(monkeypatch):
    def falla(img, mime):
        raise RuntimeError("Gemini caído")
    monkeypatch.setattr(ai, "assess_skill_level", falla)
    res = client.post("/assess", json={"image_base64": "abc", "mime_type": "image/png"})
    assert res.status_code == 502
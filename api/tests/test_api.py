import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app import ai
from app.main import app
from app.schemas import ChallengeResponse, Evaluation, SkillLevel

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

RETO = {
    "title": "Esfera iluminada",
    "description": "Pinta una esfera con una sola fuente de luz.",
    "focusAreas": ["Valores"],
    "tips": ["Empieza por las sombras"],
}

EVALUACION = {
    "proportions": "👍 Bien",
    "composition": "👏 Muy bien",
    "colorTheory": "👍 Bien",
    "volume": "🏆 Excelente",
    "lightingShadow": "👍 Bien",
    "overallEncouragement": "¡Sigue así!",
    "rating": 4,
    "meetsChallenge": True,
}

# "hola" en base64
IMAGEN = {"image_base64": "aG9sYQ==", "mime_type": "image/png"}


def test_assess_rechaza_mime_invalido():
    res = client.post("/assess", json={"image_base64": "abc", "mime_type": "text/html"})
    assert res.status_code == 422


def test_assess_rechaza_imagen_vacia():
    res = client.post("/assess", json={"image_base64": "", "mime_type": "image/png"})
    assert res.status_code == 422


def test_assess_base64_invalido_devuelve_400():
    # Sin monkeypatch: la validación del base64 ocurre antes de llamar a Gemini
    res = client.post("/assess", json={"image_base64": "no es base64!", "mime_type": "image/png"})
    assert res.status_code == 400


def test_challenge_devuelve_reto(monkeypatch):
    reto = ChallengeResponse(**RETO, youtubeQueries=["How to paint a sphere"], complexity="Beginner")
    monkeypatch.setattr(ai, "generate_challenge", lambda level, medium, subject: reto)
    res = client.post("/challenge", json={
        "level": "Newbie", "medium": "Watercolor", "subject": "Single Objects",
    })
    assert res.status_code == 200
    assert res.json()["youtubeQueries"] == ["How to paint a sphere"]


def test_challenge_rechaza_campos_nulos():
    res = client.post("/challenge", json={"level": "Newbie", "medium": None, "subject": None})
    assert res.status_code == 422


def test_evaluate_devuelve_evaluacion(monkeypatch):
    monkeypatch.setattr(ai, "evaluate_artwork", lambda *args: Evaluation(**EVALUACION))
    # El frontend manda el reto completo, con campos extra: deben ignorarse
    reto = {**RETO, "youtubeQueries": ["x"], "complexity": "Beginner"}
    res = client.post("/evaluate", json={
        **IMAGEN, "challenge": reto, "level": "Newbie", "medium": "Oil",
    })
    assert res.status_code == 200
    assert res.json() == EVALUACION


def test_evaluate_rechaza_rating_fuera_de_rango():
    with pytest.raises(ValidationError):
        Evaluation(**{**EVALUACION, "rating": 7})


def test_gemini_respuesta_invalida_devuelve_502(monkeypatch):
    class RespuestaVacia:
        parsed = None
        text = "no es json"

    class ClienteFalso:
        class models:
            @staticmethod
            def generate_content(**kwargs):
                return RespuestaVacia()

    monkeypatch.setattr(ai, "get_client", lambda: ClienteFalso())
    res = client.post("/challenge", json={
        "level": "Newbie", "medium": "Oil", "subject": "Plants",
    })
    assert res.status_code == 502

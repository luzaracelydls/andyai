import pytest
from fastapi.testclient import TestClient
from google.auth.exceptions import DefaultCredentialsError
from google.genai import errors as genai_errors
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
    "scores": {"proportions": 4, "composition": 5, "colorTheory": 3, "volume": 5, "lightingShadow": 4},
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


# ---------- Errores de configuración de Google Cloud ----------

RETO_REQUEST = {"level": "Newbie", "medium": "Oil", "subject": "Plants"}


def _falla_con(exc):
    def falla(*args):
        raise exc
    return falla


def _error_403(reason):
    return genai_errors.ClientError(403, {"error": {
        "code": 403, "status": "PERMISSION_DENIED", "message": "denied",
        "details": [{"@type": "type.googleapis.com/google.rpc.ErrorInfo", "reason": reason}],
    }})


def test_billing_desactivado_devuelve_503_con_mensaje(monkeypatch):
    monkeypatch.setattr(ai, "generate_challenge", _falla_con(_error_403("BILLING_DISABLED")))
    res = client.post("/challenge", json=RETO_REQUEST)
    assert res.status_code == 503
    assert "facturación" in res.json()["detail"]


def test_vertex_sin_permisos_devuelve_503(monkeypatch):
    monkeypatch.setattr(ai, "generate_challenge", _falla_con(_error_403("SERVICE_DISABLED")))
    res = client.post("/challenge", json=RETO_REQUEST)
    assert res.status_code == 503
    assert "Vertex AI" in res.json()["detail"]


def test_sin_credenciales_devuelve_503(monkeypatch):
    monkeypatch.setattr(ai, "assess_skill_level", _falla_con(DefaultCredentialsError("no ADC")))
    res = client.post("/assess", json=IMAGEN)
    assert res.status_code == 503
    assert "gcloud auth application-default login" in res.json()["detail"]


def test_sin_proyecto_devuelve_503(monkeypatch):
    monkeypatch.setattr(ai, "evaluate_artwork", _falla_con(KeyError("GOOGLE_CLOUD_PROJECT")))
    res = client.post("/evaluate", json={
        **IMAGEN, "challenge": RETO, "level": "Newbie", "medium": "Oil",
    })
    assert res.status_code == 503
    assert "GOOGLE_CLOUD_PROJECT" in res.json()["detail"]


def test_error_desconocido_sigue_siendo_502(monkeypatch):
    monkeypatch.setattr(ai, "generate_challenge", _falla_con(RuntimeError("otra cosa")))
    res = client.post("/challenge", json=RETO_REQUEST)
    assert res.status_code == 502
    assert res.json()["detail"] == "No se pudo generar el reto"


def test_cors_permite_127_0_0_1():
    res = client.options("/challenge", headers={
        "Origin": "http://127.0.0.1:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert res.status_code == 200
    assert res.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"


def test_allowed_origins_agrega_alias_de_localhost(monkeypatch):
    from app.main import allowed_origins
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://localhost:5173, https://andy.example.com")
    assert allowed_origins() == [
        "http://localhost:5173", "https://andy.example.com", "http://127.0.0.1:5173",
    ]


def test_proyecto_vacio_en_env_devuelve_503(monkeypatch):
    monkeypatch.setenv("GOOGLE_CLOUD_PROJECT", "")
    ai.get_client.cache_clear()
    res = client.post("/challenge", json=RETO_REQUEST)
    assert res.status_code == 503
    assert "GOOGLE_CLOUD_PROJECT" in res.json()["detail"]


def test_evaluate_rechaza_puntaje_de_criterio_fuera_de_rango():
    scores = {**EVALUACION["scores"], "volume": 9}
    with pytest.raises(ValidationError):
        Evaluation(**{**EVALUACION, "scores": scores})


def test_cors_para_firebase_hosting(monkeypatch):
    # En Cloud Run, ALLOWED_ORIGINS trae los dominios de Firebase Hosting; el CORS se
    # configura al importar app.main, así que se recarga con la variable puesta
    import importlib
    import app.main as main_module

    monkeypatch.setenv("ALLOWED_ORIGINS", "https://andy-ai.web.app,https://andy-ai.firebaseapp.com")
    try:
        prod_client = TestClient(importlib.reload(main_module).app)
        preflight = {"Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"}
        ok = prod_client.options("/challenge", headers={**preflight, "Origin": "https://andy-ai.web.app"})
        assert ok.status_code == 200
        assert ok.headers["access-control-allow-origin"] == "https://andy-ai.web.app"
        rechazado = prod_client.options("/challenge", headers={**preflight, "Origin": "https://otro-sitio.com"})
        assert "access-control-allow-origin" not in rechazado.headers
    finally:
        monkeypatch.delenv("ALLOWED_ORIGINS")
        importlib.reload(main_module)

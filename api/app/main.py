import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import ai
from app.schemas import (
    AssessResponse, ChallengeRequest, ChallengeResponse,
    EvaluateRequest, Evaluation, ImageInput, Language,
)

load_dotenv()

logger = logging.getLogger("andy_ai")

app = FastAPI(title="Andy AI API")

def allowed_origins() -> list[str]:
    origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
    # localhost y 127.0.0.1 son la misma máquina, pero el navegador los trata como orígenes distintos
    aliases = [o.replace("//localhost", "//127.0.0.1") for o in origins]
    aliases += [o.replace("//127.0.0.1", "//localhost") for o in origins]
    return list(dict.fromkeys(origins + aliases))


app.add_middleware(
    CORSMiddleware,
    # Solo tu frontend, nunca "*" en producción
    allow_origins=allowed_origins(),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


MESSAGES = {
    Language.es: {
        "invalid_image": "La imagen no es válida",
        "assess": "No se pudo analizar la imagen",
        "challenge": "No se pudo generar el reto",
        "evaluate": "No se pudo evaluar la obra",
    },
    Language.en: {
        "invalid_image": "The image is not valid",
        "assess": "Could not analyze the image",
        "challenge": "Could not create the challenge",
        "evaluate": "Could not evaluate the artwork",
    },
}


def _upstream_error(exc: Exception, endpoint: str, language: Language) -> HTTPException:
    logger.exception("Falló /%s", endpoint)
    setup_problem = ai.describe_setup_error(exc, language)
    if setup_problem:
        # Problema de configuración de Google Cloud: el usuario puede arreglarlo
        return HTTPException(status_code=503, detail=setup_problem)
    return HTTPException(status_code=502, detail=MESSAGES[language][endpoint])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/assess", response_model=AssessResponse)
def assess(body: ImageInput):
    try:
        level = ai.assess_skill_level(body.image_base64, body.mime_type)
    except ai.InvalidImageError:
        raise HTTPException(status_code=400, detail=MESSAGES[body.language]["invalid_image"])
    except Exception as exc:
        raise _upstream_error(exc, "assess", body.language)
    return AssessResponse(level=level)


@app.post("/challenge", response_model=ChallengeResponse)
def challenge(body: ChallengeRequest):
    try:
        return ai.generate_challenge(body.level, body.medium, body.subject, body.language)
    except Exception as exc:
        raise _upstream_error(exc, "challenge", body.language)


@app.post("/evaluate", response_model=Evaluation)
def evaluate(body: EvaluateRequest):
    try:
        return ai.evaluate_artwork(
            body.image_base64, body.mime_type, body.challenge, body.level, body.medium, body.language,
        )
    except ai.InvalidImageError:
        raise HTTPException(status_code=400, detail=MESSAGES[body.language]["invalid_image"])
    except Exception as exc:
        raise _upstream_error(exc, "evaluate", body.language)

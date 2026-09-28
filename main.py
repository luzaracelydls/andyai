import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import ai
from app.schemas import (
    AssessResponse, ChallengeRequest, ChallengeResponse,
    EvaluateRequest, Evaluation, ImageInput,
)

load_dotenv()

app = FastAPI(title="Andy AI API")

app.add_middleware(
    CORSMiddleware,
    # Solo tu frontend, nunca "*" en producción
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/assess", response_model=AssessResponse)
def assess(body: ImageInput):
    try:
        level = ai.assess_skill_level(body.image_base64, body.mime_type)
    except Exception:
        raise HTTPException(status_code=502, detail="No se pudo analizar la imagen")
    return AssessResponse(level=level)


@app.post("/challenge", response_model=ChallengeResponse)
def challenge(body: ChallengeRequest):
    try:
        return ai.generate_challenge(body.level, body.medium, body.subject)
    except Exception:
        raise HTTPException(status_code=502, detail="No se pudo generar el reto")


@app.post("/evaluate", response_model=Evaluation)
def evaluate(body: EvaluateRequest):
    try:
        return ai.evaluate_artwork(
            body.image_base64, body.mime_type, body.challenge, body.level, body.medium,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="No se pudo evaluar la obra")
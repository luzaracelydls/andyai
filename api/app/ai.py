import base64
import binascii
import os
from functools import lru_cache

from google import genai
from google.genai import types

from app.schemas import (
    Challenge, ChallengeResponse, Evaluation, Medium, SkillLevel, Subject,
)

MODEL_NAME = "gemini-2.5-flash"


@lru_cache
def get_client() -> genai.Client:
    # Se crea una sola vez y solo cuando se necesita (útil para los tests)
    return genai.Client(
        vertexai=True,
        project=os.environ["GOOGLE_CLOUD_PROJECT"],
        location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
    )


class InvalidImageError(ValueError):
    """La imagen recibida no es base64 válido."""


def _image_part(image_base64: str, mime_type: str) -> types.Part:
    try:
        data = base64.b64decode(image_base64, validate=True)
    except (binascii.Error, ValueError) as e:
        raise InvalidImageError("La imagen no es base64 válido") from e
    return types.Part.from_bytes(data=data, mime_type=mime_type)


def _parsed(response):
    # Si Gemini no devolvió JSON que cumpla el esquema, parsed viene en None
    if response.parsed is None:
        raise RuntimeError(f"Gemini devolvió una respuesta inválida: {response.text!r}")
    return response.parsed


def assess_skill_level(image_base64: str, mime_type: str) -> SkillLevel:
    image = _image_part(image_base64, mime_type)  # valida antes de llamar a Gemini
    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=[
            image,
            "Analyze this artwork and determine if the artist is a 'Newbie' "
            "or 'Intermediate' level. Return only the word.",
        ],
    )
    text = (response.text or "").strip()
    return SkillLevel.intermediate if "Intermediate" in text else SkillLevel.newbie


def generate_challenge(level: SkillLevel, medium: Medium, subject: Subject) -> ChallengeResponse:
    prompt = f"""
Use this art knowledge:
- Rule of thirds improves composition
- Human proportions: 7-8 heads tall
- Light must be consistent
- Avoid tangents in composition

Create a {level.value} level challenge for {medium.value} painting of {subject.value}.
Include 2 YouTube search queries related to the challenge topic. For example, if the
challenge is about drawing still life with basic forms, a query could be
"How to Draw Basic Shapes". Also include a complexity label (Beginner, Moderate, Advanced)."""

    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ChallengeResponse,   # ← tu modelo de Pydantic
        ),
    )
    return _parsed(response)


def evaluate_artwork(
    image_base64: str, mime_type: str, challenge: Challenge,
    level: SkillLevel, medium: Medium,
) -> Evaluation:
    prompt = f"""Evaluate this {medium.value} artwork ({level.value} level).
Challenge: {challenge.title}.
For each point (Proportions, Composition, Color Theory, Volume, Lighting/Shadow),
start with 👍, 👏, or 🏆. Provide an overall rating 0-5.
Answer true or false: does the user meet the challenge expectation?"""

    image = _image_part(image_base64, mime_type)  # valida antes de llamar a Gemini
    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=[image, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Evaluation,
        ),
    )
    return _parsed(response)
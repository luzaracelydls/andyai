from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class SkillLevel(str, Enum):
    newbie = "Newbie"
    intermediate = "Intermediate"


class Medium(str, Enum):
    acrylic = "Acrylic"
    pastels = "Pastels"
    oil_pastels = "Oil Pastels"
    watercolor = "Watercolor"
    oil = "Oil"


class Subject(str, Enum):
    single_objects = "Single Objects"
    human_anatomy = "Human Anatomy"
    animals = "Animals"
    plants = "Plants"


# ---------- Peticiones (lo que manda React) ----------

# ~6 MB de base64 equivalen a ~4.5 MB de imagen
MAX_IMAGE_BASE64_CHARS = 6_000_000


class ImageInput(BaseModel):
    image_base64: str = Field(min_length=1, max_length=MAX_IMAGE_BASE64_CHARS)
    mime_type: Literal["image/jpeg", "image/png", "image/webp"]


class ChallengeRequest(BaseModel):
    level: SkillLevel
    medium: Medium
    subject: Subject


# Las descripciones viajan en el response_schema de Gemini y refuerzan el idioma campo por campo
ES = "en español"


class Challenge(BaseModel):
    title: str = Field(description=f"Título corto y motivador del reto, {ES}")
    description: str = Field(description=f"Qué hay que pintar y por qué, {ES}")
    focusAreas: list[str] = Field(description=f"Puntos concretos a trabajar, {ES}")
    tips: list[str] = Field(description=f"Consejos prácticos, {ES}")


class EvaluateRequest(ImageInput):
    challenge: Challenge
    level: SkillLevel
    medium: Medium


# ---------- Respuestas (lo que devuelve la API) ----------

class AssessResponse(BaseModel):
    level: SkillLevel


class ChallengeResponse(Challenge):
    youtubeQueries: list[str] = Field(description="Búsquedas para YouTube (español o inglés)")
    complexity: str = Field(description="Exactamente una de: Principiante, Intermedio, Avanzado")


class CriterionScores(BaseModel):
    proportions: int = Field(ge=0, le=5)
    composition: int = Field(ge=0, le=5)
    colorTheory: int = Field(ge=0, le=5)
    volume: int = Field(ge=0, le=5)
    lightingShadow: int = Field(ge=0, le=5)


class Evaluation(BaseModel):
    proportions: str = Field(description=f"Comentario sobre las proporciones, {ES}")
    composition: str = Field(description=f"Comentario sobre la composición, {ES}")
    colorTheory: str = Field(description=f"Comentario sobre la teoría del color, {ES}")
    volume: str = Field(description=f"Comentario sobre el volumen y la forma, {ES}")
    lightingShadow: str = Field(description=f"Comentario sobre la luz y la sombra, {ES}")
    overallEncouragement: str = Field(description=f"Mensaje final de ánimo, {ES}")
    rating: int = Field(ge=0, le=5)
    scores: CriterionScores
    meetsChallenge: bool
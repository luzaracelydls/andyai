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


class Language(str, Enum):
    es = "es"
    en = "en"


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
    language: Language = Language.es


class ChallengeRequest(BaseModel):
    level: SkillLevel
    medium: Medium
    subject: Subject
    language: Language = Language.es


# Las descripciones viajan en el response_schema de Gemini y le recuerdan, campo por campo,
# que escriba en el idioma que pide la instrucción de sistema
LANG = "in the language required by the system instruction"


class Challenge(BaseModel):
    title: str = Field(description=f"Short, motivating challenge title, {LANG}")
    description: str = Field(description=f"What to paint and why, {LANG}")
    focusAreas: list[str] = Field(description=f"Concrete points to practice, {LANG}")
    tips: list[str] = Field(description=f"Practical tips, {LANG}")


class EvaluateRequest(ImageInput):
    challenge: Challenge
    level: SkillLevel
    medium: Medium


# ---------- Respuestas (lo que devuelve la API) ----------

class AssessResponse(BaseModel):
    level: SkillLevel


class ChallengeResponse(Challenge):
    youtubeQueries: list[str] = Field(description="YouTube search queries")
    complexity: str = Field(description="Difficulty label from the prompt's allowed list")


class CriterionScores(BaseModel):
    proportions: int = Field(ge=0, le=5)
    composition: int = Field(ge=0, le=5)
    colorTheory: int = Field(ge=0, le=5)
    volume: int = Field(ge=0, le=5)
    lightingShadow: int = Field(ge=0, le=5)


class Evaluation(BaseModel):
    proportions: str = Field(description=f"Feedback on proportions, {LANG}")
    composition: str = Field(description=f"Feedback on composition, {LANG}")
    colorTheory: str = Field(description=f"Feedback on color theory, {LANG}")
    volume: str = Field(description=f"Feedback on volume and form, {LANG}")
    lightingShadow: str = Field(description=f"Feedback on lighting and shadow, {LANG}")
    overallEncouragement: str = Field(description=f"Closing words of encouragement, {LANG}")
    rating: int = Field(ge=0, le=5)
    scores: CriterionScores
    meetsChallenge: bool
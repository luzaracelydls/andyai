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


class Challenge(BaseModel):
    title: str
    description: str
    focusAreas: list[str]
    tips: list[str]


class EvaluateRequest(ImageInput):
    challenge: Challenge
    level: SkillLevel
    medium: Medium


# ---------- Respuestas (lo que devuelve la API) ----------

class AssessResponse(BaseModel):
    level: SkillLevel


class ChallengeResponse(Challenge):
    youtubeQueries: list[str]
    complexity: str


class Evaluation(BaseModel):
    proportions: str
    composition: str
    colorTheory: str
    volume: str
    lightingShadow: str
    overallEncouragement: str
    rating: int = Field(ge=0, le=5)
    meetsChallenge: bool
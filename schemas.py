from enum import Enum
from pydantic import BaseModel


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

class ImageInput(BaseModel):
    image_base64: str
    mime_type: str


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
    rating: int
    meetsChallenge: bool
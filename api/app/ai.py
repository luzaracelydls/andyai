import base64
import binascii
import os
from functools import lru_cache

from google import genai
from google.auth.exceptions import DefaultCredentialsError, RefreshError
from google.genai import errors, types

from app.schemas import (
    Challenge, ChallengeResponse, Evaluation, Language, Medium, SkillLevel, Subject,
)

MODEL_NAME = "gemini-2.5-flash"


@lru_cache
def get_client() -> genai.Client:
    # Se crea una sola vez y solo cuando se necesita (útil para los tests)
    project = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip()
    if not project:
        # Ausente o vacía (p. ej. .env copiado sin llenar): describe_setup_error la reporta
        raise KeyError("GOOGLE_CLOUD_PROJECT")
    return genai.Client(
        vertexai=True,
        project=project,
        location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
    )


def _error_reasons(exc: errors.APIError) -> set[str]:
    # Vertex AI manda el motivo en error.details[].reason (p. ej. BILLING_DISABLED)
    details = exc.details if isinstance(exc.details, dict) else {}
    items = details.get("error", {}).get("details", [])
    return {d.get("reason") for d in items if isinstance(d, dict) and d.get("reason")}


SETUP_ERRORS = {
    Language.es: {
        "project": "Falta GOOGLE_CLOUD_PROJECT: ponla en api/.env (local) o en las variables del servicio de Cloud Run.",
        "credentials": "Faltan credenciales de Google Cloud o expiraron: corre `gcloud auth application-default login`.",
        "billing": "Tu proyecto de Google Cloud no tiene la facturación activada.",
        "permission": "Habilita Vertex AI en tu proyecto de Google Cloud o revisa los permisos de tu cuenta.",
    },
    Language.en: {
        "project": "GOOGLE_CLOUD_PROJECT is missing: set it in api/.env (local) or in the Cloud Run service variables.",
        "credentials": "Google Cloud credentials are missing or expired: run `gcloud auth application-default login`.",
        "billing": "Your Google Cloud project does not have billing enabled.",
        "permission": "Enable Vertex AI in your Google Cloud project or check your account permissions.",
    },
}


def describe_setup_error(exc: Exception, language: Language = Language.es) -> str | None:
    """Traduce errores de configuración de Google Cloud a un mensaje claro.

    Devuelve None si el error no es de configuración (se trata como falla genérica).
    """
    messages = SETUP_ERRORS[language]
    if isinstance(exc, KeyError) and exc.args == ("GOOGLE_CLOUD_PROJECT",):
        return messages["project"]
    if isinstance(exc, (DefaultCredentialsError, RefreshError)):
        return messages["credentials"]
    if isinstance(exc, errors.ClientError) and exc.code == 403:
        return messages["billing"] if "BILLING_DISABLED" in _error_reasons(exc) else messages["permission"]
    return None


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


# Etiquetas por idioma para que el prompt no mezcle idiomas (los enums quedan en inglés para la API)
LEVEL_LABELS = {
    Language.es: {SkillLevel.newbie: "principiante", SkillLevel.intermediate: "intermedio"},
    Language.en: {SkillLevel.newbie: "beginner", SkillLevel.intermediate: "intermediate"},
}
MEDIUM_LABELS = {
    Language.es: {
        Medium.acrylic: "acrílico", Medium.pastels: "pastel seco", Medium.oil_pastels: "pastel al óleo",
        Medium.watercolor: "acuarela", Medium.oil: "óleo",
    },
    Language.en: {
        Medium.acrylic: "acrylic", Medium.pastels: "soft pastels", Medium.oil_pastels: "oil pastels",
        Medium.watercolor: "watercolor", Medium.oil: "oil",
    },
}
SUBJECT_LABELS = {
    Language.es: {
        Subject.single_objects: "objetos (bodegón)", Subject.human_anatomy: "figura humana",
        Subject.animals: "animales", Subject.plants: "plantas",
    },
    Language.en: {
        Subject.single_objects: "objects (still life)", Subject.human_anatomy: "the human figure",
        Subject.animals: "animals", Subject.plants: "plants",
    },
}

# Gemini tiende a contestar en el idioma del prompt; la instrucción de sistema lo fija.
# Se repite la instrucción de idioma (aquí y al inicio de cada prompt) porque Gemini a veces
# ignora la instrucción de sistema y responde en el otro idioma si no se refuerza.
SYSTEM_INSTRUCTIONS = {
    Language.es: (
        "Eres Andy, una mentora de pintura para personas que están aprendiendo. "
        "Responde SIEMPRE en español neutro, en todos los campos de texto del JSON, "
        "aunque los nombres de los campos estén en inglés. Nunca escribas en inglés, sin excepciones. "
        "Usa un tono cálido, claro y alentador."
    ),
    Language.en: (
        "You are Andy, a painting mentor for people who are learning. "
        "ALWAYS answer in English in every text field of the JSON. "
        "Never write in Spanish, no exceptions. "
        "Use a warm, clear and encouraging tone."
    ),
}

LANGUAGE_DIRECTIVES = {
    Language.es: "IMPORTANTE: responde por completo en español; no uses inglés en ningún campo de texto.\n\n",
    Language.en: "IMPORTANT: respond entirely in English; do not use Spanish in any text field.\n\n",
}

CHALLENGE_PROMPTS = {
    Language.es: LANGUAGE_DIRECTIVES[Language.es] + """Usa estos principios de arte:
- La regla de los tercios mejora la composición
- Proporciones humanas: 7 a 8 cabezas de alto
- La luz debe ser consistente
- Evita tangentes en la composición

Crea un reto de pintura para una persona de nivel {level}, con la técnica {medium} y el tema {subject}.
Incluye 2 búsquedas de YouTube relacionadas con el tema del reto (por ejemplo, para un bodegón
con formas básicas: "cómo dibujar formas básicas"); pueden ir en inglés si así se encuentran mejores videos.
La complejidad debe ser exactamente una de estas: Principiante, Intermedio o Avanzado.
Escribe el título, la descripción, los puntos a trabajar y los consejos en español.""",
    Language.en: LANGUAGE_DIRECTIVES[Language.en] + """Use these art principles:
- The rule of thirds improves composition
- Human proportions: 7 to 8 heads tall
- Light must be consistent
- Avoid tangents in the composition

Create a painting challenge for an artist at the {level} level, using {medium}, about {subject}.
Include 2 YouTube search queries related to the challenge topic (for example, for a still life
with basic shapes: "how to draw basic shapes").
The complexity must be exactly one of: Beginner, Intermediate or Advanced.
Write the title, description, focus areas and tips in English.""",
}

EVALUATION_PROMPTS = {
    Language.es: LANGUAGE_DIRECTIVES[Language.es] + """Evalúa esta obra en {medium} de una persona de nivel {level}.
El reto era: "{title}".
Comenta cada criterio (proporciones, composición, teoría del color, volumen y luz y sombra)
empezando con 👍, 👏 o 🏆, y dale a cada uno un puntaje entero de 0 a 5 en "scores".
Da una calificación general de 0 a 5 y responde true o false: ¿la obra cumple el reto?
Escribe toda la retroalimentación en español.""",
    Language.en: LANGUAGE_DIRECTIVES[Language.en] + """Evaluate this {medium} artwork by an artist at the {level} level.
The challenge was: "{title}".
Comment on each criterion (proportions, composition, color theory, volume, lighting and shadow)
starting with 👍, 👏 or 🏆, and give each one an integer score from 0 to 5 in "scores".
Give an overall rating from 0 to 5 and answer true or false: does the artwork meet the challenge?
Write all feedback in English.""",
}


def _config(schema, language: Language) -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTIONS[language],
        response_mime_type="application/json",
        response_schema=schema,
    )


def generate_challenge(
    level: SkillLevel, medium: Medium, subject: Subject, language: Language = Language.es,
) -> ChallengeResponse:
    prompt = CHALLENGE_PROMPTS[language].format(
        level=LEVEL_LABELS[language][level],
        medium=MEDIUM_LABELS[language][medium],
        subject=SUBJECT_LABELS[language][subject],
    )
    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=_config(ChallengeResponse, language),
    )
    return _parsed(response)


def evaluate_artwork(
    image_base64: str, mime_type: str, challenge: Challenge,
    level: SkillLevel, medium: Medium, language: Language = Language.es,
) -> Evaluation:
    prompt = EVALUATION_PROMPTS[language].format(
        medium=MEDIUM_LABELS[language][medium],
        level=LEVEL_LABELS[language][level],
        title=challenge.title,
    )
    image = _image_part(image_base64, mime_type)  # valida antes de llamar a Gemini
    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=[image, prompt],
        config=_config(Evaluation, language),
    )
    return _parsed(response)

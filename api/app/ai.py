import base64
import binascii
import os
from functools import lru_cache

from google import genai
from google.auth.exceptions import DefaultCredentialsError, RefreshError
from google.genai import errors, types

from app.schemas import (
    Challenge, ChallengeResponse, Evaluation, Medium, SkillLevel, Subject,
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


def describe_setup_error(exc: Exception) -> str | None:
    """Traduce errores de configuración de Google Cloud a un mensaje claro.

    Devuelve None si el error no es de configuración (se trata como falla genérica).
    """
    if isinstance(exc, KeyError) and exc.args == ("GOOGLE_CLOUD_PROJECT",):
        return ("Falta GOOGLE_CLOUD_PROJECT: ponla en api/.env (local) "
                "o en las variables del servicio de Cloud Run.")
    if isinstance(exc, (DefaultCredentialsError, RefreshError)):
        return ("Faltan credenciales de Google Cloud o expiraron: "
                "corre `gcloud auth application-default login`.")
    if isinstance(exc, errors.ClientError) and exc.code == 403:
        reasons = _error_reasons(exc)
        if "BILLING_DISABLED" in reasons:
            return "Tu proyecto de Google Cloud no tiene la facturación activada."
        return "Habilita Vertex AI en tu proyecto de Google Cloud o revisa los permisos de tu cuenta."
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


# Etiquetas en español para que el prompt no mezcle idiomas (los enums quedan en inglés para la API)
LEVEL_ES = {SkillLevel.newbie: "principiante", SkillLevel.intermediate: "intermedio"}
MEDIUM_ES = {
    Medium.acrylic: "acrílico",
    Medium.pastels: "pastel seco",
    Medium.oil_pastels: "pastel al óleo",
    Medium.watercolor: "acuarela",
    Medium.oil: "óleo",
}
SUBJECT_ES = {
    Subject.single_objects: "objetos (bodegón)",
    Subject.human_anatomy: "figura humana",
    Subject.animals: "animales",
    Subject.plants: "plantas",
}

# Gemini tiende a contestar en el idioma del prompt; la instrucción de sistema lo fija en español
SYSTEM_INSTRUCTION = (
    "Eres Andy, una mentora de pintura para personas que están aprendiendo. "
    "Responde SIEMPRE en español neutro, en todos los campos de texto del JSON, "
    "aunque los nombres de los campos estén en inglés. Usa un tono cálido, claro y alentador."
)


def _config(schema) -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        response_mime_type="application/json",
        response_schema=schema,
    )


def generate_challenge(level: SkillLevel, medium: Medium, subject: Subject) -> ChallengeResponse:
    prompt = f"""Usa estos principios de arte:
- La regla de los tercios mejora la composición
- Proporciones humanas: 7 a 8 cabezas de alto
- La luz debe ser consistente
- Evita tangentes en la composición

Crea un reto de pintura para una persona de nivel {LEVEL_ES[level]}, con la técnica {MEDIUM_ES[medium]} y el tema {SUBJECT_ES[subject]}.
Incluye 2 búsquedas de YouTube relacionadas con el tema del reto (por ejemplo, para un bodegón
con formas básicas: "cómo dibujar formas básicas"); pueden ir en inglés si así se encuentran mejores videos.
La complejidad debe ser exactamente una de estas: Principiante, Intermedio o Avanzado.
Escribe el título, la descripción, los puntos a trabajar y los consejos en español."""

    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=_config(ChallengeResponse),
    )
    return _parsed(response)


def evaluate_artwork(
    image_base64: str, mime_type: str, challenge: Challenge,
    level: SkillLevel, medium: Medium,
) -> Evaluation:
    prompt = f"""Evalúa esta obra en {MEDIUM_ES[medium]} de una persona de nivel {LEVEL_ES[level]}.
El reto era: "{challenge.title}".
Comenta cada criterio (proporciones, composición, teoría del color, volumen y luz y sombra)
empezando con 👍, 👏 o 🏆, y dale a cada uno un puntaje entero de 0 a 5 en "scores".
Da una calificación general de 0 a 5 y responde true o false: ¿la obra cumple el reto?
Escribe toda la retroalimentación en español."""

    image = _image_part(image_base64, mime_type)  # valida antes de llamar a Gemini
    response = get_client().models.generate_content(
        model=MODEL_NAME,
        contents=[image, prompt],
        config=_config(Evaluation),
    )
    return _parsed(response)

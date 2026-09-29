import { SkillLevel, Medium, Subject, Challenge, ChallengeResponse, Evaluation } from '../types.ts';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// POST a la API y devuelve el JSON; si falla, lanza un Error con el mensaje de la API
async function post<T>(path: string, body: unknown, fallbackError: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch falla igual si la API está apagada o si el navegador la bloquea por CORS
    throw new Error(
      `No se pudo conectar con la API en ${API_URL}. Revisa que esté corriendo (abre ${API_URL}/health) ` +
      `y que la página esté abierta en http://localhost:5173.`
    );
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = typeof data?.detail === 'string' ? data.detail : null;
    throw new Error(detail ?? fallbackError);
  }
  return res.json() as Promise<T>;
}

export const assessSkillLevel = async (base64Image: string, mimeType: string): Promise<SkillLevel> => {
  const data = await post<{ level: SkillLevel }>(
    '/assess',
    { image_base64: base64Image, mime_type: mimeType },
    'Error al analizar la imagen',
  );
  return data.level;
};

export const generateChallenge = (
  level: SkillLevel, medium: Medium, subject: Subject
): Promise<ChallengeResponse> =>
  post<ChallengeResponse>('/challenge', { level, medium, subject }, 'Error al generar el reto');

export const evaluateArtwork = (
  base64Image: string, mimeType: string, challenge: Challenge,
  level: SkillLevel, medium: Medium
): Promise<Evaluation> =>
  post<Evaluation>(
    '/evaluate',
    { image_base64: base64Image, mime_type: mimeType, challenge, level, medium },
    'Error al evaluar la obra',
  );

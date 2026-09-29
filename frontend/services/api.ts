import { SkillLevel, Medium, Subject, Challenge, ChallengeResponse, Evaluation } from '../types.ts';
import { COPY, type Lang } from '../lib/copy.ts';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// POST a la API y devuelve el JSON; si falla, lanza un Error con el mensaje de la API
// (que ya viene en el idioma pedido) o uno propio
async function post<T>(path: string, body: unknown, lang: Lang, fallbackError: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch falla igual si la API está apagada o si el navegador la bloquea por CORS
    throw new Error(COPY[lang].errors.connection(API_URL));
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = typeof data?.detail === 'string' ? data.detail : null;
    throw new Error(detail ?? fallbackError);
  }
  return res.json() as Promise<T>;
}

export const assessSkillLevel = async (base64Image: string, mimeType: string, lang: Lang): Promise<SkillLevel> => {
  const data = await post<{ level: SkillLevel }>(
    '/assess',
    { image_base64: base64Image, mime_type: mimeType, language: lang },
    lang,
    COPY[lang].errors.assess,
  );
  return data.level;
};

export const generateChallenge = (
  level: SkillLevel, medium: Medium, subject: Subject, lang: Lang,
): Promise<ChallengeResponse> =>
  post<ChallengeResponse>('/challenge', { level, medium, subject, language: lang }, lang, COPY[lang].errors.challenge);

export const evaluateArtwork = (
  base64Image: string, mimeType: string, challenge: Challenge,
  level: SkillLevel, medium: Medium, lang: Lang,
): Promise<Evaluation> =>
  post<Evaluation>(
    '/evaluate',
    { image_base64: base64Image, mime_type: mimeType, challenge, level, medium, language: lang },
    lang,
    COPY[lang].errors.evaluate,
  );

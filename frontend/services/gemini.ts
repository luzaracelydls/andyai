import { GoogleGenAI, Type } from '@google/genai';
import { SkillLevel, Medium, Subject, Challenge, Evaluation } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
const MODEL_NAME = 'gemini-2.5-flash';

export const assessSkillLevel = async (base64Image: string, mimeType: string): Promise<SkillLevel> => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: "Analyze this artwork and determine if the artist is a 'Newbie' or 'Intermediate' level. Return only the word." }
      ]
    }
  });
  const text = response.text?.trim() || 'Newbie';
  return text.includes('Intermediate') ? SkillLevel.Intermediate : SkillLevel.Newbie;
};

export const generateChallenge = async (
  level: SkillLevel,
  medium: Medium,
  subject: Subject
): Promise<Challenge & { imagePrompts: string[], complexity: string }> => {
  const artKnowledge = `
Basic art principles:
- Rule of thirds improves composition
- Human proportions: 7-8 heads tall
- Light must be consistent
- Avoid tangents in composition
`;

  const prompt = `
  Use this art knowledge:
  
  ${artKnowledge}

  Create a ${level} level challenge for ${medium} painting of ${subject}. Include 2 descriptive image reference prompts and a specific complexity level label (e.g., Beginner, Moderate, Advanced).`;
  
  
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
          complexity: { type: Type.STRING, description: 'The complexity level of this specific challenge.' }
        },
        required: ['title', 'description', 'focusAreas', 'tips', 'imagePrompts', 'complexity'],
      },
    },
  });
  return JSON.parse(response.text!) as Challenge & { imagePrompts: string[], complexity: string };
};

export const evaluateArtwork = async (
  base64Image: string,
  mimeType: string,
  challenge: Challenge,
  level: SkillLevel,
  medium: Medium
): Promise<Evaluation & { rating: number }> => {
  const prompt = `Evaluate this ${medium} artwork (${level} level). Challenge: ${challenge.title}. 
  For each point (Proportions, Composition, Color Theory, Volume, Lighting/Shadow), start with 👍, 👏, or 🏆.
  
  Provide an overall rating 0-5.
  Provide a Yes (true) o No (false) answer if user meets challenge expectation`;
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          proportions: { type: Type.STRING },
          composition: { type: Type.STRING },
          colorTheory: { type: Type.STRING },
          volume: { type: Type.STRING },
          lightingShadow: { type: Type.STRING },
          overallEncouragement: { type: Type.STRING },
          rating: { type: Type.INTEGER },
          meetsChallenge: {type : Type.BOOLEAN}
        },
        required: ['proportions', 'composition', 'colorTheory', 'volume', 'lightingShadow', 'overallEncouragement', 'rating', 'meetsChallenge'],
      },
    },
  });
  return JSON.parse(response.text!) as Evaluation & { rating: number };
};

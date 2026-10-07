import { GoogleGenAI } from '@google/genai';

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  responseSchema: object
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModel = process.env.GEMINI_MODEL_FALLBACK || 'gemini-2.5-pro';
  const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS || '8000', 10);

  const attempt = async (currentModel: string, temperature: number) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema,
          temperature,
          maxOutputTokens: 700,
        },
      });
      clearTimeout(id);
      
      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');
      
      return JSON.parse(text);
    } catch (error: any) {
      clearTimeout(id);
      throw error;
    }
  };

  try {
    return await attempt(model, 0.2);
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    const isRateLimit = error?.status === 429 || error?.status === 503;
    
    if (isTimeout || isRateLimit) {
      console.warn(`Gemini call failed with ${error.name || error.status}. Retrying with fallback model...`);
      return await attempt(fallbackModel, 0.0);
    }
    throw error;
  }
}

/**
 * Gemini AI Service — calls Google Gemini API for content generation.
 * Uses the Gemini 2.0 Flash model via REST API (no SDK dependency).
 */

const GEMINI_MODEL = 'gemini-2.0-flash';

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  return key;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function generateContent(prompt: string): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: '', error: 'Gemini API Key ist nicht konfiguriert. Bitte NEXT_PUBLIC_GEMINI_API_KEY in .env.local setzen.' };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Gemini API error:', res.status, errBody);
      return { text: '', error: `Gemini API Fehler (${res.status}): ${errBody.slice(0, 200)}` };
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      return { text: '', error: 'Keine Antwort von Gemini erhalten.' };
    }

    const text = candidate.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    return { text };
  } catch (err) {
    console.error('Gemini fetch error:', err);
    return { text: '', error: `Netzwerkfehler: ${err instanceof Error ? err.message : String(err)}` };
  }
}

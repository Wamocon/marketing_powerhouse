/**
 * Client-safe AI helper.
 *
 * The actual Gemini call is routed through a server-side Next.js API endpoint so
 * the browser never receives the Google API key.
 */

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function generateContent(prompt: string, systemOverride?: string): Promise<GeminiResponse> {
  try {
    const response = await fetch('/api/ai/generate-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemOverride }),
    });

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      return { text: '', error: data.error ?? `AI Fehler (${response.status})` };
    }

    return { text: data.text ?? '', error: data.error };
  } catch (error) {
    return { text: '', error: error instanceof Error ? error.message : 'Unbekannter Fehler.' };
  }
}

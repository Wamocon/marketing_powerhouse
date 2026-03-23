/**
 * Gemini AI Service — calls Google Gemini API for content generation.
 * Uses Gemini 2.5 Flash for a balance of quality and speed.
 *
 * Architecture notes (March 2026):
 * - System instruction is sent via the `systemInstruction` field for role grounding
 * - Temperature is kept moderate (0.55) for professional marketing output
 * - Structured output prompting ensures actionable, formatted results
 */

const GEMINI_MODEL = 'gemini-2.5-flash';

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  return key;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * System instruction that grounds the AI as a professional marketing strategist.
 * Separated from the user prompt per Gemini best practices.
 */
const SYSTEM_INSTRUCTION = `You are an elite Senior Marketing Strategist, Conversion Copywriter, and Creative Director working at a top-tier agency. You have 15+ years of experience creating campaigns for brands like Nike, HubSpot, and Patagonia.

CORE PRINCIPLES:
- Every word must serve a purpose. Cut filler. Be precise.
- Ground every recommendation in the specific brand, audience, and campaign context provided.
- Produce work that is immediately usable by a marketing team — not generic templates.
- Write in the exact language requested (German or English). If German is required, write natively — not translated.
- Use concrete specifics: real numbers, specific scenarios, actual hooks — never placeholders like "[insert here]" or "[Firmenname]".
- Apply proven copywriting frameworks (PAS, AIDA, BAB) where appropriate without naming them explicitly.
- Every CTA must be specific and action-oriented, not generic ("Jetzt starten" > "Klicke hier").
- Output must be clearly structured with headers, numbered items, and separation between variants.
- When a knowledge base is provided, treat it as the ONLY source of truth. Never invent products, prices, features, or claims not in the knowledge base.

QUALITY STANDARDS:
- Professional agency quality — something a CMO would approve and present to the C-suite.
- Tone must match the brand's defined voice exactly — study the adjectives and communication rules.
- All output must be factually defensible — no unsubstantiated claims.
- Hashtags must be researched-quality, not generic (#Marketing is useless).
- Subject lines and hooks must pass the "would I stop scrolling?" test.
- Address the target audience's specific pain points — use their language, not marketing jargon.
- Every piece of content must have a clear, measurable objective.

OUTPUT FORMAT:
- Use Markdown formatting for readability (headers, bold, lists).
- Separate variants clearly with visual dividers.
- Include practical implementation notes where helpful.
- End each major section with a brief rationale explaining the strategic reasoning.`;

export async function generateContent(prompt: string, systemOverride?: string): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: '', error: 'Gemini API Key ist nicht konfiguriert. Bitte NEXT_PUBLIC_GEMINI_API_KEY in .env.local setzen.' };
  }

  const model = GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemOverride ?? SYSTEM_INSTRUCTION }],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.55,
          topP: 0.90,
          topK: 40,
          maxOutputTokens: 8192,
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

    const text = candidate.content?.parts
      ?.filter((p: { thought?: boolean }) => !p.thought)
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('') ?? '';
    return { text };
  } catch (err) {
    console.error('Gemini fetch error:', err);
    return { text: '', error: `Netzwerkfehler: ${err instanceof Error ? err.message : String(err)}` };
  }
}

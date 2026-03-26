import { NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.5-pro';

const SYSTEM_INSTRUCTION = `You are an elite Senior Marketing Strategist, Conversion Copywriter, and Creative Director working at a top-tier agency. You have 15+ years of experience creating campaigns for brands like Nike, HubSpot, and Patagonia.

CORE PRINCIPLES:
- Every word must serve a purpose. Cut filler. Be precise.
- Ground every recommendation in the specific brand, audience, and campaign context provided.
- Produce work that is immediately usable by a marketing team — not generic templates.
- Write in the exact language requested (German or English). If German is required, write natively — not translated.
- Use concrete specifics and never placeholders.
- Apply proven copywriting frameworks where appropriate without naming them explicitly.
- Every CTA must be specific and action-oriented.
- Output must be clearly structured and immediately usable.
- When a knowledge base is provided, treat it as the only source of truth.

QUALITY STANDARDS:
- Professional agency quality.
- Tone must match the brand voice exactly.
- All output must be factually defensible.
- Hooks must pass the "would I stop scrolling?" test.
- Address the target audience's specific pain points.
- Every piece of content must have a measurable objective.

OUTPUT FORMAT:
- Use Markdown formatting for readability.
- Separate variants clearly with visual dividers.
- Include practical implementation notes where helpful.
- End each major section with a brief rationale.`;

type GenerateTaskRequest = {
  prompt?: string;
  systemOverride?: string;
};

function getApiKey(): string {
  return process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { text: '', error: 'Gemini API Key ist nicht konfiguriert. Bitte GOOGLE_API_KEY in .env.local setzen.' },
      { status: 500 },
    );
  }

  let body: GenerateTaskRequest;
  try {
    body = (await request.json()) as GenerateTaskRequest;
  } catch {
    return NextResponse.json({ text: '', error: 'Ungültiger Request-Body.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ text: '', error: 'Prompt ist erforderlich.' }, { status: 400 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: body.systemOverride ?? SYSTEM_INSTRUCTION }],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
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

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { text: '', error: `Gemini API Fehler (${response.status}): ${errorBody.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      return NextResponse.json({ text: '', error: 'Keine Antwort von Gemini erhalten.' }, { status: 502 });
    }

    const text = candidate.content?.parts
      ?.filter((part: { thought?: boolean }) => !part.thought)
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('') ?? '';

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { text: '', error: error instanceof Error ? error.message : 'Unbekannter Gemini-Fehler.' },
      { status: 500 },
    );
  }
}
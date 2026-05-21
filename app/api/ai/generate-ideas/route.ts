import { NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.5-pro';

const SYSTEM_INSTRUCTION = `You are an elite Content Strategist and Creative Director with 15+ years of experience.

YOUR TASK: Generate creative, strategically sound content ideas based on the provided brand, campaign, and audience context.

RULES:
- Output ONLY a valid JSON array. No markdown fences, no explanation, no preamble.
- Every idea must be immediately actionable by a marketing team.
- Ground every idea in the specific brand context, audience data, and campaign goals provided.
- Mix content types, platforms, and journey phases for a diverse content plan.
- Each idea must solve a real problem or address a real goal of the target audience.
- Never suggest generic marketing platitudes.
- Write in the exact language requested.
- The JSON must be parseable by JSON.parse() directly.`;

interface GenerateIdeasRequest {
  prompt?: string;
}

function getApiKey(): string {
  return process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = getApiKey();

  let body: GenerateIdeasRequest;
  try {
    body = (await request.json()) as GenerateIdeasRequest;
  } catch {
    return NextResponse.json({ ideas: [], error: 'Ungültiger Request-Body.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ ideas: [], error: 'Prompt ist erforderlich.' }, { status: 400 });
  }

  // If no API key, return mock data
  if (!apiKey) {
    const mockIdeas = generateMockIdeas(prompt);
    return NextResponse.json({ ideas: mockIdeas, isMock: true });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
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
      // On API key errors, fall back to mock data instead of failing
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const mockIdeas = generateMockIdeas(prompt);
        return NextResponse.json({ ideas: mockIdeas, isMock: true });
      }
      const errorBody = await response.text();
      return NextResponse.json(
        { ideas: [], error: `Gemini API Fehler (${response.status}): ${errorBody.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      return NextResponse.json({ ideas: [], error: 'Keine Antwort von Gemini erhalten.' }, { status: 502 });
    }

    const rawText = candidate.content?.parts
      ?.filter((part: { thought?: boolean }) => !part.thought)
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('') ?? '';

    try {
      const ideas = JSON.parse(rawText);
      if (!Array.isArray(ideas)) {
        return NextResponse.json({ ideas: [], error: 'KI hat kein gültiges Array zurückgegeben.' }, { status: 502 });
      }
      return NextResponse.json({ ideas, isMock: false });
    } catch {
      // Try to extract JSON from markdown fences
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const ideas = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ ideas, isMock: false });
        } catch {
          // Fall through
        }
      }
      return NextResponse.json(
        { ideas: [], error: 'KI-Antwort konnte nicht als JSON geparst werden.' },
        { status: 502 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { ideas: [], error: error instanceof Error ? error.message : 'Unbekannter Fehler.' },
      { status: 500 },
    );
  }
}

/**
 * Generates mock content ideas when no API key is configured.
 * Parses the prompt to extract the requested idea count.
 */
function generateMockIdeas(prompt: string): Array<Record<string, string>> {
  const countMatch = prompt.match(/exakt (\d+) Ideen|exactly (\d+) ideas/i);
  const count = parseInt(countMatch?.[1] || countMatch?.[2] || '5', 10);

  const mockTemplates = [
    {
      title: 'LinkedIn Thought-Leadership Post: Branchentrend 2026',
      description: 'Ein tiefgehender LinkedIn-Post, der einen aktuellen Branchentrend analysiert und die Expertise des Unternehmens positioniert.',
      platform: 'LinkedIn',
      contentType: 'social',
      journeyPhase: 'Awareness',
      taskType: 'Post (Beschreibung)',
      rationale: 'Positioniert die Marke als Thought Leader und generiert organische Reichweite bei der B2B-Zielgruppe.',
    },
    {
      title: 'Instagram Carousel: 5 Tipps für [Kernthema]',
      description: 'Ein visuell ansprechendes Carousel mit konkreten, umsetzbaren Tipps, die direkt auf die Schmerzpunkte der Zielgruppe eingehen.',
      platform: 'Instagram',
      contentType: 'social',
      journeyPhase: 'Consideration',
      taskType: 'Karousell',
      rationale: 'Carousels haben die höchste Engagement-Rate auf Instagram und liefern teilbaren Mehrwert.',
    },
    {
      title: 'E-Mail Newsletter: Monatlicher Branchen-Digest',
      description: 'Ein kuratierter Newsletter mit den wichtigsten Entwicklungen, eigenen Insights und einem klaren CTA.',
      platform: 'E-Mail',
      contentType: 'email',
      journeyPhase: 'Retention',
      taskType: 'E-Mail-Newsletter',
      rationale: 'Stärkt die Kundenbindung und hält die Marke im Bewusstsein der Bestandskunden.',
    },
    {
      title: 'Blog-Artikel: Praxisleitfaden [Thema]',
      description: 'Ein SEO-optimierter Leitfaden, der ein konkretes Problem der Zielgruppe Schritt für Schritt löst.',
      platform: 'Blog',
      contentType: 'content',
      journeyPhase: 'Consideration',
      taskType: 'Landingpage',
      rationale: 'Generiert organischen Traffic und positioniert die Marke als hilfreiche Ressource in der Recherche-Phase.',
    },
    {
      title: 'Kurzvideo: Behind-the-Scenes Einblick',
      description: 'Ein authentisches 30-Sekunden Video, das einen Blick hinter die Kulissen des Unternehmens gibt und Nahbarkeit schafft.',
      platform: 'Instagram',
      contentType: 'social',
      journeyPhase: 'Awareness',
      taskType: 'Videoskript',
      rationale: 'Authentizität baut Vertrauen auf und humanisiert die Marke für neue Interessenten.',
    },
    {
      title: 'Google Ads Kampagne: Problem-Lösung',
      description: 'Search Ads, die auf die konkreten Schmerzpunkte der Zielgruppe abzielen und zur Landingpage führen.',
      platform: 'Google Ads',
      contentType: 'ads',
      journeyPhase: 'Purchase',
      taskType: 'Task',
      rationale: 'Fängt aktive Suchintention ab und konvertiert Interessenten in der Kaufphase.',
    },
    {
      title: 'LinkedIn Foto-Post: Team-Highlight',
      description: 'Ein Foto-Post, der ein Teammitglied oder einen Meilenstein zeigt und die Unternehmenskultur sichtbar macht.',
      platform: 'LinkedIn',
      contentType: 'social',
      journeyPhase: 'Advocacy',
      taskType: 'Post (Foto)',
      rationale: 'Employer Branding und Authentizität stärken die Markenwahrnehmung bei Partnern und Bewerbern.',
    },
    {
      title: 'Kunden-Case-Study als Carousel',
      description: 'Ein Carousel, das eine echte Kundenstory in Problem-Lösung-Ergebnis Struktur erzählt.',
      platform: 'LinkedIn',
      contentType: 'social',
      journeyPhase: 'Purchase',
      taskType: 'Karousell',
      rationale: 'Social Proof in der Kaufentscheidungsphase ist der stärkste Conversion-Hebel im B2B.',
    },
    {
      title: 'Willkommens-E-Mail-Serie',
      description: 'Eine 3-teilige E-Mail-Serie für neue Leads: Willkommen, Mehrwert, erster CTA.',
      platform: 'E-Mail',
      contentType: 'email',
      journeyPhase: 'Consideration',
      taskType: 'E-Mail-Nachricht',
      rationale: 'Automatisierte Nurturing-Sequenz wandelt neue Leads systematisch in warme Kontakte um.',
    },
    {
      title: 'Interaktive Story-Umfrage',
      description: 'Eine Instagram Story mit Umfrage-Sticker, die direkt auf einen Schmerzpunkt der Zielgruppe eingeht.',
      platform: 'Instagram',
      contentType: 'social',
      journeyPhase: 'Awareness',
      taskType: 'Post (Beschreibung)',
      rationale: 'Interaktive Stories generieren hohes Engagement und liefern wertvolle Zielgruppen-Insights.',
    },
    {
      title: 'TikTok Trend-Adaptation',
      description: 'Einen aktuellen TikTok-Trend auf die eigene Branche adaptieren und mit Humor die Marke positionieren.',
      platform: 'TikTok',
      contentType: 'social',
      journeyPhase: 'Awareness',
      taskType: 'Videoskript',
      rationale: 'Trend-Riding auf TikTok bietet virales Potenzial bei jüngeren Zielgruppen.',
    },
    {
      title: 'Webinar-Promotion Post',
      description: 'Ein Post, der ein bevorstehendes Event oder Webinar bewirbt und den Mehrwert für Teilnehmer klar kommuniziert.',
      platform: 'LinkedIn',
      contentType: 'event',
      journeyPhase: 'Consideration',
      taskType: 'Post (Beschreibung)',
      rationale: 'Events generieren qualifizierte Leads und ermöglichen persönlichen Kontakt in der Consideration-Phase.',
    },
    {
      title: 'Kunden-Testimonial Video',
      description: 'Ein kurzes Video mit einem echten Kundenzitat, das die Zusammenarbeit und Ergebnisse hervorhebt.',
      platform: 'YouTube',
      contentType: 'social',
      journeyPhase: 'Purchase',
      taskType: 'Videoskript',
      rationale: 'Video-Testimonials sind der glaubwürdigste Social Proof und unterstützen die finale Kaufentscheidung.',
    },
    {
      title: 'Facebook Community Post',
      description: 'Ein Diskussionsbeitrag, der die Community einbezieht und zum Austausch über ein relevantes Thema einlädt.',
      platform: 'Facebook',
      contentType: 'social',
      journeyPhase: 'Retention',
      taskType: 'Post (Beschreibung)',
      rationale: 'Community-Building stärkt die Kundenbindung und generiert User-Generated Content.',
    },
    {
      title: 'Retargeting Ad: Warenkorbabbrecher',
      description: 'Eine Anzeige, die Warenkorbabbrecher oder Website-Besucher erneut anspricht und mit einem Anreiz zur Conversion motiviert.',
      platform: 'Google Ads',
      contentType: 'ads',
      journeyPhase: 'Purchase',
      taskType: 'Task',
      rationale: 'Retargeting hat die höchste Conversion-Rate und holt verlorene Interessenten zurück.',
    },
  ];

  return mockTemplates.slice(0, Math.min(count, mockTemplates.length));
}

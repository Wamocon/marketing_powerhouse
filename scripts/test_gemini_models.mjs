/**
 * Compare Gemini models with a full marketing prompt
 */
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/)?.[1]?.trim();
if (!apiKey) { console.error('No API key found'); process.exit(1); }

const prompt = `Du bist der KI-Assistent von Momentum Marketing OS.

UNTERNEHMEN: WAMOCON Academy
BRANCHE: IT-Trainings & Weiterbildung
TAGLINE: Deine Zukunft beginnt hier.
VISION: Die führende Anlaufstelle für IT-Weiterbildung im DACH-Raum
TONALITÄT: professionell, kompetent, motivierend
ZIELGRUPPE: IT-Entscheider, 35-50 Jahre, DACH-Region, Unternehmen 50-500 MA
SCHMERZEN: Fachkräftemangel, veraltete IT-Skills, fehlende Cloud-Kompetenz
KAMPAGNE: Q1 2026 - Cloud Computing Offensive
KANAL: LinkedIn
CONTENT-TYP: Post

Erstelle einen LinkedIn-Post für die WAMOCON Academy zum Thema 'Warum Cloud-Zertifizierungen für Unternehmen ein Wettbewerbsvorteil sind'. Der Post sollte:
- Maximal 1300 Zeichen
- 3-5 relevante Hashtags
- Ein Call-to-Action am Ende
- Professional aber zugänglich`;

const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.1-pro-preview'];

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      }),
    });
    const data = await res.json();
    const ms = Date.now() - start;

    if (data.error) {
      console.log(`\n=== ${model} === ERROR: ${data.error.message}`);
      return;
    }

    const parts = (data.candidates?.[0]?.content?.parts || []).filter(p => !p.thought);
    const text = parts.map(p => p.text || '').join('');
    const u = data.usageMetadata || {};
    console.log(`\n=== ${model} === (${ms}ms | thought: ${u.thoughtsTokenCount || 0} | output: ${u.candidatesTokenCount || 0} tokens)`);
    console.log(text);
    console.log(`--- [${text.length} chars] ---`);
  } catch (err) {
    console.log(`\n=== ${model} === FETCH ERROR: ${err.message}`);
  }
}

for (const m of models) {
  await testModel(m);
}

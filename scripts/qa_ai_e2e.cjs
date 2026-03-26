/**
 * E2E AI Quality Test
 * Builds prompts using the same logic as the app, calls Gemini API,
 * and validates the quality of results against concrete criteria.
 *
 * Usage: node scripts/qa_ai_e2e.cjs
 */
const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');

// Load env
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'test';

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
  console.error('Missing env vars (SUPABASE_URL, SUPABASE_KEY, GOOGLE_API_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: SCHEMA } });

// ─── Gemini call (mirrors src/lib/gemini.ts) ───────────────

const SYSTEM_INSTRUCTION = `You are an elite Senior Marketing Strategist, Conversion Copywriter, and Creative Director working at a top-tier agency. You have 15+ years of experience creating campaigns for brands like Nike, HubSpot, and Patagonia.

CORE PRINCIPLES:
- Every word must serve a purpose. Cut filler. Be precise.
- Ground every recommendation in the specific brand, audience, and campaign context provided.
- Produce work that is immediately usable by a marketing team — not generic templates.
- Write in the exact language requested (German or English). If German is required, write natively — not translated.
- Use concrete specifics: real numbers, specific scenarios, actual hooks — never placeholders like "[insert here]" or "[Firmenname]".
- Apply proven copywriting frameworks (PAS, AIDA, BAB) where appropriate without naming them explicitly.
- Every CTA must be specific and action-oriented, not generic.
- Output must be clearly structured with headers, numbered items, and separation between variants.
- When a knowledge base is provided, treat it as the ONLY source of truth. Never invent products, prices, features, or claims not in the knowledge base.

QUALITY STANDARDS:
- Professional agency quality — something a CMO would approve and present to the C-suite.
- Tone must match the brand's defined voice exactly.
- All output must be factually defensible — no unsubstantiated claims.
- Hashtags must be researched-quality, not generic (#Marketing is useless).
- Subject lines and hooks must pass the "would I stop scrolling?" test.
- Address the target audience's specific pain points — use their language, not marketing jargon.
- Every piece of content must have a clear, measurable objective.

OUTPUT FORMAT:
- Use Markdown formatting for readability.
- Separate variants clearly with visual dividers.
- Include practical implementation notes where helpful.
- End each major section with a brief rationale.`;

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.55, topP: 0.90, topK: 40, maxOutputTokens: 8192 },
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
    return { text: '', error: `HTTP ${res.status}: ${errBody.slice(0, 300)}` };
  }
  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate) return { text: '', error: 'No candidate returned' };
  const text = candidate.content?.parts
    ?.filter(p => !p.thought)
    ?.map(p => p.text ?? '').join('') ?? '';
  return { text };
}

// ─── Load test data from Supabase ──────────────────────────

async function loadTestData() {
  // Get a company
  const { data: companies } = await supabase.from('companies').select('*').limit(1);
  const company = companies?.[0];
  if (!company) throw new Error('No company in DB');

  // Get positioning
  const { data: posData } = await supabase.from('company_positioning')
    .select('*').eq('company_id', company.id).limit(1);
  const positioning = posData?.[0]?.data || {};

  // Get keywords
  const { data: kwData } = await supabase.from('company_keywords')
    .select('*').eq('company_id', company.id);
  const companyKeywords = kwData || [];

  // Get campaigns
  const { data: campaignData } = await supabase.from('campaigns')
    .select('*').eq('company_id', company.id).limit(1);
  const campaign = campaignData?.[0] || null;

  // Get audiences
  const { data: audData } = await supabase.from('audiences')
    .select('*').eq('company_id', company.id).limit(1);
  const audience = audData?.[0] || null;

  // Get journeys
  const { data: jData } = await supabase.from('customer_journeys')
    .select('*').eq('company_id', company.id).limit(1);
  const journey = jData?.[0] || null;

  // Get touchpoints
  const { data: tpData } = await supabase.from('touchpoints')
    .select('*').eq('company_id', company.id).limit(1);
  const touchpoint = tpData?.[0] || null;

  // Get knowledge documents
  const { data: kbData } = await supabase.from('knowledge_documents')
    .select('*').eq('company_id', company.id).eq('is_active', true);
  const knowledgeDocs = kbData || [];

  // Get tasks
  const { data: taskData } = await supabase.from('tasks')
    .select('*').eq('company_id', company.id).limit(5);
  const tasks = taskData || [];

  return { company, positioning, companyKeywords, campaign, audience, journey, touchpoint, knowledgeDocs, tasks };
}

// ─── Simplified prompt builder (mirrors src/lib/promptBuilder.ts) ──

function buildTestPrompt({ positioning, companyKeywords, campaign, audience, journey, touchpoint, knowledgeDocs, task }) {
  const p = positioning;
  const valuesStr = (p.values ?? []).map(v => `${v.title}: ${v.description}`).join('; ');
  const tov = p.toneOfVoice;
  const tovStr = tov ? `Adjektive: ${(tov.adjectives ?? []).join(', ')}. ${tov.description ?? ''}` : 'Nicht definiert';

  let prompt = `# BRIEFING: "${task.title}" für ${p.name || 'das Unternehmen'}

Du erstellst Inhalte spezifisch für ${p.name || 'das Unternehmen'}, gerichtet an ${audience?.name || 'die definierte Zielgruppe'}${campaign ? ` im Rahmen der Kampagne "${campaign.name}"` : ''}. Jedes Wort muss die einzigartige Markenstimme widerspiegeln, die konkreten Schmerzpunkte dieser Zielgruppe ansprechen und messbare Handlungen auslösen. Verwende AUSSCHLIESSLICH die unten bereitgestellten Fakten und Kontextdaten — erfinde keine Produkte, Preise oder Behauptungen.

---

## MARKENIDENTITÄT

Unternehmensname: ${p.name || 'Nicht definiert'}
Tagline: ${p.tagline || 'Nicht definiert'}
Vision: ${p.vision || 'Nicht definiert'}
Mission: ${p.mission || 'Nicht definiert'}
Werte: ${valuesStr || 'Keine definiert'}
Tone of Voice: ${tovStr}
Branche: ${p.industry || 'Nicht angegeben'}

Kommunikationsregeln:
- DO: ${(p.dos ?? []).join(' | ') || 'Keine definiert'}
- DON'T: ${(p.donts ?? []).join(' | ') || 'Keine definiert'}

SEO-Keywords: ${(companyKeywords ?? []).map(k => `${k.term} (${k.category})`).join(', ') || 'Keine'}`;

  if (campaign) {
    prompt += `\n\n## KAMPAGNE\nName: ${campaign.name}\nZiel: ${campaign.description || 'Nicht angegeben'}`;
    if (campaign.master_prompt) prompt += `\nKampagnen-Master-Prompt: ${campaign.master_prompt}`;
    if (campaign.campaign_keywords?.length) prompt += `\nKeywords: ${campaign.campaign_keywords.join(', ')}`;
  }

  if (audience) {
    prompt += `\n\n## ZIELGRUPPE (PERSONA)\nName: ${audience.name}\nSegment: ${audience.segment || 'Nicht definiert'}`;
    if (audience.pain_points?.length) prompt += `\nSchmerzpunkte: ${audience.pain_points.join(' | ')}`;
    if (audience.goals?.length) prompt += `\nZiele: ${audience.goals.join(' | ')}`;
    if (audience.preferred_channels?.length) prompt += `\nBevorzugte Kanäle: ${audience.preferred_channels.join(', ')}`;
  }

  if (knowledgeDocs.length > 0) {
    const byCategory = {};
    for (const doc of knowledgeDocs) {
      if (!byCategory[doc.category]) byCategory[doc.category] = [];
      byCategory[doc.category].push(doc);
    }
    prompt += '\n\n## WISSENSBASIS (KNOWLEDGE BASE)\nDie folgenden Informationen sind verifizierte Firmendaten. Verwende sie als primäre Faktenquelle.\n';
    for (const [cat, docs] of Object.entries(byCategory)) {
      const contents = docs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
      prompt += `\n### ${cat.toUpperCase()}\n${contents}`;
    }
  }

  prompt += `\n\n## AUFGABE\nTitel: ${task.title}\nTyp: ${task.type || 'Allgemein'}\nPlattform: ${task.platform || 'Übergreifend'}\nBeschreibung: ${task.description || 'Keine Beschreibung vorhanden.'}`;

  prompt += `\n\n## OUTPUTSPRACHE\nSchreibe den GESAMTEN Output auf Deutsch. Verwende professionelles Marketing-Deutsch.`;

  // Type template (simplified — just use Post for testing)
  prompt += `\n\n---\n\n## AUFGABENTYP: Social Post (Text)

Erstelle 3 Post-Varianten — jeweils vollständig und sofort nutzbar:

### VARIANTE 1 — SHORT (max. 350 Zeichen)
Hook → Kernbotschaft → CTA

### VARIANTE 2 — MEDIUM (351–700 Zeichen)
Hook → Problem/Erkenntnis → Lösung/Mehrwert → CTA

### VARIANTE 3 — BOLD (701–1.200 Zeichen)
Provokante These → Begründung → Perspektivwechsel → CTA

Für JEDE Variante liefere:
1. **Hook** (erste Zeile — muss Scroll-Stopper sein)
2. **Haupttext** (exakt in der Zeichengrenze)
3. **Call-to-Action** (spezifisch, nicht generisch)
4. **5 Hashtags** (nischenspezifisch, keine Allgemeinplätze wie #Marketing)
5. **Begründung** (1 Satz: warum diese Variante für die Persona wirkt)`;

  prompt += `\n\n## QUALITÄTSANFORDERUNGEN

ABSOLUT VERBOTEN:
- Generische Floskeln ("In der heutigen Zeit...", "Immer mehr Menschen...")
- Placeholder-Texte ("[Hier einfügen]", "XYZ", "[Firmenname]")
- Unbelegte Zahlen oder Behauptungen
- Widerspruch zu Brand-Werten oder Wissensbasis

PFLICHT:
- Jeder Hook muss den Scroll stoppen
- Jeder CTA muss eine SPEZIFISCHE Handlung auslösen
- Fakten NUR aus der Wissensbasis verwenden
- Output muss SOFORT nutzbar sein (Copy-Paste-ready)

Nach dem Hauptoutput, liefere:
### A/B-TEST IDEEN
3 konkrete Testideen mit Hypothese und erwarteter Wirkung.`;

  return prompt;
}

// ─── Quality checks ────────────────────────────────────────

function checkQuality(text, ctx) {
  const checks = [];
  let pass = 0;
  let fail = 0;

  function check(name, condition) {
    if (condition) {
      checks.push({ name, ok: true });
      pass++;
    } else {
      checks.push({ name, ok: false });
      fail++;
    }
  }

  // 1. Not empty
  check('Response is not empty', text.length > 100);
  
  // 2. Contains structured variants
  check('Contains multiple variants/sections', (text.match(/###|VARIANTE|VERSION|Variante|---/gi) || []).length >= 3);

  // 3. Contains CTAs
  check('Contains CTA elements', /CTA|call.to.action|jetzt|buche|starte|registr|anmeld|erfahre/gi.test(text));

  // 4. No forbidden generic phrases
  const genericPhrases = [
    'In der heutigen Zeit',
    'Immer mehr Menschen',
    'Es ist kein Geheimnis',
    '[Hier einfügen]',
    '[Firmenname]',
    'XYZ',
  ];
  const hasGeneric = genericPhrases.some(phrase => text.includes(phrase));
  check('No forbidden generic phrases', !hasGeneric);

  // 5. Contains brand-specific content (company name or keywords)
  const brandName = ctx.positioning?.name || '';
  const hasBrandRef = brandName && text.toLowerCase().includes(brandName.toLowerCase());
  const hasAnyKeyword = (ctx.companyKeywords || []).some(k => 
    text.toLowerCase().includes(k.term?.toLowerCase() || '')
  );
  check('Contains brand-specific references', hasBrandRef || hasAnyKeyword);

  // 6. Contains audience-specific content
  const audience = ctx.audience;
  if (audience) {
    const painPoints = audience.pain_points || [];
    const hasAudienceRef = painPoints.some(pp => {
      const words = pp.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      return words.some(w => text.toLowerCase().includes(w));
    });
    check('References audience pain points', hasAudienceRef || text.toLowerCase().includes((audience.name || '').toLowerCase()));
  }

  // 7. Contains hashtags (for social posts)
  check('Contains hashtags', (text.match(/#\w+/g) || []).length >= 3);

  // 8. Written in German
  const germanIndicators = ['die', 'der', 'das', 'und', 'für', 'mit', 'ist', 'ein', 'nicht', 'auf'];
  const germanCount = germanIndicators.filter(w => text.toLowerCase().includes(` ${w} `)).length;
  check('Output is in German', germanCount >= 5);

  // 9. Contains A/B test ideas
  check('Contains A/B test section', /A\/B.?Test|Testidee|Hypothese/gi.test(text));

  // 10. Reasonable length (not too short / too long)
  check('Reasonable output length (500-15000 chars)', text.length >= 500 && text.length <= 15000);

  // 11. No placeholder brackets
  check('No unfilled placeholders [...]', !/\[(?:Hier|Insert|Name|Firma|URL)\s/gi.test(text));

  // 12. Knowledge base used (if docs exist)
  if (ctx.knowledgeDocs?.length > 0) {
    // Check if any knowledge doc content keywords appear in the output
    const kbWords = ctx.knowledgeDocs
      .flatMap(d => d.content.split(/\s+/).filter(w => w.length > 6))
      .slice(0, 20);
    const kbUsed = kbWords.some(w => text.toLowerCase().includes(w.toLowerCase()));
    check('Knowledge base content referenced', kbUsed);
  }

  return { checks, pass, fail };
}

// ─── Main ──────────────────────────────────────────────────

(async () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  E2E AI Quality Test');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Load data
  console.log('📁 Loading test data from Supabase...');
  let data;
  try {
    data = await loadTestData();
  } catch (err) {
    console.error('Failed to load test data:', err.message);
    process.exit(1);
  }

  const { company, positioning, companyKeywords, campaign, audience, knowledgeDocs, tasks } = data;
  console.log(`  Company: ${company.name}`);
  console.log(`  Positioning: ${positioning.name || 'empty'}`);
  console.log(`  Campaign: ${campaign?.name || 'none'}`);
  console.log(`  Audience: ${audience?.name || 'none'}`);
  console.log(`  Knowledge docs: ${knowledgeDocs.length}`);
  console.log(`  Tasks: ${tasks.length}`);

  // Pick a task to test with (or create a mock one)
  const testTask = tasks.find(t => t.type && t.type.includes('Post')) || tasks[0] || {
    title: 'Instagram Post: Frühjahrs-Kursstart bewerben',
    type: 'Post (Beschreibung)',
    platform: 'Instagram',
    description: 'Erstelle einen motivierenden Instagram-Post der den Start unseres neuen Präsenzkurses in Eschborn bewirbt. Fokus auf Quereinstieg und Bildungsgutschein.',
  };

  console.log(`\n📝 Test task: "${testTask.title}" (${testTask.type || 'Allgemein'})\n`);

  // 2. Build prompt
  console.log('🔧 Building prompt...');
  const prompt = buildTestPrompt({
    positioning,
    companyKeywords,
    campaign,
    audience,
    journey: data.journey,
    touchpoint: data.touchpoint,
    knowledgeDocs,
    task: testTask,
  });

  console.log(`  Prompt length: ${prompt.length} chars`);
  console.log(`  Knowledge docs injected: ${knowledgeDocs.length > 0 ? 'YES ✓' : 'NO ✗'}`);

  // Show a snippet of the prompt for debugging
  console.log('\n  --- Prompt preview (first 500 chars) ---');
  console.log('  ' + prompt.slice(0, 500).replace(/\n/g, '\n  '));
  console.log('  ...\n');

  // 3. Call Gemini
  console.log('🤖 Calling Gemini 2.5 Flash...');
  const startTime = Date.now();
  const result = await callGemini(prompt);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.error) {
    console.error(`\n  ❌ Gemini API Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`  Response received in ${elapsed}s`);
  console.log(`  Output length: ${result.text.length} chars\n`);

  // 4. Quality checks
  console.log('📊 Quality Analysis');
  console.log('─────────────────────────────────────────────\n');
  
  const quality = checkQuality(result.text, {
    positioning,
    companyKeywords,
    audience,
    knowledgeDocs,
  });

  for (const c of quality.checks) {
    console.log(`  ${c.ok ? '✅' : '❌'} ${c.name}`);
  }

  console.log(`\n  RESULT: ${quality.pass}/${quality.checks.length} checks passed`);

  // 5. Show full output
  console.log('\n═══════════════════════════════════════════════');
  console.log('  Generated Content (Full Output)');
  console.log('═══════════════════════════════════════════════\n');
  console.log(result.text);

  // 6. Summary
  console.log('\n═══════════════════════════════════════════════');
  if (quality.fail === 0) {
    console.log('  ✅ ALL QUALITY CHECKS PASSED');
  } else {
    console.log(`  ⚠️  ${quality.fail} QUALITY CHECK(S) FAILED`);
    console.log('  Failed checks:');
    for (const c of quality.checks.filter(c => !c.ok)) {
      console.log(`    - ${c.name}`);
    }
  }
  console.log('═══════════════════════════════════════════════');

  process.exit(quality.fail > 0 ? 1 : 0);
})();

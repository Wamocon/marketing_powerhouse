/**
 * Prompt Builder — implements MASTER_PROMPT_SYSTEM.md
 * Builds context-aware prompts from positioning, campaign, audience,
 * journey, knowledge base, and task data.
 *
 * Key improvements (March 2026):
 * - Knowledge base injection (RAG-lite: brand_voice, product, persona, past_post, guidelines)
 * - Platform-specific output calibration
 * - Language-aware prompt rendering (DE/EN)
 * - Concrete quality anchors instead of vague instructions
 */

import type { Audience, Campaign, CustomerJourney, JourneyStage, KnowledgeDocument, Task, Touchpoint } from '../types';
import type { CompanyKeyword, CompanyPositioning } from '../types/dashboard';

// ─── Types ─────────────────────────────────────────────────

export interface PromptContext {
  positioning: CompanyPositioning;
  companyKeywords: CompanyKeyword[];
  campaign?: Campaign | null;
  audience?: Audience | null;
  journey?: CustomerJourney | null;
  journeyStage?: JourneyStage | null;
  touchpoint?: Touchpoint | null;
  knowledgeDocs?: KnowledgeDocument[];
  task: Task;
  language?: string;
}

// ─── Knowledge Base Renderer ───────────────────────────────

function renderKnowledgeBase(docs: KnowledgeDocument[]): string {
  if (!docs || docs.length === 0) return '';

  const sections: string[] = [];
  const byCategory = new Map<string, KnowledgeDocument[]>();
  for (const doc of docs) {
    const arr = byCategory.get(doc.category) ?? [];
    arr.push(doc);
    byCategory.set(doc.category, arr);
  }

  const categoryLabels: Record<string, string> = {
    brand_voice: 'BRAND VOICE & IDENTITY',
    product: 'PRODUCTS & SERVICES',
    persona: 'PERSONA RESEARCH',
    past_post: 'SUCCESSFUL PAST CONTENT (use as style reference)',
    guideline: 'CONTENT GUIDELINES & RULES',
    style_reference: 'VISUAL STYLE REFERENCE',
    industry: 'MARKET & INDUSTRY CONTEXT',
    faq: 'FAQ & COMMON OBJECTIONS',
  };

  for (const [category, categoryDocs] of byCategory) {
    const label = categoryLabels[category] || category.toUpperCase();
    const contents = categoryDocs.map(d => `[${d.title}]\n${d.content}`).join('\n\n');
    sections.push(`### ${label}\n${contents}`);
  }

  return `\n## WISSENSBASIS (KNOWLEDGE BASE)\nDie folgenden Informationen sind verifizierte Firmendaten. Verwende sie als primäre Faktenquelle.\nWeiche NIEMALS von diesen Fakten ab. Erfinde KEINE zusätzlichen Produkte, Preise oder Behauptungen.\n\n${sections.join('\n\n')}`;
}

// ─── Context Renderer ──────────────────────────────────────

function renderContext(ctx: PromptContext): string {
  const p = ctx.positioning;
  const lang = ctx.language ?? 'de';

  // Company identity
  const valuesStr = (p.values ?? []).map(v => `${v.title}: ${v.description}`).join('; ');
  const tov = p.toneOfVoice;
  const tovStr = tov
    ? `Adjektive: ${(tov.adjectives ?? []).join(', ')}. ${tov.description ?? ''}`
    : 'Nicht definiert';

  let prompt = `## MARKENIDENTITÄT

Unternehmensname: ${p.name || 'Nicht definiert'}
Tagline: ${p.tagline || 'Nicht definiert'}
Vision: ${p.vision || 'Nicht definiert'}
Mission: ${p.mission || 'Nicht definiert'}
Werte: ${valuesStr || 'Keine definiert'}
Tone of Voice: ${tovStr}
Branche: ${p.industry || 'Nicht angegeben'}
Standort: ${p.headquarters || 'Nicht angegeben'}
Märkte: ${[p.primaryMarket, ...(p.secondaryMarkets ?? [])].filter(Boolean).join(', ') || 'Nicht definiert'}
Zielindustrien: ${(p.targetIndustries ?? []).join(', ') || 'Nicht definiert'}
Zielunternehmensgröße: ${p.targetCompanySize || 'Nicht definiert'}

Kommunikationsregeln:
- DO: ${(p.dos ?? []).join(' | ') || 'Keine definiert'}
- DON'T: ${(p.donts ?? []).join(' | ') || 'Keine definiert'}

SEO-Keywords: ${(ctx.companyKeywords ?? []).map(k => `${k.term} (${k.category})`).join(', ') || 'Keine'}`;

  // Campaign context
  const c = ctx.campaign;
  if (c) {
    prompt += `\n\n## KAMPAGNE

Name: ${c.name}
Ziel: ${c.description || 'Nicht angegeben'}
${c.masterPrompt ? `Kampagnen-Master-Prompt: ${c.masterPrompt}` : ''}
Keywords: ${(c.campaignKeywords ?? []).join(', ') || 'Keine'}
Kanäle: ${(c.channels ?? []).join(', ') || 'Keine'}
Budget: €${c.budget?.toLocaleString() ?? '?'} | Ausgegeben: €${c.spent?.toLocaleString() ?? '?'}
Zeitraum: ${c.startDate} – ${c.endDate}`;
  }

  // Audience context
  const a = ctx.audience;
  if (a) {
    prompt += `\n\n## ZIELGRUPPE (PERSONA)

Name: ${a.name}
Segment: ${a.segment}
Alter: ${a.age || 'Nicht definiert'}
Standort: ${a.location || 'Nicht definiert'}
Beruf: ${a.jobTitle || 'Nicht definiert'}
Bildung: ${a.education || 'Nicht definiert'}
Schmerzpunkte: ${(a.painPoints ?? []).join(' | ') || 'Keine'}
Ziele: ${(a.goals ?? []).join(' | ') || 'Keine'}
Interessen: ${(a.interests ?? []).join(', ') || 'Keine'}
Kaufverhalten: ${a.buyingBehavior || 'Nicht angegeben'}
Entscheidungsprozess: ${a.decisionProcess || 'Nicht angegeben'}
Bevorzugte Kanäle: ${(a.preferredChannels ?? []).join(', ') || 'Nicht angegeben'}`;
  }

  // Journey & touchpoint context
  const j = ctx.journey;
  const js = ctx.journeyStage;
  const tp = ctx.touchpoint;
  if (j || tp) {
    prompt += '\n\n## CUSTOMER JOURNEY & TOUCHPOINT';
    if (j) prompt += `\nJourney: ${j.name}`;
    if (js) {
      prompt += `\nPhase: ${js.phase} — ${js.title}`;
      if (js.description) prompt += `\nKontext: ${js.description}`;
      if (js.painPoints?.length) prompt += `\nPain Points dieser Phase: ${js.painPoints.join(', ')}`;
    }
    if (tp) {
      prompt += `\nTouchpoint: ${tp.name} (${tp.type})`;
      if (tp.journeyPhase) prompt += `\nTouchpoint-Phase: ${tp.journeyPhase}`;
    }
  }

  // Knowledge base (RAG)
  if (ctx.knowledgeDocs?.length) {
    prompt += renderKnowledgeBase(ctx.knowledgeDocs);
  }

  // Task details
  prompt += `\n\n## AUFGABE

Titel: ${ctx.task.title}
Typ: ${ctx.task.type || 'Allgemein'}
Plattform: ${ctx.task.platform || 'Übergreifend'}
Veröffentlichungsdatum: ${ctx.task.publishDate || 'Nicht festgelegt'}
Beschreibung: ${ctx.task.description || 'Keine Beschreibung vorhanden — leite den Inhalt aus Kampagne, Persona und Journey-Phase ab.'}`;

  // Language instruction
  prompt += `\n\n## OUTPUTSPRACHE
${lang === 'en'
    ? 'Write the ENTIRE output in English. Use professional marketing English.'
    : 'Schreibe den GESAMTEN Output auf Deutsch. Verwende professionelles Marketing-Deutsch. Duze die Zielgruppe (\"Du\"-Form), außer es handelt sich um B2B-Erstansprache.'}`;

  return prompt;
}

// ─── Task Type Templates (improved) ───────────────────────

const TASK_TYPE_TEMPLATES: Record<string, string> = {
  'Post (Beschreibung)': `## AUFGABENTYP: Social Post (Text)

Erstelle 3 Post-Varianten — jeweils vollständig und sofort nutzbar:

### VARIANTE 1 — SHORT (max. 350 Zeichen)
Format: Hook → Kernbotschaft → CTA
Ideal für: Story-Teaser, schnelle Engagement-Posts

### VARIANTE 2 — MEDIUM (351–700 Zeichen)
Format: Hook → Problem/Erkenntnis → Lösung/Mehrwert → CTA
Ideal für: Feed-Posts mit Substanz

### VARIANTE 3 — BOLD (701–1.200 Zeichen)
Format: Provokante These → Begründung → Perspektivwechsel → CTA
Ideal für: Thought-Leadership, LinkedIn-Langform

Für JEDE Variante liefere:
1. **Hook** (erste Zeile — muss Scroll-Stopper sein)
2. **Haupttext** (exakt in der Zeichengrenze)
3. **Call-to-Action** (spezifisch, nicht generisch)
4. **Plattformgerechte Hashtags** (LinkedIn: genau 3, Instagram: 5-8; nischenspezifisch, keine Allgemeinplätze wie #Marketing)
5. **Begründung** (1 Satz: warum diese Variante für die Persona wirkt)

QUALITÄTS-CHECK — jede Variante muss:
✓ Den definierten Tone of Voice genau treffen
✓ Mindestens 1 Schmerzpunkt der Persona adressieren
✓ Eine konkrete Handlung auslösen
✓ Fakten aus der Wissensbasis verwenden (keine Erfindungen)`,

  'Post (Foto)': `## AUFGABENTYP: Visual Post (Foto + Caption)

### 1. BILDKONZEPT
- Motiv-Beschreibung (was ist auf dem Bild zu sehen?)
- Szene und Setting
- Komposition (Drittelregel, Blickführung)
- Farbwelt (Bezug zu Brand-Farben)
- Stimmung/Emotion

### 2. TEXT-OVERLAY
- 3 Varianten (je max. 8 Wörter)
- Font-Empfehlung, Platzierung

### 3. CAPTION
- Hook-Zeile
- Storytelling-Element (2–3 Sätze)
- CTA
- 5 Hashtags

### 4. SHOTLIST FÜR DESIGN-TEAM
- Technische Angaben (Format, Auflösung)
- Must-haves im Bild
- No-gos

QUALITÄTS-CHECK:
✓ Bild transportiert Botschaft in < 2 Sekunden
✓ Caption funktioniert auch ohne Bild
✓ Brand-konsistent`,

  'Videoskript': `## AUFGABENTYP: Videoskript

Erstelle 3 Versionen desselben Skripts:

### VERSION A — 30 Sekunden (max. 75 Wörter)
Struktur: Hook (3s) → Problem (5s) → Lösung (10s) → CTA (5s)

### VERSION B — 60 Sekunden (max. 150 Wörter)
Struktur: Hook (5s) → Problem (10s) → Lösung (20s) → Social Proof (10s) → CTA (10s)

### VERSION C — 90 Sekunden (max. 225 Wörter)
Struktur: Hook (5s) → Emotionaler Einstieg (15s) → Problem (15s) → Lösung (20s) → Beweis (15s) → CTA (10s)

Pro Version liefere:
1. **Sprechertext** (wörtlich, zum Ablesen)
2. **Szenenanweisung** (was sieht man?)
3. **Schnitthinweis** (Tempo, Übergang)
4. **B-Roll Vorschläge**

QUALITÄTS-CHECK:
✓ Hook hält die Aufmerksamkeit in den ersten 3 Sekunden
✓ Jede Version ist eigenständig nutzbar
✓ CTA ist spezifisch und messbar`,

  'Video': `## AUFGABENTYP: Video Production Brief

### 1. KREATIVKONZEPT
- Kernbotschaft (1 Satz)
- Emotionaler Anker
- Visual Style (Referenzen)

### 2. STORYBOARD (mind. 8 Shots)
Pro Shot: Szene | Kamera | Audio | Dauer | Mood

### 3. VOICEOVER
- Leitidee
- Tonalität
- Sprechertyp-Empfehlung

### 4. PRODUKTION
- Cut-Rhythmus
- Musik-Stil
- CTA-Integration (letzte 20%)
- Format-Varianten (16:9, 9:16, 1:1)`,

  'Karousell': `## AUFGABENTYP: Carousel Post

Erstelle ein 8-Slide Carousel mit Spannungsbogen:

### SLIDE 1 — HOOK
Headline, die zum Weiterwischen animiert. Kein Logo, kein Branding.

### SLIDES 2–3 — PROBLEM
Pain Point der Zielgruppe. Konkretes Szenario, nicht abstrakt.

### SLIDES 4–6 — LÖSUNG
Schrittweise Erklärung. Jede Slide = 1 klarer Punkt.

### SLIDE 7 — BEWEIS
Social Proof, Zahlen, oder Case Study.

### SLIDE 8 — CTA
Klare Handlungsaufforderung mit Dringlichkeit.

Pro Slide liefere:
1. **Headline** (max. 6 Wörter)
2. **Kernaussage** (1–2 Sätze)
3. **Visual-Idee** (was zeigt das Design?)

Dazu:
- Caption mit CTA
- 5 Hashtags`,

  'Landingpage': `## AUFGABENTYP: Landingpage (Conversion-optimiert)

### HERO SECTION
- Headline (max. 8 Wörter, Nutzenversprechen)
- Subheadline (1 Satz, konkretisiert)
- Primärer CTA-Button (Text + Farbe)
- Hero-Bild Konzept

### PROBLEM SECTION
- 3 Schmerzpunkte (aus Persona-Daten)
- Emotionale Sprache, nicht Feature-Listing

### LÖSUNG SECTION
- Wie das Produkt die Probleme löst
- 3–4 Features mit Benefit-Framing ("Du bekommst X, damit Y")

### SOCIAL PROOF
- Testimonial-Konzept (welcher Kundentyp?)
- Zahlen/Logos

### OFFER SECTION
- Was genau bekommt der Nutzer?
- Preis-Framing (falls relevant)

### FAQ
- 5 häufig gestellte Fragen mit Einwandentkräftung

### CTA SECTION
- Primärer CTA (spezifisch)
- Sekundärer CTA (niedrigere Schwelle)
- Urgency-Element

### SEO
- Title Tag (max. 60 Zeichen)
- Meta Description (max. 155 Zeichen)`,

  'E-Mail-Newsletter': `## AUFGABENTYP: E-Mail Newsletter

### SUBJECT LINES (5 Varianten)
- Variante A: Frage
- Variante B: Zahl/Statistik
- Variante C: How-to
- Variante D: Provokant
- Variante E: Persönlich

### PREVIEW TEXTS (3 Varianten)
Je 40–90 Zeichen, ergänzt die Subject Line.

### NEWSLETTER BODY
1. **Opening** (persönlich, maximal 2 Sätze)
2. **Value-Block** (Mehrwert: Insight, Tipp, oder Story)
3. **Offer/CTA** (was soll der Leser tun?)
4. **PS-Zeile** (wird am zweithäufigsten gelesen!)

QUALITÄTS-CHECK:
✓ Subject Line besteht den "Würde ich das öffnen?"-Test
✓ Newsletter bietet Mehrwert auch ohne Kauf
✓ Nur 1 primärer CTA`,

  'E-Mail-Nachricht': `## AUFGABENTYP: Direkte E-Mail (1:1)

### BETREFF (3 Varianten)
Kurz, persönlich, kein Spam-Trigger.

### MAIL — KURZVERSION (max. 100 Wörter)
Wie eine Nachricht von einem Kollegen: direkt, konkret, freundlich.

### MAIL — AUSFÜHRLICHE VERSION (150–250 Wörter)
Mehr Kontext, aber immer noch scanbar.

### FOLLOW-UP (für Nichtantwort nach 3–5 Tagen)
Anderer Betreff, anderer Einstieg, gleiche Handlungsaufforderung.

### CTA
Konkreter nächster Schritt (Termin buchen, Link klicken, Antworten).`,

  'Task': `## AUFGABENTYP: Umsetzungsplan (Task)

### 1. ZIELDEFINITION
Was genau soll am Ende stehen? (messbar, konkret)

### 2. ARBEITSPAKETE
Pro Paket: Beschreibung | Verantwortlich | Priorität (P1–P3) | Aufwand (h)

### 3. RISIKEN & ABHÄNGIGKEITEN
Was kann schiefgehen? Was muss vorher erledigt sein?

### 4. AKZEPTANZKRITERIEN
Wann ist die Aufgabe "done"? (Checkliste)

### 5. TIMELINE
Vorgeschlagene Reihenfolge und Deadlines.`,
};

const FALLBACK_TEMPLATE = `## AUFGABENTYP: Allgemein

### 1. INTERPRETATION
Was genau wird benötigt? (basierend auf Titel, Beschreibung, Kampagne)

### 2. EMPFOHLENER ANSATZ
Bester Output-Typ für diese Aufgabe.

### 3. ENTWURF
Erster vollständiger Entwurf.

### 4. OPTIMIERUNGSVORSCHLÄGE
3 Ideen zur Verbesserung.`;

// ─── Quality Anchor ────────────────────────────────────────

function renderQualityAnchor(ctx: PromptContext): string {
  const platform = ctx.task.platform;
  const platformHints: Record<string, string> = {
    'Instagram': 'Instagram-Optimierung: Visuell denken. Hashtags sind Reichweite. Carousel > Einzelpost für Engagement. Stories für Urgency. Optimal: 3–7 Hashtags, Mix aus Nische und Medium.',
    'LinkedIn': 'LinkedIn-Optimierung: Professionell aber menschlich. Hooks mit "Ich"-Perspektive. Keine Emoji-Überlastung. Text-Posts performen oft besser als Links. Max. 3 Hashtags. Erster Satz entscheidet über "Mehr anzeigen".',
    'Google Ads': 'Google Ads: Headlines max. 30 Zeichen, Descriptions max. 90 Zeichen. Keywords natürlich einbauen. Nutzenversprechen vor Features. Responsive Search Ads: 15 Headlines + 4 Descriptions.',
    'Facebook': 'Facebook-Optimierung: Längere Posts OK. Community-Sprache. Fragen stellen für Engagement. Video-Captions immer dazu.',
    'TikTok': 'TikTok-Optimierung: Authentisch > poliert. Hook in Sekunde 1. Trending Sounds berücksichtigen. Duet/Stitch-fähig denken. Caption max. 150 Zeichen.',
    'Twitter': 'Twitter/X-Optimierung: Max. 280 Zeichen. Threads für längere Inhalte. Keine Hashtag-Überlastung (max. 2). Meinungsstarke Takes performen.',
    'X': 'Twitter/X-Optimierung: Max. 280 Zeichen. Threads für längere Inhalte. Keine Hashtag-Überlastung (max. 2). Meinungsstarke Takes performen.',
    'Blog': 'Blog-Optimierung: SEO-Titel (H1), Zwischenüberschriften (H2/H3), Meta Description. Absätze max. 3 Sätze. Interne Verlinkung. Featured Snippet-Optimierung für Listicles.',
    'Website': 'Website-Optimierung: Scanbarkeit durch Bullet Points, kurze Absätze. Above-the-fold muss überzeugen. Mobile-first denken.',
    'YouTube': 'YouTube-Optimierung: Titel max. 60 Zeichen. Thumbnail-Konzept mitdenken. Hook in den ersten 5 Sekunden. End Screen CTA.',
  };

  let anchor = `\n## QUALITÄTSANFORDERUNGEN

ABSOLUT VERBOTEN:
- Generische Floskeln ("In der heutigen Zeit...", "Immer mehr Menschen...", "Es ist kein Geheimnis...")
- Placeholder-Texte ("[Hier einfügen]", "XYZ", "[Firmenname]")
- Unbelegte Zahlen oder Behauptungen
- Widerspruch zu Brand-Werten oder Wissensbasis
- Aufzählung von Features ohne Nutzen-Framing
- Übertriebene Superlative ohne Substanz

PFLICHT:
- Jeder Hook muss den Scroll stoppen — teste mit "Würde ICH hier stoppen?"
- Jeder CTA muss eine SPEZIFISCHE Handlung auslösen (nicht "Klicke hier" oder "Mehr erfahren")
- Fakten NUR aus der Wissensbasis verwenden — erfinde NICHTS
- Output muss SOFORT nutzbar sein (Copy-Paste-ready, keine Platzhalter)
- Tone of Voice EXAKT wie in der Markenidentität definiert
- Jeden Schmerzpunkt der Zielgruppe konkret adressieren, nicht abstrakt`;

  if (platform && platformHints[platform]) {
    anchor += `\n\n${platformHints[platform]}`;
  }

  anchor += `\n\nNach dem Hauptoutput, liefere:
### A/B-TEST IDEEN
3 konkrete Testideen mit Hypothese und erwarteter Wirkung.`;

  return anchor;
}

// ─── Public API ────────────────────────────────────────────

export function buildTaskPrompt(ctx: PromptContext): string {
  const lang = ctx.language ?? 'de';
  const context = renderContext(ctx);
  const typeTemplate = TASK_TYPE_TEMPLATES[ctx.task.type || ''] ?? FALLBACK_TEMPLATE;
  const qualityAnchor = renderQualityAnchor(ctx);

  // Opening directive that grounds the AI on this specific task
  const taskName = ctx.task.title || 'Unbenannt';
  const brandName = ctx.positioning?.name || 'das Unternehmen';
  const audienceName = ctx.audience?.name || 'die definierte Zielgruppe';
  const campaignName = ctx.campaign?.name;

  const opening = lang === 'en'
    ? `# BRIEFING: "${taskName}" for ${brandName}\n\nYou are creating content specifically for ${brandName}, targeting ${audienceName}${campaignName ? ` as part of the "${campaignName}" campaign` : ''}. Every word must reflect this brand's unique voice, address this audience's specific pain points, and drive measurable action. Use ONLY the facts and context provided below — do not invent products, prices, or claims.\n\n---`
    : `# BRIEFING: "${taskName}" für ${brandName}\n\nDu erstellst Inhalte spezifisch für ${brandName}, gerichtet an ${audienceName}${campaignName ? ` im Rahmen der Kampagne "${campaignName}"` : ''}. Jedes Wort muss die einzigartige Markenstimme widerspiegeln, die konkreten Schmerzpunkte dieser Zielgruppe ansprechen und messbare Handlungen auslösen. Verwende AUSSCHLIESSLICH die unten bereitgestellten Fakten und Kontextdaten — erfinde keine Produkte, Preise oder Behauptungen.\n\n---`;

  return `${opening}\n\n${context}\n\n---\n\n${typeTemplate}\n${qualityAnchor}`;
}

/**
 * Prompt Builder — implements MASTER_PROMPT_SYSTEM.md
 * Builds context-aware prompts from positioning, campaign, audience, journey, and task data.
 */

import type { Campaign, Task, Audience, Touchpoint, AsidasJourney, JourneyStage } from '../types';
import type { CompanyPositioning, CompanyKeyword } from '../types/dashboard';

// ─── Types ─────────────────────────────────────────────────

export interface PromptContext {
  positioning: CompanyPositioning;
  companyKeywords: CompanyKeyword[];
  campaign?: Campaign | null;
  audience?: Audience | null;
  journey?: AsidasJourney | null;
  journeyStage?: JourneyStage | null;
  touchpoint?: Touchpoint | null;
  task: Task;
  language?: string;
}

// ─── Universal Master Prompt ───────────────────────────────

function renderUniversalMasterPrompt(ctx: PromptContext): string {
  const p = ctx.positioning;
  const valuesStr = (p.values ?? []).map(v => `${v.title}: ${v.description}`).join('; ');
  const tov = p.toneOfVoice;
  const tovStr = tov ? `${(tov.adjectives ?? []).join(', ')} — ${tov.description ?? ''}` : 'Nicht definiert';
  const dosStr = (p.dos ?? []).join(', ') || 'Keine';
  const dontsStr = (p.donts ?? []).join(', ') || 'Keine';
  const kwStr = (ctx.companyKeywords ?? []).map(k => `${k.term} (${k.category})`).join(', ') || 'Keine';
  const marketsStr = [p.primaryMarket, ...(p.secondaryMarkets ?? [])].filter(Boolean).join(', ') || 'Nicht definiert';
  const industriesStr = (p.targetIndustries ?? []).join(', ') || 'Nicht definiert';

  const c = ctx.campaign;
  const campaignBlock = c ? `
KAMPAGNE:
- Name: ${c.name}
- Ziel/Beschreibung: ${c.description || 'Nicht angegeben'}
- Master Prompt: ${c.masterPrompt || 'Nicht definiert'}
- Kampagnen-Keywords: ${(c.campaignKeywords ?? []).join(', ') || 'Keine'}
- Kanäle: ${(c.channels ?? []).join(', ') || 'Keine'}` : '';

  const a = ctx.audience;
  const audienceBlock = a ? `
ZIELGRUPPE:
- Persona: ${a.name}
- Segment: ${a.segment}
- Schmerzpunkte: ${(a.painPoints ?? []).join(', ') || 'Keine'}
- Ziele: ${(a.goals ?? []).join(', ') || 'Keine'}
- Interessen: ${(a.interests ?? []).join(', ') || 'Keine'}
- Kaufverhalten: ${a.buyingBehavior || 'Nicht angegeben'}
- Decision Process: ${a.decisionProcess || 'Nicht angegeben'}` : '';

  const j = ctx.journey;
  const js = ctx.journeyStage;
  const tp = ctx.touchpoint;
  const journeyBlock = (j || tp) ? `
JOURNEY UND TOUCHPOINT:${j ? `
- Journey: ${j.name}` : ''}${js ? `
- Phase: ${js.phase}
- Stage Title: ${js.title}
- Stage Kontext: ${js.description}
- Stage Pain Points: ${(js.painPoints ?? []).join(', ')}` : ''}${tp ? `
- Touchpoint Name: ${tp.name}
- Touchpoint Typ: ${tp.type}
- Touchpoint Journey-Phase: ${tp.journeyPhase || 'Nicht definiert'}` : ''}` : '';

  return `SYSTEM ROLLE:
Du bist ein Senior Marketing-Strategist, Conversion-Copywriter und Creative Planner.
Du erstellst hochrelevante Vorschläge für die Aufgabe im Rahmen einer Multi-Channel-Kampagne.
Arbeite präzise, markenkonform und zielgruppenfokussiert.

PRIORITÄTEN (in genau dieser Reihenfolge):
1) Unternehmensidentität und Werte
2) Kampagnenziel und Kampagnen-Master-Prompt
3) Zielgruppe und Journey-Phase
4) Kanal/Touchpoint-Spezifik
5) Aufgabenbeschreibung und Aufgabentyp

UNTERNEHMEN:
- Name: ${p.name || 'Nicht definiert'}
- Tagline: ${p.tagline || 'Nicht definiert'}
- Vision: ${p.vision || 'Nicht definiert'}
- Mission: ${p.mission || 'Nicht definiert'}
- Werte: ${valuesStr || 'Keine'}
- Tone of Voice: ${tovStr}
- Do: ${dosStr}
- Do not: ${dontsStr}
- Keywords: ${kwStr}
- Märkte: ${marketsStr}
- Zielindustrien: ${industriesStr}
- Zielunternehmensgröße: ${p.targetCompanySize || 'Nicht definiert'}
- Branche: ${p.industry || 'Nicht angegeben'}
- Standort: ${p.headquarters || 'Nicht angegeben'}
${campaignBlock}
${audienceBlock}
${journeyBlock}

AUFGABE:
- Titel: ${ctx.task.title}
- Typ: ${ctx.task.type || 'Nicht angegeben'}
- Plattform: ${ctx.task.platform || 'Nicht angegeben'}
- Veröffentlichung: ${ctx.task.publishDate || 'Nicht festgelegt'}
- Aufgabenbeschreibung: ${ctx.task.description || 'Keine Beschreibung'}

GUARDRAILS:
- Keine Aussagen, die den Markenwerten widersprechen.
- Keine unbelegten Versprechen oder irreführenden Claims.
- Sprache: ${ctx.language ?? 'Deutsch'}.
- Stil: Klar, konkret, umsetzbar.
- Liefere sowohl Kreativität als auch Umsetzbarkeit.

OUTPUT-ANFORDERUNG:
Liefere ein Ergebnis gemäß dem nachfolgenden Aufgabentyp-Template.
Zusatz: Gib am Ende 3 Optimierungsideen für A/B-Tests aus.`;
}

// ─── Task Type Templates ───────────────────────────────────

const TASK_TYPE_TEMPLATES: Record<string, string> = {
  'Post (Beschreibung)': `AUFGABENTYP-SPEZIFIKATION: Post (Beschreibung)
Ziel: Text für Social Post ohne Bildproduktion.

Erzeuge:
1) 3 Post-Varianten (Short, Medium, Bold)
2) Je Variante: Hook, Haupttext, CTA, Hashtags
3) Je Variante: Begründung (warum passend für Persona + Phase)

Formatregeln:
- Short: max 350 Zeichen
- Medium: 351-700 Zeichen
- Bold: 701-1200 Zeichen
- Kanalgerechte Tonalität

Antworte als strukturierter Text mit klaren Abschnitten für jede Variante.`,

  'Post (Foto)': `AUFGABENTYP-SPEZIFIKATION: Post (Foto)
Ziel: Visual Brief + Caption für statischen Post.

Erzeuge:
1) Bildkonzept (Motiv, Szene, Komposition, Farbwelt)
2) Text-Overlay Varianten (max 8 Wörter)
3) Caption mit CTA
4) Shotlist für Design/Foto-Team

Constraints:
- Bild muss Botschaft in < 2 Sekunden transportieren
- Brand-Farben und Tone of Voice beachten

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'Videoskript': `AUFGABENTYP-SPEZIFIKATION: Videoskript
Ziel: Vollständiges Skript für Sprecher/in + Szenenhinweise.

Erzeuge:
1) 30s, 60s und 90s Version
2) Pro Version: Hook, Problem, Lösung, Social Proof, CTA
3) Szenenanweisungen je Abschnitt

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'Video': `AUFGABENTYP-SPEZIFIKATION: Video
Ziel: Production Brief für Video-Team.

Erzeuge:
1) Kreativkonzept
2) Storyboard (mind. 6 Shots)
3) Voiceover-Leitidee
4) Cut- und Tempo-Empfehlung
5) CTA-Integration in den letzten 20 Prozent

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'Karousell': `AUFGABENTYP-SPEZIFIKATION: Karousell
Ziel: Slide-by-slide Konzept für Carousel Post.

Erzeuge:
1) 8 Slide-Struktur
2) Pro Slide: Headline, Kernbotschaft, Visual-Idee
3) Spannungsbogen von Problem zu Handlung
4) Abschlussslide mit CTA

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'Landingpage': `AUFGABENTYP-SPEZIFIKATION: Landingpage
Ziel: Conversion-starke Landingpage-Struktur.

Erzeuge:
1) Hero, Problem, Lösung, Proof, Offer, FAQ, CTA
2) Primäre und sekundäre CTA-Texte
3) Einwände und deren Entkräftung
4) SEO-Title + Meta Description

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'E-Mail-Newsletter': `AUFGABENTYP-SPEZIFIKATION: E-Mail-Newsletter
Ziel: Newsletter mit Mehrwert und klarer Aktion.

Erzeuge:
1) 5 Subject-Line Varianten
2) 3 Preview-Text Varianten
3) Newsletter-Body (intro, value, offer, CTA)

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'E-Mail-Nachricht': `AUFGABENTYP-SPEZIFIKATION: E-Mail-Nachricht
Ziel: Direkte, persönliche Mail (1:1 oder kleines Segment).

Erzeuge:
1) 3 Betreffzeilen
2) Hauptmail in 2 Längen (kurz, mittel)
3) Follow-up Text für Nichtantwort
4) CTA mit nächstem konkreten Schritt

Antworte als strukturierter Text mit klaren Abschnitten.`,

  'Task': `AUFGABENTYP-SPEZIFIKATION: Task
Ziel: Strukturierter Umsetzungsplan statt reinem Content.

Erzeuge:
1) Zieldefinition
2) Arbeitspakete (mit Priorität und Aufwand)
3) Risiken und Abhängigkeiten
4) Akzeptanzkriterien für "done"

Antworte als strukturierter Text mit klaren Abschnitten.`,
};

const FALLBACK_TEMPLATE = `AUFGABENTYP-SPEZIFIKATION: Sonstige
Ziel: Flexible Generierung für nicht-standardisierte Aufgaben.

Erzeuge:
1) Interpretierte Zieldefinition
2) 2-3 sinnvolle Output-Formate
3) Klare Annahmen und offene Fragen
4) Ersten Entwurf

Antworte als strukturierter Text mit klaren Abschnitten.`;

// ─── Public API ────────────────────────────────────────────

export function buildTaskPrompt(ctx: PromptContext): string {
  const master = renderUniversalMasterPrompt(ctx);
  const typeTemplate = TASK_TYPE_TEMPLATES[ctx.task.type || ''] ?? FALLBACK_TEMPLATE;
  return `${master}\n\n${typeTemplate}`;
}

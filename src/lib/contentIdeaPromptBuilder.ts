/**
 * Content Idea Prompt Builder
 *
 * Builds a structured prompt for batch content idea generation.
 * Uses the same context model as the main promptBuilder but targets
 * idea brainstorming instead of single-task content creation.
 */

import type { Audience, Campaign, Touchpoint } from '../types';
import type { CompanyKeyword, CompanyPositioning } from '../types/dashboard';

export interface IdeaPromptContext {
  positioning: CompanyPositioning;
  companyKeywords: CompanyKeyword[];
  campaign?: Campaign | null;
  audience?: Audience | null;
  touchpoints: Touchpoint[];
  channels: string[];
  journeyPhases: string[];
  themeKeywords: string;
  ideaCount: number;
  language: 'de' | 'en' | 'tr';
}

function renderBrandContext(positioning: CompanyPositioning, keywords: CompanyKeyword[]): string {
  const p = positioning;
  const valuesStr = (p.values ?? []).map(v => `${v.title}: ${v.description}`).join('; ');
  const tov = p.toneOfVoice;
  const tovStr = tov
    ? `Adjektive: ${(tov.adjectives ?? []).join(', ')}. ${tov.description ?? ''}`
    : 'Nicht definiert';

  return `## MARKENIDENTITÄT

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
SEO-Keywords: ${(keywords ?? []).map(k => `${k.term} (${k.category})`).join(', ') || 'Keine'}`;
}

function renderCampaignContext(campaign: Campaign): string {
  return `## KAMPAGNE

Name: ${campaign.name}
Ziel: ${campaign.description || 'Nicht angegeben'}
${campaign.masterPrompt ? `Strategische Ausrichtung: ${campaign.masterPrompt}` : ''}
Kanäle: ${(campaign.channels ?? []).join(', ') || 'Keine'}
Keywords: ${(campaign.campaignKeywords ?? []).join(', ') || 'Keine'}
Zeitraum: ${campaign.startDate} bis ${campaign.endDate}`;
}

function renderAudienceContext(audience: Audience): string {
  return `## ZIELGRUPPE

Name: ${audience.name}
Segment: ${audience.segment}
Alter: ${audience.age || 'Nicht definiert'}
Beruf: ${audience.jobTitle || 'Nicht definiert'}
Schmerzpunkte: ${(audience.painPoints ?? []).join(' | ') || 'Keine'}
Ziele: ${(audience.goals ?? []).join(' | ') || 'Keine'}
Interessen: ${(audience.interests ?? []).join(', ') || 'Keine'}
Bevorzugte Kanäle: ${(audience.preferredChannels ?? []).join(', ') || 'Nicht angegeben'}`;
}

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  de: 'Schreibe den GESAMTEN Output auf Deutsch. Verwende professionelles Marketing-Deutsch.',
  en: 'Write the ENTIRE output in English. Use professional marketing English.',
  tr: 'Tüm çıktıyı Türkçe yaz. Profesyonel pazarlama Türkçesi kullan.',
};

export function buildContentIdeaPrompt(ctx: IdeaPromptContext): string {
  const brandName = ctx.positioning?.name || 'das Unternehmen';
  const audienceName = ctx.audience?.name || 'die definierte Zielgruppe';
  const campaignName = ctx.campaign?.name;

  const channelList = ctx.channels.length > 0
    ? ctx.channels.join(', ')
    : 'alle verfügbaren Kanäle';

  const phaseList = ctx.journeyPhases.length > 0
    ? ctx.journeyPhases.join(', ')
    : 'alle Journey-Phasen';

  const touchpointInfo = ctx.touchpoints
    .filter(tp => ctx.channels.length === 0 || ctx.channels.includes(tp.name) || ctx.channels.includes(tp.type))
    .map(tp => `${tp.name} (${tp.type}, Phase: ${tp.journeyPhase})`)
    .join('; ');

  let prompt = `# CONTENT-IDEEN BRIEFING für ${brandName}

Du generierst ${ctx.ideaCount} Content-Ideen für ${brandName}, gerichtet an ${audienceName}${campaignName ? ` im Rahmen der Kampagne "${campaignName}"` : ''}.

Jede Idee muss strategisch fundiert, sofort umsetzbar und auf die Marke zugeschnitten sein.

---

${renderBrandContext(ctx.positioning, ctx.companyKeywords)}`;

  if (ctx.campaign) {
    prompt += `\n\n${renderCampaignContext(ctx.campaign)}`;
  }

  if (ctx.audience) {
    prompt += `\n\n${renderAudienceContext(ctx.audience)}`;
  }

  prompt += `\n\n## VERFÜGBARE KANÄLE & TOUCHPOINTS

Gewünschte Kanäle: ${channelList}
Journey-Phasen: ${phaseList}
${touchpointInfo ? `Touchpoints: ${touchpointInfo}` : ''}`;

  if (ctx.themeKeywords.trim()) {
    prompt += `\n\n## THEMATISCHE SCHWERPUNKTE

Der User möchte Ideen zu folgenden Themen/Keywords: ${ctx.themeKeywords}
Nutze diese als Inspiration, aber bleibe kreativ und markenkonform.`;
  }

  prompt += `\n\n## AUSGABEFORMAT

Antworte AUSSCHLIESSLICH mit einem validen JSON-Array. Kein Markdown, kein erläuternder Text davor oder danach.

Jedes Element im Array hat diese Struktur:
{
  "title": "Prägnanter Titel der Content-Idee",
  "description": "2-3 Sätze: Was genau soll erstellt werden? Welcher Mehrwert für die Zielgruppe?",
  "platform": "Ein konkreter Kanal (z.B. Instagram, LinkedIn, Blog, E-Mail, Google Ads)",
  "contentType": "social | email | ads | content | event",
  "journeyPhase": "Awareness | Consideration | Purchase | Retention | Advocacy",
  "taskType": "Post (Beschreibung) | Post (Foto) | Videoskript | Karousell | Landingpage | E-Mail-Newsletter | E-Mail-Nachricht | Task",
  "rationale": "1 Satz: Warum ist diese Idee strategisch sinnvoll für Kampagne und Zielgruppe?"
}

Generiere exakt ${ctx.ideaCount} Ideen.

REGELN:
- Jede Idee muss einen anderen Blickwinkel oder Kanal nutzen
- Mische verschiedene Content-Typen und Journey-Phasen
- Ideen müssen zur Markenstimme und Zielgruppe passen
- Keine generischen Ideen ("Poste regelmäßig") - alles muss konkret und sofort umsetzbar sein
- Beziehe dich auf echte Schmerzpunkte und Ziele der Zielgruppe
- Nutze thematische Keywords wenn angegeben
- Schlage nur Kanäle vor, die in der Kanalliste enthalten sind

## OUTPUTSPRACHE
${LANGUAGE_INSTRUCTIONS[ctx.language] || LANGUAGE_INSTRUCTIONS.de}`;

  return prompt;
}

/**
 * System instruction for the content idea generator.
 * Tuned for structured JSON output.
 */
export const CONTENT_IDEA_SYSTEM_INSTRUCTION = `You are an elite Content Strategist and Creative Director with 15+ years of experience.

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

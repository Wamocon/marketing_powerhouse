// ─── Import / Export Utilities ──────────────────────────────
// Provides export, import, validation, and questionnaire template generation
// for projects, campaigns, and audiences.

import type { Campaign, Audience, Touchpoint } from '../types';
import type {
  CompanyPositioning,
  CompanyKeyword,
  BudgetCategory,
} from '../types/dashboard';
import type {
  ProjectExportData,
  CampaignExportData,
  AudienceExportData,
  ExportMeta,
  ImportValidationResult,
  ImportLevel,
  QuestionnaireSection,
} from '../types/importExport';

const SCHEMA_VERSION = '1.0.0';
const APP_NAME = 'Momentum Marketing OS';

// ─── Helpers ───────────────────────────────────────────────

function buildMeta(type: ImportLevel): ExportMeta {
  return {
    version: SCHEMA_VERSION,
    type,
    exportedAt: new Date().toISOString(),
    appName: APP_NAME,
  };
}

function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]/g, '').replace(/\s+/g, '_').slice(0, 60);
}

// ─── Export Functions ──────────────────────────────────────

export function exportProject(
  project: { name: string; description: string; industry: string; logo: string },
  positioning: CompanyPositioning | null,
  keywords: CompanyKeyword[],
  budgetCategories: BudgetCategory[],
): ProjectExportData {
  const data: ProjectExportData = {
    _meta: buildMeta('project'),
    project: {
      name: project.name,
      description: project.description,
      industry: project.industry,
      logo: project.logo,
    },
    positioning: positioning && positioning.name ? positioning : null,
    keywords: keywords.map(({ term, category, description }) => ({ term, category, description })),
    budgetCategories: budgetCategories.map(({ name, planned, spent, color }) => ({ name, planned, spent, color })),
  };
  return data;
}

export function downloadProjectExport(
  project: { name: string; description: string; industry: string; logo: string },
  positioning: CompanyPositioning | null,
  keywords: CompanyKeyword[],
  budgetCategories: BudgetCategory[],
): void {
  const data = exportProject(project, positioning, keywords, budgetCategories);
  downloadJson(data, `projekt_${sanitizeFilename(project.name)}.json`);
}

export function exportCampaign(campaign: Campaign): CampaignExportData {
  return {
    _meta: buildMeta('campaign'),
    campaign: {
      name: campaign.name,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget,
      spent: campaign.spent,
      channels: campaign.channels,
      description: campaign.description,
      masterPrompt: campaign.masterPrompt,
      targetAudiences: campaign.targetAudiences,
      campaignKeywords: campaign.campaignKeywords,
      kpis: { ...campaign.kpis },
      channelKpis: campaign.channelKpis ? { ...campaign.channelKpis } : undefined,
      progress: campaign.progress,
    },
  };
}

export function downloadCampaignExport(campaign: Campaign): void {
  const data = exportCampaign(campaign);
  downloadJson(data, `kampagne_${sanitizeFilename(campaign.name)}.json`);
}

export function exportAudience(audience: Audience): AudienceExportData {
  return {
    _meta: buildMeta('audience'),
    audience: {
      name: audience.name,
      type: audience.type,
      segment: audience.segment,
      age: audience.age,
      gender: audience.gender,
      location: audience.location,
      income: audience.income,
      education: audience.education,
      jobTitle: audience.jobTitle,
      interests: [...audience.interests],
      painPoints: [...audience.painPoints],
      goals: [...audience.goals],
      preferredChannels: [...audience.preferredChannels],
      buyingBehavior: audience.buyingBehavior,
      decisionProcess: audience.decisionProcess,
      journeyPhase: audience.journeyPhase,
      description: audience.description,
    },
  };
}

export function downloadAudienceExport(audience: Audience): void {
  const data = exportAudience(audience);
  downloadJson(data, `zielgruppe_${sanitizeFilename(audience.name)}.json`);
}

// ─── Validation Functions ──────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(i => typeof i === 'string');
}

export function validateProjectImport(raw: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(raw)) {
    return { valid: false, errors: ['Datei enthält kein gültiges JSON-Objekt.'], warnings };
  }
  const data = raw as Record<string, unknown>;

  // Meta
  if (!isObject(data._meta)) {
    errors.push('Fehlender _meta-Block.');
  } else {
    const meta = data._meta as Record<string, unknown>;
    if (meta.type !== 'project') errors.push('_meta.type muss "project" sein.');
    if (typeof meta.version !== 'string') warnings.push('_meta.version fehlt.');
  }

  // Project
  if (!isObject(data.project)) {
    errors.push('Fehlender "project"-Block.');
  } else {
    const p = data.project as Record<string, unknown>;
    if (!p.name || typeof p.name !== 'string') errors.push('project.name ist erforderlich (Text).');
    if (p.industry !== undefined && typeof p.industry !== 'string') warnings.push('project.industry sollte ein Text sein.');
  }

  // Positioning (optional)
  if (data.positioning !== undefined && data.positioning !== null && !isObject(data.positioning)) {
    errors.push('"positioning" muss ein Objekt oder null sein.');
  }

  // Keywords (optional)
  if (data.keywords !== undefined) {
    if (!Array.isArray(data.keywords)) {
      errors.push('"keywords" muss ein Array sein.');
    } else {
      (data.keywords as unknown[]).forEach((kw, i) => {
        if (!isObject(kw) || typeof (kw as Record<string, unknown>).term !== 'string') {
          warnings.push(`keywords[${i}].term fehlt.`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCampaignImport(raw: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(raw)) {
    return { valid: false, errors: ['Datei enthält kein gültiges JSON-Objekt.'], warnings };
  }
  const data = raw as Record<string, unknown>;

  if (!isObject(data._meta)) {
    errors.push('Fehlender _meta-Block.');
  } else {
    const meta = data._meta as Record<string, unknown>;
    if (meta.type !== 'campaign') errors.push('_meta.type muss "campaign" sein.');
  }

  if (!isObject(data.campaign)) {
    errors.push('Fehlender "campaign"-Block.');
  } else {
    const c = data.campaign as Record<string, unknown>;
    if (!c.name || typeof c.name !== 'string') errors.push('campaign.name ist erforderlich (Text).');
    if (!c.status || !['active', 'planned', 'completed', 'paused'].includes(c.status as string)) {
      errors.push('campaign.status muss "active", "planned", "completed" oder "paused" sein.');
    }
    if (typeof c.budget !== 'number') warnings.push('campaign.budget sollte eine Zahl sein.');
    if (c.channels !== undefined && !isStringArray(c.channels)) warnings.push('campaign.channels sollte ein String-Array sein.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateAudienceImport(raw: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(raw)) {
    return { valid: false, errors: ['Datei enthält kein gültiges JSON-Objekt.'], warnings };
  }
  const data = raw as Record<string, unknown>;

  if (!isObject(data._meta)) {
    errors.push('Fehlender _meta-Block.');
  } else {
    const meta = data._meta as Record<string, unknown>;
    if (meta.type !== 'audience') errors.push('_meta.type muss "audience" sein.');
  }

  if (!isObject(data.audience)) {
    errors.push('Fehlender "audience"-Block.');
  } else {
    const a = data.audience as Record<string, unknown>;
    if (!a.name || typeof a.name !== 'string') errors.push('audience.name ist erforderlich (Text).');
    if (!a.segment || !['B2C', 'B2B'].includes(a.segment as string)) {
      errors.push('audience.segment muss "B2C" oder "B2B" sein.');
    }
    if (a.painPoints !== undefined && !isStringArray(a.painPoints)) warnings.push('audience.painPoints sollte ein String-Array sein.');
    if (a.goals !== undefined && !isStringArray(a.goals)) warnings.push('audience.goals sollte ein String-Array sein.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateImport(raw: unknown, level: ImportLevel): ImportValidationResult {
  switch (level) {
    case 'project': return validateProjectImport(raw);
    case 'campaign': return validateCampaignImport(raw);
    case 'audience': return validateAudienceImport(raw);
  }
}

// ─── Read File Helper ──────────────────────────────────────

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error('Datei enthält kein gültiges JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsText(file);
  });
}

// ─── Questionnaire Definition ──────────────────────────────

export const PROJECT_QUESTIONNAIRE: QuestionnaireSection[] = [
  {
    id: 'project_basic',
    title: { de: 'Projektdaten', en: 'Project Data' },
    description: { de: 'Grundlegende Informationen zum Projekt / Unternehmen.', en: 'Basic project / company information.' },
    fields: [
      { key: 'project.name', label: { de: 'Projektname', en: 'Project Name' }, description: { de: 'Name des Projekts / der App / des Unternehmens.', en: 'Name of the project / app / company.' }, type: 'text', required: true, example: 'Meine Marketing App' },
      { key: 'project.description', label: { de: 'Beschreibung', en: 'Description' }, description: { de: 'Kurze Beschreibung des Projekts.', en: 'Short project description.' }, type: 'textarea', required: false, example: 'SaaS-Lösung für KMU-Marketing' },
      { key: 'project.industry', label: { de: 'Branche', en: 'Industry' }, description: { de: 'In welcher Branche operiert das Projekt?', en: 'What industry does the project operate in?' }, type: 'text', required: false, example: 'SaaS / Technologie' },
    ],
  },
  {
    id: 'positioning',
    title: { de: 'Positionierung & Markenidentität', en: 'Positioning & Brand Identity' },
    description: { de: 'Strategische Markenpositionierung – Pflichtfelder bilden das Minimum für den AI-Prompt-Builder.', en: 'Strategic brand positioning – required fields form the minimum for the AI prompt builder.' },
    fields: [
      { key: 'positioning.name', label: { de: 'Markenname', en: 'Brand Name' }, description: { de: 'Offizieller Markenname.', en: 'Official brand name.' }, type: 'text', required: true, example: 'WAMOCON Academy' },
      { key: 'positioning.tagline', label: { de: 'Tagline / Claim', en: 'Tagline / Claim' }, description: { de: 'Kurze Markenbotschaft.', en: 'Short brand message.' }, type: 'text', required: true, example: 'Marketing. Einfach. Machen.' },
      { key: 'positioning.vision', label: { de: 'Vision', en: 'Vision' }, description: { de: 'Zukunftsbild des Unternehmens.', en: 'Future vision of the company.' }, type: 'textarea', required: true, example: 'Jedes KMU hat Zugang zu professionellem Marketing.' },
      { key: 'positioning.mission', label: { de: 'Mission', en: 'Mission' }, description: { de: 'Wofür steht das Unternehmen?', en: 'What does the company stand for?' }, type: 'textarea', required: true, example: 'Wir demokratisieren Marketing-Tools.' },
      { key: 'positioning.founded', label: { de: 'Gründungsjahr', en: 'Year Founded' }, description: { de: 'Wann wurde das Unternehmen gegründet?', en: 'When was the company founded?' }, type: 'text', required: false, example: '2024' },
      { key: 'positioning.headquarters', label: { de: 'Hauptsitz', en: 'Headquarters' }, description: { de: 'Stadt / Region des Hauptsitzes.', en: 'City / region of headquarters.' }, type: 'text', required: false, example: 'Berlin, Deutschland' },
      { key: 'positioning.legalForm', label: { de: 'Rechtsform', en: 'Legal Form' }, description: { de: 'z.B. GmbH, UG, AG, Einzelunternehmer.', en: 'e.g. GmbH, LLC, Corp.' }, type: 'text', required: false, example: 'GmbH' },
      { key: 'positioning.employees', label: { de: 'Mitarbeiterzahl', en: 'Employees' }, description: { de: 'Ungefähre Mitarbeiterzahl.', en: 'Approximate number of employees.' }, type: 'text', required: false, example: '10-50' },
      { key: 'positioning.website', label: { de: 'Website', en: 'Website' }, description: { de: 'Primäre Website-URL.', en: 'Primary website URL.' }, type: 'text', required: false, example: 'https://example.com' },
      { key: 'positioning.industry', label: { de: 'Branche (Positionierung)', en: 'Industry (Positioning)' }, description: { de: 'Branchenzuordnung innerhalb der Positionierung.', en: 'Industry classification within positioning.' }, type: 'text', required: false, example: 'EdTech / Marketing' },
      { key: 'positioning.values', label: { de: 'Unternehmenswerte', en: 'Company Values' }, description: { de: 'Array aus { title, icon, description }. Kernwerte des Unternehmens.', en: 'Array of { title, icon, description }. Core company values.' }, type: 'array', required: false, example: [{ title: 'Innovation', icon: '💡', description: 'Wir denken neu.' }] },
      { key: 'positioning.toneOfVoice', label: { de: 'Tonalität', en: 'Tone of Voice' }, description: { de: '{ adjectives: string[], description: string, personality: string }', en: '{ adjectives: string[], description: string, personality: string }' }, type: 'object', required: true, example: { adjectives: ['professionell', 'freundlich'], description: 'Nahbar aber kompetent', personality: 'Experte mit Humor' } },
      { key: 'positioning.dos', label: { de: 'Dos (Marken-Dos)', en: 'Dos (Brand Dos)' }, description: { de: 'Was die Marke tun soll (String-Array).', en: 'What the brand should do (string array).' }, type: 'array', required: false, example: ['Klar kommunizieren', 'Mehrwert bieten'] },
      { key: 'positioning.donts', label: { de: 'Don\'ts (Marken-Don\'ts)', en: 'Don\'ts (Brand Don\'ts)' }, description: { de: 'Was die Marke vermeiden soll (String-Array).', en: 'What the brand should avoid (string array).' }, type: 'array', required: false, example: ['Fachjargon', 'Aggressive Werbung'] },
      { key: 'positioning.primaryMarket', label: { de: 'Primärmarkt', en: 'Primary Market' }, description: { de: 'Hauptzielmarkt.', en: 'Main target market.' }, type: 'text', required: false, example: 'DACH-Region' },
      { key: 'positioning.secondaryMarkets', label: { de: 'Sekundärmärkte', en: 'Secondary Markets' }, description: { de: 'Weitere Zielmärkte (String-Array).', en: 'Additional target markets (string array).' }, type: 'array', required: false, example: ['Westeuropa', 'Nordamerika'] },
      { key: 'positioning.targetCompanySize', label: { de: 'Ziel-Unternehmensgröße', en: 'Target Company Size' }, description: { de: 'Welche Unternehmensgrößen werden angesprochen?', en: 'Which company sizes are targeted?' }, type: 'text', required: false, example: '1-250 Mitarbeiter' },
      { key: 'positioning.targetIndustries', label: { de: 'Zielbranchen', en: 'Target Industries' }, description: { de: 'Welche Branchen sollen erreicht werden? (String-Array)', en: 'Which industries should be reached? (string array)' }, type: 'array', required: false, example: ['E-Commerce', 'Dienstleister', 'Handwerk'] },
    ],
  },
  {
    id: 'keywords',
    title: { de: 'Keywords', en: 'Keywords' },
    description: { de: 'SEO- und Marken-Keywords. Jeder Eintrag: { term, category, description }.', en: 'SEO and brand keywords. Each entry: { term, category, description }.' },
    fields: [
      { key: 'keywords', label: { de: 'Keyword-Liste', en: 'Keyword List' }, description: { de: 'Array aus Keywords mit term, category ("brand" | "seo" | "long-tail" | "competitor"), description.', en: 'Array of keywords with term, category ("brand" | "seo" | "long-tail" | "competitor"), description.' }, type: 'array', required: false, example: [{ term: 'Marketing Automation', category: 'seo', description: 'Hauptkeyword für organische Suche' }] },
    ],
  },
  {
    id: 'budget',
    title: { de: 'Budget-Kategorien', en: 'Budget Categories' },
    description: { de: 'Initiale Budget-Aufstellung. Jede Kategorie: { name, planned, spent, color }.', en: 'Initial budget setup. Each category: { name, planned, spent, color }.' },
    fields: [
      { key: 'budgetCategories', label: { de: 'Budget-Kategorien', en: 'Budget Categories' }, description: { de: 'Array aus { name, planned (Zahl), spent (Zahl), color (Hex) }.', en: 'Array of { name, planned (number), spent (number), color (hex) }.' }, type: 'array', required: false, example: [{ name: 'Social Media', planned: 5000, spent: 0, color: '#3b82f6' }] },
    ],
  },
];

export const CAMPAIGN_QUESTIONNAIRE: QuestionnaireSection[] = [
  {
    id: 'campaign_data',
    title: { de: 'Kampagnen-Daten', en: 'Campaign Data' },
    description: { de: 'Alle Felder einer Kampagne.', en: 'All campaign fields.' },
    fields: [
      { key: 'campaign.name', label: { de: 'Kampagnenname', en: 'Campaign Name' }, description: { de: 'Name der Kampagne.', en: 'Campaign name.' }, type: 'text', required: true, example: 'Black Friday 2025' },
      { key: 'campaign.status', label: { de: 'Status', en: 'Status' }, description: { de: 'Kampagnenstatus.', en: 'Campaign status.' }, type: 'select', required: true, options: ['active', 'planned', 'completed', 'paused'], example: 'planned' },
      { key: 'campaign.startDate', label: { de: 'Startdatum', en: 'Start Date' }, description: { de: 'ISO-Datum (YYYY-MM-DD).', en: 'ISO date (YYYY-MM-DD).' }, type: 'text', required: true, example: '2025-11-01' },
      { key: 'campaign.endDate', label: { de: 'Enddatum', en: 'End Date' }, description: { de: 'ISO-Datum (YYYY-MM-DD).', en: 'ISO date (YYYY-MM-DD).' }, type: 'text', required: true, example: '2025-11-30' },
      { key: 'campaign.budget', label: { de: 'Budget', en: 'Budget' }, description: { de: 'Gesamtbudget in EUR.', en: 'Total budget in EUR.' }, type: 'number', required: true, example: 15000 },
      { key: 'campaign.spent', label: { de: 'Ausgegeben', en: 'Spent' }, description: { de: 'Bereits ausgegebener Betrag.', en: 'Amount already spent.' }, type: 'number', required: false, example: 0 },
      { key: 'campaign.channels', label: { de: 'Kanäle', en: 'Channels' }, description: { de: 'Marketing-Kanäle (String-Array).', en: 'Marketing channels (string array).' }, type: 'array', required: false, example: ['Social Media', 'Email', 'SEA'] },
      { key: 'campaign.description', label: { de: 'Beschreibung', en: 'Description' }, description: { de: 'Kampagnenbeschreibung.', en: 'Campaign description.' }, type: 'textarea', required: false, example: 'Umsatzsteigerung durch Black-Friday-Angebote.' },
      { key: 'campaign.masterPrompt', label: { de: 'Master-Prompt', en: 'Master Prompt' }, description: { de: 'KI-Prompt-Vorlage für Content-Generierung.', en: 'AI prompt template for content generation.' }, type: 'textarea', required: false, example: '' },
      { key: 'campaign.targetAudiences', label: { de: 'Zielgruppen (Namen)', en: 'Target Audiences (Names)' }, description: { de: 'Namen der Zielgruppen (String-Array).', en: 'Audience names (string array).' }, type: 'array', required: false, example: ['KMU-Entscheider', 'Marketing-Manager'] },
      { key: 'campaign.campaignKeywords', label: { de: 'Kampagnen-Keywords', en: 'Campaign Keywords' }, description: { de: 'Kampagnenspezifische Keywords.', en: 'Campaign-specific keywords.' }, type: 'array', required: false, example: ['Black Friday', 'Rabatt', 'Deal'] },
      { key: 'campaign.progress', label: { de: 'Fortschritt (%)', en: 'Progress (%)' }, description: { de: 'Fortschritt in Prozent (0-100).', en: 'Progress percentage (0-100).' }, type: 'number', required: false, example: 0 },
    ],
  },
];

export const AUDIENCE_QUESTIONNAIRE: QuestionnaireSection[] = [
  {
    id: 'audience_data',
    title: { de: 'Zielgruppen-Daten', en: 'Audience Data' },
    description: { de: 'Vollständige Persona-Definition.', en: 'Complete persona definition.' },
    fields: [
      { key: 'audience.name', label: { de: 'Persona-Name', en: 'Persona Name' }, description: { de: 'Name der Zielgruppe / Persona.', en: 'Audience / persona name.' }, type: 'text', required: true, example: 'Marketing-Manager Maria' },
      { key: 'audience.type', label: { de: 'Typ', en: 'Type' }, description: { de: '"buyer" oder "user".', en: '"buyer" or "user".' }, type: 'select', required: true, options: ['buyer', 'user'], example: 'buyer' },
      { key: 'audience.segment', label: { de: 'Segment', en: 'Segment' }, description: { de: '"B2C" oder "B2B".', en: '"B2C" or "B2B".' }, type: 'select', required: true, options: ['B2C', 'B2B'], example: 'B2B' },
      { key: 'audience.age', label: { de: 'Alter', en: 'Age' }, description: { de: 'Altersgruppe oder Alter.', en: 'Age group or age.' }, type: 'text', required: false, example: '30-45' },
      { key: 'audience.gender', label: { de: 'Geschlecht', en: 'Gender' }, description: { de: 'Geschlecht.', en: 'Gender.' }, type: 'text', required: false, example: 'weiblich' },
      { key: 'audience.location', label: { de: 'Standort', en: 'Location' }, description: { de: 'Wohnort / Region.', en: 'Residence / region.' }, type: 'text', required: false, example: 'DACH-Region' },
      { key: 'audience.income', label: { de: 'Einkommen', en: 'Income' }, description: { de: 'Einkommensspanne.', en: 'Income range.' }, type: 'text', required: false, example: '60.000-100.000 EUR' },
      { key: 'audience.education', label: { de: 'Bildung', en: 'Education' }, description: { de: 'Bildungsgrad.', en: 'Education level.' }, type: 'text', required: false, example: 'Hochschulabschluss' },
      { key: 'audience.jobTitle', label: { de: 'Jobtitel', en: 'Job Title' }, description: { de: 'Position / Titel.', en: 'Job position / title.' }, type: 'text', required: false, example: 'Head of Marketing' },
      { key: 'audience.interests', label: { de: 'Interessen', en: 'Interests' }, description: { de: 'String-Array.', en: 'String array.' }, type: 'array', required: false, example: ['Content Marketing', 'Analytics', 'Automation'] },
      { key: 'audience.painPoints', label: { de: 'Pain Points', en: 'Pain Points' }, description: { de: 'Herausforderungen / Schmerzpunkte.', en: 'Challenges / pain points.' }, type: 'array', required: true, example: ['Kein Budget für Agentur', 'Zu wenig Zeit'] },
      { key: 'audience.goals', label: { de: 'Ziele', en: 'Goals' }, description: { de: 'Was möchte die Person erreichen?', en: 'What does the person want to achieve?' }, type: 'array', required: true, example: ['Mehr Leads', 'Brand Awareness steigern'] },
      { key: 'audience.preferredChannels', label: { de: 'Bevorzugte Kanäle', en: 'Preferred Channels' }, description: { de: 'Welche Kanäle nutzt die Persona?', en: 'Which channels does the persona use?' }, type: 'array', required: false, example: ['LinkedIn', 'Email', 'Google'] },
      { key: 'audience.buyingBehavior', label: { de: 'Kaufverhalten', en: 'Buying Behavior' }, description: { de: 'Beschreibung des Kaufverhaltens.', en: 'Buying behavior description.' }, type: 'textarea', required: false, example: 'Recherchiert gründlich, vergleicht 3-4 Tools.' },
      { key: 'audience.decisionProcess', label: { de: 'Entscheidungsprozess', en: 'Decision Process' }, description: { de: 'Wie wird eine Kaufentscheidung getroffen?', en: 'How is a purchase decision made?' }, type: 'textarea', required: false, example: 'Empfehlung → Demo → Budget-Freigabe → Kauf' },
      { key: 'audience.journeyPhase', label: { de: 'Journey-Phase', en: 'Journey Phase' }, description: { de: 'Aktuelle Phase in der Customer Journey.', en: 'Current customer journey phase.' }, type: 'select', required: false, options: ['Awareness', 'Consideration', 'Decision', 'Retention', 'Advocacy'], example: 'Consideration' },
      { key: 'audience.description', label: { de: 'Detailbeschreibung', en: 'Detailed Description' }, description: { de: 'Freitext-Beschreibung der Persona.', en: 'Free-text persona description.' }, type: 'textarea', required: false, example: 'Maria ist Marketing-Leiterin eines KMU mit 20 Mitarbeitern...' },
    ],
  },
];

// ─── Template Generator ────────────────────────────────────

export function generateProjectTemplate(): ProjectExportData {
  return {
    _meta: { version: SCHEMA_VERSION, type: 'project', exportedAt: '', appName: APP_NAME },
    project: { name: '', description: '', industry: '', logo: '' },
    positioning: {
      name: '', tagline: '', founded: '', industry: '', headquarters: '',
      legalForm: '', employees: '', website: '', vision: '', mission: '',
      values: [], toneOfVoice: { adjectives: [], description: '', personality: '' },
      dos: [], donts: [], primaryMarket: '', secondaryMarkets: [],
      targetCompanySize: '', targetIndustries: [], lastUpdated: '', updatedBy: '',
    },
    keywords: [],
    budgetCategories: [],
  };
}

export function generateCampaignTemplate(): CampaignExportData {
  return {
    _meta: { version: SCHEMA_VERSION, type: 'campaign', exportedAt: '', appName: APP_NAME },
    campaign: {
      name: '', status: 'planned', startDate: '', endDate: '',
      budget: 0, spent: 0, channels: [], description: '', masterPrompt: '',
      targetAudiences: [], campaignKeywords: [],
      kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
      progress: 0,
    },
  };
}

export function generateAudienceTemplate(): AudienceExportData {
  return {
    _meta: { version: SCHEMA_VERSION, type: 'audience', exportedAt: '', appName: APP_NAME },
    audience: {
      name: '', type: 'buyer', segment: 'B2B',
      age: '', gender: '', location: '', income: '', education: '', jobTitle: '',
      interests: [], painPoints: [], goals: [], preferredChannels: [],
      buyingBehavior: '', decisionProcess: '', journeyPhase: 'Awareness', description: '',
    },
  };
}

export function downloadTemplate(level: ImportLevel): void {
  switch (level) {
    case 'project':
      downloadJson(generateProjectTemplate(), 'vorlage_projekt.json');
      break;
    case 'campaign':
      downloadJson(generateCampaignTemplate(), 'vorlage_kampagne.json');
      break;
    case 'audience':
      downloadJson(generateAudienceTemplate(), 'vorlage_zielgruppe.json');
      break;
  }
}

import type { Audience, CustomerJourney } from '../types';
import type { CompanyPositioning, CompanyValue, JourneyStage } from '../types/dashboard';

export const CUSTOMER_JOURNEY_PHASES = [
  {
    phase: 'Awareness',
    title: 'Problem sichtbar machen',
    explanation: 'Der Kunde erkennt erstmals das Problem, den Bedarf oder die Chance.',
    prompt: 'Wodurch merkt die Zielgruppe, dass Handlungsbedarf besteht?',
  },
  {
    phase: 'Consideration',
    title: 'Optionen vergleichen',
    explanation: 'Die Zielgruppe informiert sich, bewertet Alternativen und sucht Vertrauen.',
    prompt: 'Welche Fragen, Zweifel und Kriterien bestimmen die Auswahl?',
  },
  {
    phase: 'Purchase',
    title: 'Entscheidung absichern',
    explanation: 'Die Entscheidung wird vorbereitet, abgestimmt und final getroffen.',
    prompt: 'Was muss passieren, damit aus Interesse eine belastbare Entscheidung wird?',
  },
  {
    phase: 'Retention',
    title: 'Erfolg erlebbar machen',
    explanation: 'Nach dem Start muss der Kunde Orientierung, Nutzen und Stabilität erleben.',
    prompt: 'Wie bleibt der Kunde nach dem Start aktiv, sicher und zufrieden?',
  },
  {
    phase: 'Advocacy',
    title: 'Empfehlung auslösen',
    explanation: 'Zufriedene Kunden teilen Erfahrungen, empfehlen weiter und liefern Beweise.',
    prompt: 'Welche Erfahrung macht den Kunden empfehlungsbereit?',
  },
] as const;

export const SETUP_VALUES_TEMPLATE: CompanyValue[] = [
  { id: 'setup-value-1', title: '', icon: '🎯', description: '' },
  { id: 'setup-value-2', title: '', icon: '🤝', description: '' },
  { id: 'setup-value-3', title: '', icon: '🚀', description: '' },
];

export function normalizeListInput(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function formatListInput(values: string[] | undefined): string {
  return (values ?? []).join(', ');
}

export function createEmptyPositioningSeed(company?: { name?: string; industry?: string; description?: string }): CompanyPositioning {
  return {
    name: company?.name ?? '',
    tagline: '',
    founded: '',
    industry: company?.industry ?? '',
    headquarters: '',
    legalForm: '',
    employees: '',
    website: '',
    vision: '',
    mission: company?.description ?? '',
    values: SETUP_VALUES_TEMPLATE,
    toneOfVoice: {
      adjectives: [],
      description: '',
      personality: '',
    },
    dos: [],
    donts: [],
    primaryMarket: '',
    secondaryMarkets: [],
    targetCompanySize: '',
    targetIndustries: [],
    lastUpdated: '',
    updatedBy: '',
  };
}

export function createAudienceSeed(): Omit<Audience, 'id'> {
  return {
    name: '',
    type: 'buyer',
    segment: 'B2B',
    color: '#3b82f6',
    initials: 'NP',
    age: '',
    gender: '',
    location: '',
    income: '',
    education: '',
    jobTitle: '',
    interests: [],
    painPoints: [],
    goals: [],
    preferredChannels: [],
    buyingBehavior: '',
    decisionProcess: '',
    journeyPhase: 'Awareness',
    description: '',
    campaignIds: [],
    createdAt: '',
    updatedAt: '',
  };
}

export function createAudiencePayload(draft: Omit<Audience, 'id'>): Omit<Audience, 'id'> {
  const initials = draft.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NP';

  return {
    ...draft,
    initials,
    createdAt: draft.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildCustomerJourneyStages(overrides?: Partial<Record<string, Partial<JourneyStage>>>): JourneyStage[] {
  return CUSTOMER_JOURNEY_PHASES.map((item, index) => {
    const override = overrides?.[item.phase] ?? {};

    return {
      id: override.id ?? `setup-stage-${index + 1}`,
      phase: item.phase,
      title: override.title ?? item.title,
      description: override.description ?? item.explanation,
      touchpoints: override.touchpoints ?? [],
      contentFormats: override.contentFormats ?? [],
      emotions: override.emotions ?? [],
      painPoints: override.painPoints ?? [],
      metrics: override.metrics ?? {
        label: 'Zielbild',
        value: 'Noch offen',
        trend: 'Setup',
      },
      contentIds: override.contentIds ?? [],
    };
  });
}

export function createCustomerJourneyDraft(audienceId: string, audienceName: string): Omit<CustomerJourney, 'id'> {
  return {
    name: audienceName ? `${audienceName} - Erste Customer Journey` : 'Erste Customer Journey',
    audienceId,
    description: 'Die erste Journey bildet die Grundlogik vom ersten Kontakt bis zur Empfehlung ab. Kampagnen, Content und Aufgaben können später pro Phase angedockt werden.',
    stages: buildCustomerJourneyStages(),
  };
}

export function createCustomerJourneyPlaceholder(audience?: Pick<Audience, 'id' | 'name'> | null): CustomerJourney {
  return {
    id: 'setup-placeholder-journey',
    ...createCustomerJourneyDraft(audience?.id ?? '', audience?.name ?? 'Erste Zielgruppe'),
  };
}

export function hasMinimumPositioning(positioning: CompanyPositioning): boolean {
  return Boolean(
    positioning.name.trim() &&
    positioning.industry.trim() &&
    positioning.website.trim() &&
    positioning.vision.trim() &&
    positioning.mission.trim() &&
    positioning.primaryMarket.trim() &&
    positioning.toneOfVoice.adjectives.length > 0
  );
}

export function hasMinimumAudience(audience?: Audience | null): boolean {
  if (!audience) return false;
  return Boolean(
    audience.name.trim() &&
    audience.description.trim() &&
    audience.painPoints.length > 0 &&
    audience.goals.length > 0
  );
}

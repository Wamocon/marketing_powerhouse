import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProjectRouter, useProjectPath } from '../hooks/useProjectRouter';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Circle,
  Compass,
  Map,
  Radio,
  Sparkles,
  Target,
  Users2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import type { Audience } from '../types';
import type { CompanyPositioning, JourneyStage } from '../types/dashboard';
import {
  createAudiencePayload,
  createAudienceSeed,
  createCustomerJourneyDraft,
  createEmptyPositioningSeed,
  CUSTOMER_JOURNEY_PHASES,
  formatListInput,
  hasMinimumAudience,
  hasMinimumPositioning,
  normalizeListInput,
  SETUP_VALUES_TEMPLATE,
} from '../lib/projectSetup';

type SetupStep = 'company' | 'audience' | 'journey' | 'review';

interface AudienceFormState {
  name: string;
  type: string;
  segment: 'B2B' | 'B2C';
  age: string;
  gender: string;
  location: string;
  income: string;
  education: string;
  jobTitle: string;
  description: string;
  preferredChannels: string;
  painPoints: string;
  goals: string;
  decisionProcess: string;
  buyingBehavior: string;
  journeyPhase: string;
}

interface JourneyFormState {
  name: string;
  description: string;
  stages: JourneyStage[];
}

const STEP_ORDER: SetupStep[] = ['company', 'audience', 'journey', 'review'];

const STEP_META: Record<SetupStep, { label: string; title: string; description: string; icon: typeof Building2 }> = {
  company: {
    label: '01',
    title: 'Projektbasis',
    description: 'Digitale Positionierung, Keywords und Zielmarkt sauber anlegen.',
    icon: Building2,
  },
  audience: {
    label: '02',
    title: 'Erste Zielgruppe',
    description: 'Die erste Persona mit Problem, Ziel und Entscheidungsmuster definieren.',
    icon: Users2,
  },
  journey: {
    label: '03',
    title: 'Customer Journey',
    description: 'Die 5-Phasen-Hülle für das Projekt erzeugen und inhaltlich erklären.',
    icon: Map,
  },
  review: {
    label: '04',
    title: 'Startklar',
    description: 'Pflichtdaten prüfen und die nächsten sinnvollen Schritte verlinken.',
    icon: Compass,
  },
};

function ensureValues(values: CompanyPositioning['values'] | undefined): CompanyPositioning['values'] {
  const base = values && values.length > 0 ? values : SETUP_VALUES_TEMPLATE;
  return Array.from({ length: 3 }, (_, index) => ({
    ...(base[index] ?? SETUP_VALUES_TEMPLATE[index]),
    id: base[index]?.id ?? `setup-value-${index + 1}`,
  }));
}

function toAudienceFormState(audience?: Audience | null): AudienceFormState {
  return {
    name: audience?.name ?? '',
    type: audience?.type ?? 'buyer',
    segment: audience?.segment ?? 'B2B',
    age: audience?.age ?? '',
    gender: audience?.gender ?? '',
    location: audience?.location ?? '',
    income: audience?.income ?? '',
    education: audience?.education ?? '',
    jobTitle: audience?.jobTitle ?? '',
    description: audience?.description ?? '',
    preferredChannels: formatListInput(audience?.preferredChannels),
    painPoints: formatListInput(audience?.painPoints),
    goals: formatListInput(audience?.goals),
    decisionProcess: audience?.decisionProcess ?? '',
    buyingBehavior: audience?.buyingBehavior ?? '',
    journeyPhase: audience?.journeyPhase ?? 'Awareness',
  };
}

function toJourneyFormState(audience?: Audience | null, stages?: JourneyStage[], journey?: { name: string; description: string }): JourneyFormState {
  const draft = createCustomerJourneyDraft(audience?.id ?? '', audience?.name ?? 'Erste Zielgruppe');
  return {
    name: journey?.name ?? draft.name,
    description: journey?.description ?? draft.description,
    stages: stages && stages.length > 0 ? stages : draft.stages,
  };
}

export default function SetupProjectPage() {
  const router = useProjectRouter();
  const companyPath = useProjectPath();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const { activeCompany } = useCompany();
  const {
    positioning,
    savePositioning,
    companyKeywords,
    addKeyword,
    audiences,
    addAudience,
    updateAudience,
    customerJourneys,
    addJourney,
    touchpoints,
  } = useData();

  const primaryAudience = audiences[0] ?? null;
  const primaryJourney = customerJourneys[0] ?? null;
  const [currentStep, setCurrentStep] = useState<SetupStep>('company');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busyStep, setBusyStep] = useState<SetupStep | null>(null);

  const [positioningDraft, setPositioningDraft] = useState<CompanyPositioning>(createEmptyPositioningSeed(activeCompany ?? undefined));
  const [keywordsInput, setKeywordsInput] = useState('');
  const [secondaryMarketsInput, setSecondaryMarketsInput] = useState('');
  const [targetIndustriesInput, setTargetIndustriesInput] = useState('');
  const [toneAdjectivesInput, setToneAdjectivesInput] = useState('');
  const [dosInput, setDosInput] = useState('');
  const [dontsInput, setDontsInput] = useState('');

  const [audienceForm, setAudienceForm] = useState<AudienceFormState>(toAudienceFormState(primaryAudience));
  const [journeyForm, setJourneyForm] = useState<JourneyFormState>(toJourneyFormState(primaryAudience));

  useEffect(() => {
    const seed = positioning?.name || positioning?.industry || positioning?.vision
      ? positioning
      : createEmptyPositioningSeed(activeCompany ?? undefined);

    setPositioningDraft({
      ...seed,
      values: ensureValues(seed.values),
    });
    setKeywordsInput(companyKeywords.map(item => item.term).join(', '));
    setSecondaryMarketsInput(formatListInput(seed.secondaryMarkets));
    setTargetIndustriesInput(formatListInput(seed.targetIndustries));
    setToneAdjectivesInput(formatListInput(seed.toneOfVoice.adjectives));
    setDosInput(formatListInput(seed.dos));
    setDontsInput(formatListInput(seed.donts));
  }, [activeCompany, companyKeywords, positioning]);

  useEffect(() => {
    setAudienceForm(toAudienceFormState(primaryAudience));
  }, [primaryAudience]);

  useEffect(() => {
    setJourneyForm(toJourneyFormState(primaryAudience, primaryJourney?.stages, primaryJourney ?? undefined));
  }, [primaryAudience, primaryJourney]);

  useEffect(() => {
    if (searchParams.get('step') === 'journey') {
      setCurrentStep('journey');
    }
  }, [searchParams]);

  const setupStatus = useMemo(() => {
    const positioningReady = hasMinimumPositioning({
      ...positioningDraft,
      secondaryMarkets: normalizeListInput(secondaryMarketsInput),
      targetIndustries: normalizeListInput(targetIndustriesInput),
      toneOfVoice: {
        ...positioningDraft.toneOfVoice,
        adjectives: normalizeListInput(toneAdjectivesInput),
      },
      dos: normalizeListInput(dosInput),
      donts: normalizeListInput(dontsInput),
    });

    return {
      company: positioningReady,
      audience: hasMinimumAudience(primaryAudience),
      journey: customerJourneys.length > 0,
      review: positioningReady && hasMinimumAudience(primaryAudience) && customerJourneys.length > 0,
      touchpoints: touchpoints.length > 0,
    };
  }, [customerJourneys.length, dontsInput, dosInput, positioningDraft, primaryAudience, secondaryMarketsInput, targetIndustriesInput, toneAdjectivesInput, touchpoints.length]);

  const completionCount = [setupStatus.company, setupStatus.audience, setupStatus.journey, setupStatus.review]
    .filter(Boolean)
    .length;

  const nextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const target = STEP_ORDER[Math.min(currentIndex + 1, STEP_ORDER.length - 1)];
    setCurrentStep(target);
  };

  const previousStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const target = STEP_ORDER[Math.max(currentIndex - 1, 0)];
    setCurrentStep(target);
  };

  const updateValue = (index: number, field: 'title' | 'description') => {
    return (value: string) => {
      setPositioningDraft(prev => ({
        ...prev,
        values: prev.values.map((item, currentIndex) => currentIndex === index ? { ...item, [field]: value } : item),
      }));
    };
  };

  const saveCompanyStep = async () => {
    if (!activeCompany) {
      setMessage({ type: 'error', text: 'Es ist aktuell kein Projekt aktiv.' });
      return;
    }

    setBusyStep('company');
    setMessage(null);

    try {
      const normalizedKeywords = normalizeListInput(keywordsInput);
      const normalizedPositioning = {
        ...positioningDraft,
        values: ensureValues(positioningDraft.values),
        secondaryMarkets: normalizeListInput(secondaryMarketsInput),
        targetIndustries: normalizeListInput(targetIndustriesInput),
        toneOfVoice: {
          ...positioningDraft.toneOfVoice,
          adjectives: normalizeListInput(toneAdjectivesInput),
        },
        dos: normalizeListInput(dosInput),
        donts: normalizeListInput(dontsInput),
        updatedBy: currentUser?.name ?? 'System',
      };

      await savePositioning(normalizedPositioning);

      const existingTerms = new Set(companyKeywords.map(item => item.term.trim().toLowerCase()));
      for (const term of normalizedKeywords) {
        if (!existingTerms.has(term.toLowerCase())) {
          await addKeyword({ term, category: 'Setup', description: 'Im Projekt-Setup angelegt.' });
        }
      }

      setMessage({ type: 'success', text: 'Projektbasis und Positionierung wurden gespeichert.' });
      setCurrentStep('audience');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Die Positionierung konnte nicht gespeichert werden.' });
    } finally {
      setBusyStep(null);
    }
  };

  const saveAudienceStep = async () => {
    setBusyStep('audience');
    setMessage(null);

    try {
      const seed = createAudienceSeed();
      const payload = createAudiencePayload({
        ...seed,
        name: audienceForm.name,
        type: audienceForm.type,
        segment: audienceForm.segment,
        age: audienceForm.age,
        gender: audienceForm.gender,
        location: audienceForm.location,
        income: audienceForm.income,
        education: audienceForm.education,
        jobTitle: audienceForm.jobTitle,
        description: audienceForm.description,
        preferredChannels: normalizeListInput(audienceForm.preferredChannels),
        painPoints: normalizeListInput(audienceForm.painPoints),
        goals: normalizeListInput(audienceForm.goals),
        decisionProcess: audienceForm.decisionProcess,
        buyingBehavior: audienceForm.buyingBehavior,
        journeyPhase: audienceForm.journeyPhase,
      });

      if (primaryAudience) {
        await updateAudience(primaryAudience.id, payload);
      } else {
        await addAudience(payload);
      }

      setMessage({ type: 'success', text: 'Die erste Zielgruppe wurde gespeichert.' });
      setCurrentStep('journey');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Die Zielgruppe konnte nicht gespeichert werden.' });
    } finally {
      setBusyStep(null);
    }
  };

  const saveJourneyStep = async () => {
    if (primaryJourney) {
      setMessage({ type: 'success', text: 'Es existiert bereits eine Customer Journey. Du kannst jetzt in die Übersicht wechseln.' });
      setCurrentStep('review');
      return;
    }

    if (!primaryAudience) {
      setMessage({ type: 'error', text: 'Speichere zuerst die erste Zielgruppe, damit die Journey darauf aufbauen kann.' });
      return;
    }

    setBusyStep('journey');
    setMessage(null);

    try {
      await addJourney({
        name: journeyForm.name,
        audienceId: primaryAudience.id,
        description: journeyForm.description,
        stages: journeyForm.stages,
      });

      setMessage({ type: 'success', text: 'Die Customer Journey wurde als Hülle angelegt und ist jetzt im System sichtbar.' });
      setCurrentStep('review');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Die Customer Journey konnte nicht gespeichert werden.' });
    } finally {
      setBusyStep(null);
    }
  };

  const renderCompanyStep = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">Projekt-DNA</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Diese Angaben bilden die Grundlage für Texte, Kampagnen, Briefings und spätere KI-Assistenz.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField label="Projektname" hint="Wird als Primärbezug in Positionierung, Journey und Reporting verwendet.">
            <input className="form-input" value={positioningDraft.name} onChange={event => setPositioningDraft(prev => ({ ...prev, name: event.target.value }))} />
          </FormField>
          <FormField label="Tagline" hint="Kurzform des Leistungsversprechens in einem Satz.">
            <input className="form-input" value={positioningDraft.tagline} onChange={event => setPositioningDraft(prev => ({ ...prev, tagline: event.target.value }))} />
          </FormField>
          <FormField label="Branche" hint="Hilft dem System, Sprache, Marktlogik und Benchmarks einzuordnen.">
            <input className="form-input" value={positioningDraft.industry} onChange={event => setPositioningDraft(prev => ({ ...prev, industry: event.target.value }))} />
          </FormField>
          <FormField label="Website" hint="Dient als zentrale Referenz für Marke, Angebot und Corporate Wording.">
            <input className="form-input" value={positioningDraft.website} onChange={event => setPositioningDraft(prev => ({ ...prev, website: event.target.value }))} placeholder="https://..." />
          </FormField>
          <FormField label="Gründungsjahr" hint="Optional, aber hilfreich für Glaubwürdigkeit und Projektkontext.">
            <input className="form-input" value={positioningDraft.founded} onChange={event => setPositioningDraft(prev => ({ ...prev, founded: event.target.value }))} />
          </FormField>
          <FormField label="Hauptsitz" hint="Wichtig für Marktbezug, Regionen und Lokalisierung.">
            <input className="form-input" value={positioningDraft.headquarters} onChange={event => setPositioningDraft(prev => ({ ...prev, headquarters: event.target.value }))} />
          </FormField>
          <FormField label="Rechtsform" hint="Optional, aber sinnvoll für B2B-Vertrauen und Dokumentation.">
            <input className="form-input" value={positioningDraft.legalForm} onChange={event => setPositioningDraft(prev => ({ ...prev, legalForm: event.target.value }))} />
          </FormField>
          <FormField label="Mitarbeiterzahl" hint="Hilft bei der Einordnung von Reifegrad, Ressourcen und Vertriebsansprache.">
            <input className="form-input" value={positioningDraft.employees} onChange={event => setPositioningDraft(prev => ({ ...prev, employees: event.target.value }))} />
          </FormField>
        </div>
      </section>

      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">Identität und Nutzenversprechen</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Vision, Mission und Werte machen deutlich, wofür das Projekt stehen soll und woran spätere Inhalte gemessen werden.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label="Vision" hint="Welches Zukunftsbild wollt ihr für Kunden oder Markt erzeugen?">
            <textarea className="form-input form-textarea" value={positioningDraft.vision} onChange={event => setPositioningDraft(prev => ({ ...prev, vision: event.target.value }))} style={{ minHeight: '96px' }} />
          </FormField>
          <FormField label="Mission" hint="Was tut ihr konkret, für wen, und welchen Nutzen stiftet ihr heute?">
            <textarea className="form-input form-textarea" value={positioningDraft.mission} onChange={event => setPositioningDraft(prev => ({ ...prev, mission: event.target.value }))} style={{ minHeight: '96px' }} />
          </FormField>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Kernwerte
            </div>
            <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Drei Werte genügen für den Start. Formuliere sie konkret statt abstrakt.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {ensureValues(positioningDraft.values).map((value, index) => (
                <div key={value.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ fontSize: '1rem', marginBottom: '8px' }}>{value.icon}</div>
                  <input className="form-input" placeholder={`Wert ${index + 1}`} value={value.title} onChange={event => updateValue(index, 'title')(event.target.value)} style={{ marginBottom: '10px' }} />
                  <textarea className="form-input form-textarea" placeholder="Was bedeutet dieser Wert im Verhalten?" value={value.description} onChange={event => updateValue(index, 'description')(event.target.value)} style={{ minHeight: '84px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">Sprache, Markt und Mindest-Keywords</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Das ist der Teil, der später besonders stark auf Texte, Briefings und Kanalansprache einzahlt.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label="Tone-of-Voice Adjektive" hint="Mindestens drei Adjektive, die den Sprachcharakter eindeutig machen.">
            <input className="form-input" value={toneAdjectivesInput} onChange={event => setToneAdjectivesInput(event.target.value)} placeholder="z. B. präzise, verbindlich, menschlich" />
          </FormField>
          <FormField label="Tone-of-Voice Beschreibung" hint="Erläutert, wie sich die Marke in ganzen Sätzen anhört.">
            <textarea className="form-input form-textarea" value={positioningDraft.toneOfVoice.description} onChange={event => setPositioningDraft(prev => ({ ...prev, toneOfVoice: { ...prev.toneOfVoice, description: event.target.value } }))} style={{ minHeight: '96px' }} />
          </FormField>
          <FormField label="Markenpersönlichkeit" hint="Ein kurzer Satz, der die Marke als Person beschreibt.">
            <input className="form-input" value={positioningDraft.toneOfVoice.personality} onChange={event => setPositioningDraft(prev => ({ ...prev, toneOfVoice: { ...prev.toneOfVoice, personality: event.target.value } }))} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Dos" hint="Welche sprachlichen oder inhaltlichen Muster sind immer erwünscht?">
              <input className="form-input" value={dosInput} onChange={event => setDosInput(event.target.value)} placeholder="z. B. klarer Nutzen, konkrete Beispiele" />
            </FormField>
            <FormField label="Don'ts" hint="Welche Muster, Begriffe oder Tonalitäten sollen vermieden werden?">
              <input className="form-input" value={dontsInput} onChange={event => setDontsInput(event.target.value)} placeholder="z. B. unklare Superlative, technische Floskeln" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Primärmarkt" hint="Euer zentraler Startmarkt. Daran richtet sich der erste Setup-Fokus aus.">
              <input className="form-input" value={positioningDraft.primaryMarket} onChange={event => setPositioningDraft(prev => ({ ...prev, primaryMarket: event.target.value }))} />
            </FormField>
            <FormField label="Zielprojektgröße" hint="Vor allem für B2B wichtig. Bei B2C kannst du hier Segmentgrößen definieren.">
              <input className="form-input" value={positioningDraft.targetCompanySize} onChange={event => setPositioningDraft(prev => ({ ...prev, targetCompanySize: event.target.value }))} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Sekundärmärkte" hint="Kommagetrennt. Optional für spätere Expansion und Priorisierung.">
              <input className="form-input" value={secondaryMarketsInput} onChange={event => setSecondaryMarketsInput(event.target.value)} />
            </FormField>
            <FormField label="Zielbranchen" hint="Kommagetrennt. Besonders relevant für B2B-Ansprache und Cases.">
              <input className="form-input" value={targetIndustriesInput} onChange={event => setTargetIndustriesInput(event.target.value)} />
            </FormField>
          </div>
          <FormField label="Schlüsselbegriffe" hint="Mindestens 3 Begriffe, die im Projekt sprachlich und inhaltlich besetzt werden sollen.">
            <input className="form-input" value={keywordsInput} onChange={event => setKeywordsInput(event.target.value)} placeholder="z. B. Demand Gen, CRM, Automatisierung" />
          </FormField>
        </div>
      </section>
    </div>
  );

  const renderAudienceStep = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">Die erste Persona definieren</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Diese Persona ist bewusst die erste Arbeitsversion. Sie reicht, um die Journey sauber aufzubauen und spätere Kampagnen zu fokussieren.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField label="Persona-Name" hint="Ein konkreter, intern leicht merkbarer Name für die Persona.">
            <input className="form-input" value={audienceForm.name} onChange={event => setAudienceForm(prev => ({ ...prev, name: event.target.value }))} />
          </FormField>
          <FormField label="Typ" hint="Buyer Persona für Kaufentscheider, User Persona für spätere Nutzer.">
            <select className="form-input" value={audienceForm.type} onChange={event => setAudienceForm(prev => ({ ...prev, type: event.target.value }))}>
              <option value="buyer">Buyer Persona</option>
              <option value="user">User Persona</option>
            </select>
          </FormField>
          <FormField label="Segment" hint="Grundlegende Einordnung für Sprache, Kanalwahl und Journey-Logik.">
            <select className="form-input" value={audienceForm.segment} onChange={event => setAudienceForm(prev => ({ ...prev, segment: event.target.value as 'B2B' | 'B2C' }))}>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
            </select>
          </FormField>
          <FormField label="Aktuelle Journey-Phase" hint="In welcher Phase befindet sich diese Zielgruppe typischerweise beim Erstkontakt?">
            <select className="form-input" value={audienceForm.journeyPhase} onChange={event => setAudienceForm(prev => ({ ...prev, journeyPhase: event.target.value }))}>
              {CUSTOMER_JOURNEY_PHASES.map(item => (
                <option key={item.phase} value={item.phase}>{item.phase}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Alter / Segmentalter" hint="Ein grober Rahmen reicht für den Start.">
            <input className="form-input" value={audienceForm.age} onChange={event => setAudienceForm(prev => ({ ...prev, age: event.target.value }))} />
          </FormField>
          <FormField label="Standort / Markt" hint="Hilft bei der Priorisierung von Sprache, Regionen und Touchpoints.">
            <input className="form-input" value={audienceForm.location} onChange={event => setAudienceForm(prev => ({ ...prev, location: event.target.value }))} />
          </FormField>
          <FormField label="Rolle / Jobtitel" hint="Vor allem für B2B wichtig, um Bedarf und Kaufhürden richtig einzuordnen.">
            <input className="form-input" value={audienceForm.jobTitle} onChange={event => setAudienceForm(prev => ({ ...prev, jobTitle: event.target.value }))} />
          </FormField>
          <FormField label="Bildung / Erfahrungsniveau" hint="Optional, aber oft nützlich für Einwände und Content-Tiefe.">
            <input className="form-input" value={audienceForm.education} onChange={event => setAudienceForm(prev => ({ ...prev, education: event.target.value }))} />
          </FormField>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          <FormField label="Kurzbeschreibung" hint="Beschreibe die Persona so, dass Vertrieb, Marketing und KI sie gleich verstehen.">
            <textarea className="form-input form-textarea" value={audienceForm.description} onChange={event => setAudienceForm(prev => ({ ...prev, description: event.target.value }))} style={{ minHeight: '96px' }} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Pain Points" hint="Kommagetrennt. Das sind die Probleme, an denen spätere Botschaften andocken.">
              <input className="form-input" value={audienceForm.painPoints} onChange={event => setAudienceForm(prev => ({ ...prev, painPoints: event.target.value }))} />
            </FormField>
            <FormField label="Ziele" hint="Kommagetrennt. Welche Ergebnisse oder Veränderungen will die Persona erreichen?">
              <input className="form-input" value={audienceForm.goals} onChange={event => setAudienceForm(prev => ({ ...prev, goals: event.target.value }))} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Bevorzugte Kanäle" hint="Kommagetrennt. Noch keine finale Kanalstrategie, aber eine belastbare Startannahme.">
              <input className="form-input" value={audienceForm.preferredChannels} onChange={event => setAudienceForm(prev => ({ ...prev, preferredChannels: event.target.value }))} />
            </FormField>
            <FormField label="Entscheidungsprozess" hint="Wie prüft die Persona, ob sie weitergeht oder abbricht?">
              <textarea className="form-input form-textarea" value={audienceForm.decisionProcess} onChange={event => setAudienceForm(prev => ({ ...prev, decisionProcess: event.target.value }))} style={{ minHeight: '96px' }} />
            </FormField>
          </div>
        </div>
      </section>
    </div>
  );

  const renderJourneyStep = () => {
    const journeyPreviewAudience = primaryAudience ?? ({ name: audienceForm.name, id: '' } as Pick<Audience, 'id' | 'name'>);

    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <section className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '18px' }}>
            <div>
              <div className="card-title">Customer Journey als Start-Hülle</div>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Die Journey muss schon sichtbar sein, bevor Kampagnen, Content oder Aufgaben existieren. Genau dafür wird hier zuerst die Struktur angelegt.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginBottom: '18px' }}>
            <FormField label="Journey-Name" hint="Beschreibe klar, für welche Zielgruppe oder welches Angebot diese Journey steht.">
              <input className="form-input" value={journeyForm.name} onChange={event => setJourneyForm(prev => ({ ...prev, name: event.target.value }))} />
            </FormField>
            <FormField label="Journey-Beschreibung" hint="Wozu dient diese Journey und wann ist sie für das Team hilfreich?">
              <textarea className="form-input form-textarea" value={journeyForm.description} onChange={event => setJourneyForm(prev => ({ ...prev, description: event.target.value }))} style={{ minHeight: '96px' }} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {journeyForm.stages.map((stage, index) => {
              const phaseMeta = CUSTOMER_JOURNEY_PHASES[index];
              return (
                <div key={stage.phase} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--bg-elevated)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '12px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                        Phase {index + 1}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{stage.phase}</div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', maxWidth: '420px', textAlign: 'right' }}>
                      {phaseMeta?.prompt}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <FormField label="Titel" hint={phaseMeta?.explanation ?? 'Erklärt die Rolle dieser Phase.'} compact={true}>
                      <input
                        className="form-input"
                        value={stage.title}
                        onChange={event => setJourneyForm(prev => ({
                          ...prev,
                          stages: prev.stages.map((item, currentIndex) => currentIndex === index ? { ...item, title: event.target.value } : item),
                        }))}
                      />
                    </FormField>
                    <FormField label="Was passiert in dieser Phase?" hint="Beschreibe die Situation des Kunden ohne bereits Kampagnen oder Aufgaben zu benötigen." compact={true}>
                      <textarea
                        className="form-input form-textarea"
                        value={stage.description}
                        onChange={event => setJourneyForm(prev => ({
                          ...prev,
                          stages: prev.stages.map((item, currentIndex) => currentIndex === index ? { ...item, description: event.target.value } : item),
                        }))}
                        style={{ minHeight: '82px' }}
                      />
                    </FormField>
                    <FormField label="Zentrale Hürden oder Fragen" hint="Kommagetrennt. Diese Einwände helfen später bei Content und Touchpoints." compact={true}>
                      <input
                        className="form-input"
                        value={stage.painPoints.join(', ')}
                        onChange={event => setJourneyForm(prev => ({
                          ...prev,
                          stages: prev.stages.map((item, currentIndex) => currentIndex === index ? { ...item, painPoints: normalizeListInput(event.target.value) } : item),
                        }))}
                      />
                    </FormField>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '18px' }}>
            <div>
              <div className="card-title">Live-Vorschau der Hülle</div>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                So erscheint die Journey im System, auch wenn Touchpoints, Inhalte und Aufgaben noch leer sind.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {journeyForm.stages.map(stage => (
              <div key={stage.phase} style={{ minWidth: '260px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', padding: '16px', display: 'grid', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    {stage.phase}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stage.title}</div>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.55 }}>{stage.description}</p>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px dashed var(--border-color)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Noch leer
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Touchpoints, Content und Aufgaben werden später hier angedockt.
                  </div>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Fokus-Persona: <strong>{journeyPreviewAudience.name || 'Noch nicht gespeichert'}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">Mindestbefüllung für den Projektstart</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Hier siehst du, was bereits angelegt ist und was als Nächstes sinnvoll wäre.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <StatusRow done={setupStatus.company} label="Digitale Positionierung ist als Arbeitsgrundlage angelegt." />
          <StatusRow done={setupStatus.audience} label="Die erste Zielgruppe ist definiert." />
          <StatusRow done={setupStatus.journey} label="Die Customer Journey ist als Hülle im System sichtbar." />
          <StatusRow done={setupStatus.touchpoints} label="Mindestens ein Touchpoint ist angelegt." optional={true} />
        </div>
      </section>

      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">Empfohlene nächste Schritte</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Diese Schritte sind für die echte Arbeitsfähigkeit des Projekts besonders sinnvoll, auch wenn sie nicht zwingend Teil der Mindestdaten sind.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <NextStepCard href={companyPath('/touchpoints')} icon={Radio} title="Erste Touchpoints anlegen" description="Mindestens einen Hauptkanal pro Persona festlegen, damit Journey-Phasen später sauber befüllt werden können." />
          <NextStepCard href={companyPath('/positioning')} icon={Target} title="Positionierung verfeinern" description="Werte, Sprachregeln und Keywords mit dem Team scharfziehen, bevor die ersten Inhalte entstehen." />
          <NextStepCard href={companyPath('/audiences')} icon={Users2} title="Weitere Personas ergänzen" description="Sobald das Kernprojekt steht, können weitere Segmente oder Buying Center aufgenommen werden." />
          <NextStepCard href={companyPath('/journeys')} icon={Map} title="Journey weiter ausbauen" description="Touchpoints, Inhalte und später Aufgaben stufenweise pro Phase an die Hülle andocken." />
        </div>
      </section>

      <section className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Projektbasis steht</div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Du kannst jetzt direkt in die Customer Journey, in die Zielgruppen oder zu den Touchpoints springen.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => router.push('/journeys')}>Journey öffnen</button>
          <button className="btn btn-primary" onClick={() => router.push('/')}>Zum Dashboard</button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '24px' }}>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <h1 className="page-title">Geführtes Projekt-Setup</h1>
          <p className="page-subtitle">
            {activeCompany?.name || 'Projekt'} wird jetzt mit den Mindestdaten startklar gemacht: Positionierung, erste Persona und Customer Journey.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'grid', gap: '10px', justifyItems: 'end' }}>
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Fortschritt: <strong style={{ color: 'var(--text-primary)' }}>{completionCount} / 4 Schritte</strong>
          </div>
          {searchParams.get('new') === '1' && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              Das neue Projekt wurde angelegt und direkt in das Setup übernommen.
            </div>
          )}
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: message.type === 'success' ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(239,68,68,0.28)',
          background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          color: message.type === 'success' ? '#047857' : '#b91c1c',
          fontSize: 'var(--font-size-sm)',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        <aside style={{ display: 'grid', gap: '12px', position: 'sticky', top: '24px' }}>
          {STEP_ORDER.map(step => {
            const meta = STEP_META[step];
            const Icon = meta.icon;
            const active = currentStep === step;
            const done = setupStatus[step];
            return (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: active ? 'rgba(220, 38, 38, 0.06)' : 'var(--bg-surface)',
                  display: 'grid',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                      {meta.label}
                    </div>
                  </div>
                  {done ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <Circle size={18} style={{ color: 'var(--text-tertiary)' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{meta.title}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{meta.description}</div>
                </div>
              </button>
            );
          })}
        </aside>

        <div style={{ display: 'grid', gap: '20px' }}>
          {currentStep === 'company' && renderCompanyStep()}
          {currentStep === 'audience' && renderAudienceStep()}
          {currentStep === 'journey' && renderJourneyStep()}
          {currentStep === 'review' && renderReviewStep()}

          <div className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              {currentStep === 'company' && 'Speichere zuerst die Positionierung, damit alle weiteren Module dieselbe Grundlage nutzen.'}
              {currentStep === 'audience' && 'Die erste Persona ist die Brücke zwischen Positionierung und Customer Journey.'}
              {currentStep === 'journey' && 'Die Journey-Hülle wird bewusst ohne Kampagnen, Content und Aufgaben angelegt.'}
              {currentStep === 'review' && 'Von hier aus kannst du direkt in die Fachmodule wechseln.'}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {currentStep !== 'company' && (
                <button className="btn btn-secondary" onClick={previousStep}>Zurück</button>
              )}
              {currentStep === 'company' && (
                <button className="btn btn-primary" onClick={saveCompanyStep} disabled={busyStep === 'company'}>
                  {busyStep === 'company' ? 'Speichere...' : 'Projektbasis speichern'}
                </button>
              )}
              {currentStep === 'audience' && (
                <button className="btn btn-primary" onClick={saveAudienceStep} disabled={busyStep === 'audience'}>
                  {busyStep === 'audience' ? 'Speichere...' : 'Zielgruppe speichern'}
                </button>
              )}
              {currentStep === 'journey' && (
                <button className="btn btn-primary" onClick={saveJourneyStep} disabled={busyStep === 'journey'}>
                  {busyStep === 'journey' ? 'Speichere...' : 'Journey-Hülle anlegen'}
                </button>
              )}
              {currentStep === 'review' && (
                <button className="btn btn-primary" onClick={() => router.push('/journeys')}>
                  In die Journey <ArrowRight size={16} />
                </button>
              )}
              {currentStep !== 'review' && currentStep !== 'company' && (
                <button className="btn btn-ghost" onClick={nextStep}>Schritt überspringen</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', display: 'grid', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Warum dieser Flow existiert</div>
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Neue Projekte scheitern in der Regel nicht an fehlenden Ideen, sondern an fehlender Grundstruktur. Dieses Setup erzwingt die kleinste belastbare Ausgangslage, damit spätere Kampagnen, Inhalte, Touchpoints und Aufgaben in ein sauberes System laufen.
        </div>
      </div>
    </div>
  );
}

function FormField({ label, hint, children, compact = false }: { label: string; hint: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <label style={{ display: 'grid', gap: compact ? '6px' : '8px' }}>
      <div>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
          {label}
        </div>
        <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.45 }}>
          {hint}
        </div>
      </div>
      {children}
    </label>
  );
}

function StatusRow({ done, label, optional = false }: { done: boolean; label: string; optional?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
      {done ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <Circle size={18} style={{ color: 'var(--text-tertiary)' }} />}
      <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{label}</div>
      {optional && (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
          Optional
        </div>
      )}
    </div>
  );
}

function NextStepCard({ href, icon: Icon, title, description }: { href: string; icon: typeof Radio; title: string; description: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px', background: 'var(--bg-surface)', display: 'grid', gap: '10px', height: '100%' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{description}</div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
          Modul öffnen <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

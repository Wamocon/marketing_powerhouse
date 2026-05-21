import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
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

function createStepMeta(t: (v: { de: string; en: string; tr: string }) => string): Record<SetupStep, { label: string; title: string; description: string; icon: typeof Building2 }> {
  return {
    company: {
      label: '01',
      title: t({ de: 'Projektbasis', en: 'Project Base', tr: 'Proje Temeli' }),
      description: t({ de: 'Digitale Positionierung, Keywords und Zielmarkt sauber anlegen.', en: 'Set up digital positioning, keywords, and target market cleanly.', tr: 'Dijital konumlandırma, anahtar kelimeler ve hedef pazarı düzgün şekilde oluşturun.' }),
      icon: Building2,
    },
    audience: {
      label: '02',
      title: t({ de: 'Erste Zielgruppe', en: 'First Target Audience', tr: 'İlk Hedef Kitle' }),
      description: t({ de: 'Die erste Persona mit Problem, Ziel und Entscheidungsmuster definieren.', en: 'Define the first persona with problem, goal, and decision pattern.', tr: 'İlk personayı sorun, hedef ve karar kalıbıyla tanımlayın.' }),
      icon: Users2,
    },
    journey: {
      label: '03',
      title: t({ de: 'Customer Journey', en: 'Customer Journey', tr: 'Müşteri Yolculuğu' }),
      description: t({ de: 'Die 5-Phasen-Hülle für das Projekt erzeugen und inhaltlich erklären.', en: 'Create the 5-phase shell for the project and explain its content.', tr: 'Proje için 5 aşamalı çerçeveyi oluşturun ve içeriğini açıklayın.' }),
      icon: Map,
    },
    review: {
      label: '04',
      title: t({ de: 'Startklar', en: 'Ready to Start', tr: 'Başlamaya Hazır' }),
      description: t({ de: 'Pflichtdaten prüfen und die nächsten sinnvollen Schritte verlinken.', en: 'Check required data and link to the next useful steps.', tr: 'Zorunlu verileri kontrol edin ve sonraki anlamlı adımları bağlayın.' }),
      icon: Compass,
    },
  };
}

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
  const { t } = useLanguage();
  const stepMeta = useMemo(() => createStepMeta(t), [t]);
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
      setMessage({ type: 'error', text: t({ de: 'Es ist aktuell kein Projekt aktiv.', en: 'No project is currently active.', tr: 'Şu anda aktif bir proje yok.' }) });
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
          await addKeyword({ term, category: 'Setup', description: t({ de: 'Im Projekt-Setup angelegt.', en: 'Created during project setup.', tr: 'Proje kurulumunda oluşturuldu.' }) });
        }
      }

      setMessage({ type: 'success', text: t({ de: 'Projektbasis und Positionierung wurden gespeichert.', en: 'Project base and positioning have been saved.', tr: 'Proje temeli ve konumlandırma kaydedildi.' }) });
      setCurrentStep('audience');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: t({ de: 'Die Positionierung konnte nicht gespeichert werden.', en: 'Positioning could not be saved.', tr: 'Konumlandırma kaydedilemedi.' }) });
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

      setMessage({ type: 'success', text: t({ de: 'Die erste Zielgruppe wurde gespeichert.', en: 'The first target audience has been saved.', tr: 'İlk hedef kitle kaydedildi.' }) });
      setCurrentStep('journey');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: t({ de: 'Die Zielgruppe konnte nicht gespeichert werden.', en: 'The target audience could not be saved.', tr: 'Hedef kitle kaydedilemedi.' }) });
    } finally {
      setBusyStep(null);
    }
  };

  const saveJourneyStep = async () => {
    if (primaryJourney) {
      setMessage({ type: 'success', text: t({ de: 'Es existiert bereits eine Customer Journey. Du kannst jetzt in die Übersicht wechseln.', en: 'A customer journey already exists. You can now switch to the overview.', tr: 'Bir müşteri yolculuğu zaten mevcut. Şimdi genel bakışa geçebilirsiniz.' }) });
      setCurrentStep('review');
      return;
    }

    if (!primaryAudience) {
      setMessage({ type: 'error', text: t({ de: 'Speichere zuerst die erste Zielgruppe, damit die Journey darauf aufbauen kann.', en: 'Save the first target audience first so the journey can build on it.', tr: 'Önce ilk hedef kitleyi kaydedin, böylece yolculuk bunun üzerine inşa edilebilir.' }) });
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

      setMessage({ type: 'success', text: t({ de: 'Die Customer Journey wurde als Hülle angelegt und ist jetzt im System sichtbar.', en: 'The customer journey has been created as a shell and is now visible in the system.', tr: 'Müşteri yolculuğu bir çerçeve olarak oluşturuldu ve artık sistemde görünür.' }) });
      setCurrentStep('review');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: t({ de: 'Die Customer Journey konnte nicht gespeichert werden.', en: 'The customer journey could not be saved.', tr: 'Müşteri yolculuğu kaydedilemedi.' }) });
    } finally {
      setBusyStep(null);
    }
  };

  const renderCompanyStep = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">{t({ de: 'Projekt-DNA', en: 'Project DNA', tr: 'Proje DNA' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Diese Angaben bilden die Grundlage für Texte, Kampagnen, Briefings und spätere KI-Assistenz.', en: 'This information forms the foundation for texts, campaigns, briefings, and future AI assistance.', tr: 'Bu bilgiler metinler, kampanyalar, brifingleri ve gelecekteki yapay zeka desteği için temel oluşturur.' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField label={t({ de: 'Projektname', en: 'Project Name', tr: 'Proje Adı' })} hint={t({ de: 'Wird als Primärbezug in Positionierung, Journey und Reporting verwendet.', en: 'Used as the primary reference in positioning, journey, and reporting.', tr: 'Konumlandırma, yolculuk ve raporlamada birincil referans olarak kullanılır.' })}>
            <input className="form-input" value={positioningDraft.name} onChange={event => setPositioningDraft(prev => ({ ...prev, name: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Tagline', en: 'Tagline', tr: 'Slogan' })} hint={t({ de: 'Kurzform des Leistungsversprechens in einem Satz.', en: 'Short form of the value proposition in one sentence.', tr: 'Değer önerisinin tek cümlelik kısa biçimi.' })}>
            <input className="form-input" value={positioningDraft.tagline} onChange={event => setPositioningDraft(prev => ({ ...prev, tagline: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Branche', en: 'Industry', tr: 'Sektör' })} hint={t({ de: 'Hilft dem System, Sprache, Marktlogik und Benchmarks einzuordnen.', en: 'Helps the system categorize language, market logic, and benchmarks.', tr: 'Sistemin dil, pazar mantığı ve kıyaslamaları sınıflandırmasına yardımcı olur.' })}>
            <input className="form-input" value={positioningDraft.industry} onChange={event => setPositioningDraft(prev => ({ ...prev, industry: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Website', en: 'Website', tr: 'Web Sitesi' })} hint={t({ de: 'Dient als zentrale Referenz für Marke, Angebot und Corporate Wording.', en: 'Serves as the central reference for brand, offering, and corporate wording.', tr: 'Marka, teklif ve kurumsal dil için merkezi referans olarak hizmet eder.' })}>
            <input className="form-input" value={positioningDraft.website} onChange={event => setPositioningDraft(prev => ({ ...prev, website: event.target.value }))} placeholder="https://..." />
          </FormField>
          <FormField label={t({ de: 'Gründungsjahr', en: 'Year Founded', tr: 'Kuruluş Yılı' })} hint={t({ de: 'Optional, aber hilfreich für Glaubwürdigkeit und Projektkontext.', en: 'Optional, but helpful for credibility and project context.', tr: 'İsteğe bağlı, ancak güvenilirlik ve proje bağlamı için faydalı.' })}>
            <input className="form-input" value={positioningDraft.founded} onChange={event => setPositioningDraft(prev => ({ ...prev, founded: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Hauptsitz', en: 'Headquarters', tr: 'Merkez' })} hint={t({ de: 'Wichtig für Marktbezug, Regionen und Lokalisierung.', en: 'Important for market reference, regions, and localization.', tr: 'Pazar referansı, bölgeler ve yerelleştirme için önemli.' })}>
            <input className="form-input" value={positioningDraft.headquarters} onChange={event => setPositioningDraft(prev => ({ ...prev, headquarters: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Rechtsform', en: 'Legal Form', tr: 'Hukuki Yapı' })} hint={t({ de: 'Optional, aber sinnvoll für B2B-Vertrauen und Dokumentation.', en: 'Optional, but useful for B2B trust and documentation.', tr: 'İsteğe bağlı, ancak B2B güveni ve dokümantasyon için faydalı.' })}>
            <input className="form-input" value={positioningDraft.legalForm} onChange={event => setPositioningDraft(prev => ({ ...prev, legalForm: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Mitarbeiterzahl', en: 'Number of Employees', tr: 'Çalışan Sayısı' })} hint={t({ de: 'Hilft bei der Einordnung von Reifegrad, Ressourcen und Vertriebsansprache.', en: 'Helps categorize maturity, resources, and sales approach.', tr: 'Olgunluk, kaynaklar ve satış yaklaşımını sınıflandırmaya yardımcı olur.' })}>
            <input className="form-input" value={positioningDraft.employees} onChange={event => setPositioningDraft(prev => ({ ...prev, employees: event.target.value }))} />
          </FormField>
        </div>
      </section>

      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">{t({ de: 'Identität und Nutzenversprechen', en: 'Identity and Value Proposition', tr: 'Kimlik ve Değer Önerisi' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Vision, Mission und Werte machen deutlich, wofür das Projekt stehen soll und woran spätere Inhalte gemessen werden.', en: 'Vision, mission, and values clarify what the project stands for and how future content will be measured.', tr: 'Vizyon, misyon ve değerler projenin neyi temsil ettiğini ve gelecekteki içeriklerin neye göre ölçüleceğini netleştirir.' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label={t({ de: 'Vision', en: 'Vision', tr: 'Vizyon' })} hint={t({ de: 'Welches Zukunftsbild wollt ihr für Kunden oder Markt erzeugen?', en: 'What future vision do you want to create for customers or the market?', tr: 'Müşteriler veya pazar için hangi gelecek vizyonunu oluşturmak istiyorsunuz?' })}>
            <textarea className="form-input form-textarea" value={positioningDraft.vision} onChange={event => setPositioningDraft(prev => ({ ...prev, vision: event.target.value }))} style={{ minHeight: '96px' }} />
          </FormField>
          <FormField label={t({ de: 'Mission', en: 'Mission', tr: 'Misyon' })} hint={t({ de: 'Was tut ihr konkret, für wen, und welchen Nutzen stiftet ihr heute?', en: 'What do you do concretely, for whom, and what value do you provide today?', tr: 'Somut olarak ne yapıyorsunuz, kimin için ve bugün hangi değeri sunuyorsunuz?' })}>
            <textarea className="form-input form-textarea" value={positioningDraft.mission} onChange={event => setPositioningDraft(prev => ({ ...prev, mission: event.target.value }))} style={{ minHeight: '96px' }} />
          </FormField>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              {t({ de: 'Kernwerte', en: 'Core Values', tr: 'Temel Değerler' })}
            </div>
            <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Drei Werte genügen für den Start. Formuliere sie konkret statt abstrakt.', en: 'Three values are enough to start. Formulate them concretely rather than abstractly.', tr: 'Başlangıç için üç değer yeterlidir. Bunları soyut değil somut olarak ifade edin.' })}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {ensureValues(positioningDraft.values).map((value, index) => (
                <div key={value.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ fontSize: '1rem', marginBottom: '8px' }}>{value.icon}</div>
                  <input className="form-input" placeholder={t({ de: `Wert ${index + 1}`, en: `Value ${index + 1}`, tr: `Değer ${index + 1}` })} value={value.title} onChange={event => updateValue(index, 'title')(event.target.value)} style={{ marginBottom: '10px' }} />
                  <textarea className="form-input form-textarea" placeholder={t({ de: 'Was bedeutet dieser Wert im Verhalten?', en: 'What does this value mean in practice?', tr: 'Bu değer uygulamada ne anlama gelir?' })} value={value.description} onChange={event => updateValue(index, 'description')(event.target.value)} style={{ minHeight: '84px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">{t({ de: 'Sprache, Markt und Mindest-Keywords', en: 'Language, Market, and Minimum Keywords', tr: 'Dil, Pazar ve Asgari Anahtar Kelimeler' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Das ist der Teil, der später besonders stark auf Texte, Briefings und Kanalansprache einzahlt.', en: 'This is the part that will later have the strongest impact on texts, briefings, and channel communication.', tr: 'Bu, daha sonra metinler, brifingleri ve kanal iletişimi üzerinde en güçlü etkiye sahip olacak kısımdır.' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label={t({ de: 'Tone-of-Voice Adjektive', en: 'Tone of Voice Adjectives', tr: 'Ses Tonu Sıfatları' })} hint={t({ de: 'Mindestens drei Adjektive, die den Sprachcharakter eindeutig machen.', en: 'At least three adjectives that clearly define the language character.', tr: 'Dil karakterini açıkça tanımlayan en az üç sıfat.' })}>
            <input className="form-input" value={toneAdjectivesInput} onChange={event => setToneAdjectivesInput(event.target.value)} placeholder={t({ de: 'z. B. präzise, verbindlich, menschlich', en: 'e.g. precise, reliable, human', tr: 'örn. kesin, güvenilir, insani' })} />
          </FormField>
          <FormField label={t({ de: 'Tone-of-Voice Beschreibung', en: 'Tone of Voice Description', tr: 'Ses Tonu Açıklaması' })} hint={t({ de: 'Erläutert, wie sich die Marke in ganzen Sätzen anhört.', en: 'Explains how the brand sounds in full sentences.', tr: 'Markanın tam cümlelerle nasıl duyulduğunu açıklar.' })}>
            <textarea className="form-input form-textarea" value={positioningDraft.toneOfVoice.description} onChange={event => setPositioningDraft(prev => ({ ...prev, toneOfVoice: { ...prev.toneOfVoice, description: event.target.value } }))} style={{ minHeight: '96px' }} />
          </FormField>
          <FormField label={t({ de: 'Markenpersönlichkeit', en: 'Brand Personality', tr: 'Marka Kişiliği' })} hint={t({ de: 'Ein kurzer Satz, der die Marke als Person beschreibt.', en: 'A short sentence describing the brand as a person.', tr: 'Markayı bir kişi olarak tanımlayan kısa bir cümle.' })}>
            <input className="form-input" value={positioningDraft.toneOfVoice.personality} onChange={event => setPositioningDraft(prev => ({ ...prev, toneOfVoice: { ...prev.toneOfVoice, personality: event.target.value } }))} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label={t({ de: 'Dos', en: 'Dos', tr: 'Yapılması Gerekenler' })} hint={t({ de: 'Welche sprachlichen oder inhaltlichen Muster sind immer erwünscht?', en: 'Which language or content patterns are always desired?', tr: 'Hangi dil veya içerik kalıpları her zaman istenir?' })}>
              <input className="form-input" value={dosInput} onChange={event => setDosInput(event.target.value)} placeholder={t({ de: 'z. B. klarer Nutzen, konkrete Beispiele', en: 'e.g. clear benefit, concrete examples', tr: 'örn. açık fayda, somut örnekler' })} />
            </FormField>
            <FormField label={t({ de: "Don'ts", en: "Don'ts", tr: 'Kaçınılması Gerekenler' })} hint={t({ de: 'Welche Muster, Begriffe oder Tonalitäten sollen vermieden werden?', en: 'Which patterns, terms, or tones should be avoided?', tr: 'Hangi kalıplar, terimler veya tonlardan kaçınılmalıdır?' })}>
              <input className="form-input" value={dontsInput} onChange={event => setDontsInput(event.target.value)} placeholder={t({ de: 'z. B. unklare Superlative, technische Floskeln', en: 'e.g. vague superlatives, technical jargon', tr: 'örn. belirsiz üstünlükler, teknik klişeler' })} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label={t({ de: 'Primärmarkt', en: 'Primary Market', tr: 'Birincil Pazar' })} hint={t({ de: 'Euer zentraler Startmarkt. Daran richtet sich der erste Setup-Fokus aus.', en: 'Your central starting market. The initial setup focus aligns with this.', tr: 'Merkezi başlangıç pazarınız. İlk kurulum odak noktası buna göre şekillenir.' })}>
              <input className="form-input" value={positioningDraft.primaryMarket} onChange={event => setPositioningDraft(prev => ({ ...prev, primaryMarket: event.target.value }))} />
            </FormField>
            <FormField label={t({ de: 'Zielprojektgröße', en: 'Target Company Size', tr: 'Hedef Şirket Büyüklüğü' })} hint={t({ de: 'Vor allem für B2B wichtig. Bei B2C kannst du hier Segmentgrößen definieren.', en: 'Especially important for B2B. For B2C, you can define segment sizes here.', tr: 'Özellikle B2B için önemli. B2C için burada segment büyüklüklerini tanımlayabilirsiniz.' })}>
              <input className="form-input" value={positioningDraft.targetCompanySize} onChange={event => setPositioningDraft(prev => ({ ...prev, targetCompanySize: event.target.value }))} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label={t({ de: 'Sekundärmärkte', en: 'Secondary Markets', tr: 'İkincil Pazarlar' })} hint={t({ de: 'Kommagetrennt. Optional für spätere Expansion und Priorisierung.', en: 'Comma-separated. Optional for later expansion and prioritization.', tr: 'Virgülle ayrılmış. Daha sonraki genişleme ve önceliklendirme için isteğe bağlı.' })}>
              <input className="form-input" value={secondaryMarketsInput} onChange={event => setSecondaryMarketsInput(event.target.value)} />
            </FormField>
            <FormField label={t({ de: 'Zielbranchen', en: 'Target Industries', tr: 'Hedef Sektörler' })} hint={t({ de: 'Kommagetrennt. Besonders relevant für B2B-Ansprache und Cases.', en: 'Comma-separated. Especially relevant for B2B outreach and cases.', tr: 'Virgülle ayrılmış. Özellikle B2B iletişimi ve vaka çalışmaları için önemli.' })}>
              <input className="form-input" value={targetIndustriesInput} onChange={event => setTargetIndustriesInput(event.target.value)} />
            </FormField>
          </div>
          <FormField label={t({ de: 'Schlüsselbegriffe', en: 'Key Terms', tr: 'Anahtar Terimler' })} hint={t({ de: 'Mindestens 3 Begriffe, die im Projekt sprachlich und inhaltlich besetzt werden sollen.', en: 'At least 3 terms that should be used linguistically and contextually in the project.', tr: 'Projede dilsel ve içeriksel olarak kullanılması gereken en az 3 terim.' })}>
            <input className="form-input" value={keywordsInput} onChange={event => setKeywordsInput(event.target.value)} placeholder={t({ de: 'z. B. Demand Gen, CRM, Automatisierung', en: 'e.g. Demand Gen, CRM, Automation', tr: 'örn. Talep Oluşturma, CRM, Otomasyon' })} />
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
            <div className="card-title">{t({ de: 'Die erste Persona definieren', en: 'Define the First Persona', tr: 'İlk Personayı Tanımlayın' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Diese Persona ist bewusst die erste Arbeitsversion. Sie reicht, um die Journey sauber aufzubauen und spätere Kampagnen zu fokussieren.', en: 'This persona is intentionally the first working version. It is enough to build the journey cleanly and focus future campaigns.', tr: 'Bu persona bilinçli olarak ilk çalışma versiyonudur. Yolculuğu düzgün oluşturmak ve gelecekteki kampanyaları odaklamak için yeterlidir.' })}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField label={t({ de: 'Persona-Name', en: 'Persona Name', tr: 'Persona Adı' })} hint={t({ de: 'Ein konkreter, intern leicht merkbarer Name für die Persona.', en: 'A concrete, internally memorable name for the persona.', tr: 'Persona için somut, dahili olarak kolay hatırlanan bir ad.' })}>
            <input className="form-input" value={audienceForm.name} onChange={event => setAudienceForm(prev => ({ ...prev, name: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Typ', en: 'Type', tr: 'Tür' })} hint={t({ de: 'Buyer Persona für Kaufentscheider, User Persona für spätere Nutzer.', en: 'Buyer Persona for purchase decision makers, User Persona for end users.', tr: 'Satın alma karar vericileri için Alıcı Persona, son kullanıcılar için Kullanıcı Persona.' })}>
            <select className="form-input" value={audienceForm.type} onChange={event => setAudienceForm(prev => ({ ...prev, type: event.target.value }))}>
              <option value="buyer">{t({ de: 'Buyer Persona', en: 'Buyer Persona', tr: 'Alıcı Persona' })}</option>
              <option value="user">{t({ de: 'User Persona', en: 'User Persona', tr: 'Kullanıcı Persona' })}</option>
            </select>
          </FormField>
          <FormField label={t({ de: 'Segment', en: 'Segment', tr: 'Segment' })} hint={t({ de: 'Grundlegende Einordnung für Sprache, Kanalwahl und Journey-Logik.', en: 'Basic classification for language, channel selection, and journey logic.', tr: 'Dil, kanal seçimi ve yolculuk mantığı için temel sınıflandırma.' })}>
            <select className="form-input" value={audienceForm.segment} onChange={event => setAudienceForm(prev => ({ ...prev, segment: event.target.value as 'B2B' | 'B2C' }))}>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
            </select>
          </FormField>
          <FormField label={t({ de: 'Aktuelle Journey-Phase', en: 'Current Journey Phase', tr: 'Mevcut Yolculuk Aşaması' })} hint={t({ de: 'In welcher Phase befindet sich diese Zielgruppe typischerweise beim Erstkontakt?', en: 'In which phase is this target audience typically at first contact?', tr: 'Bu hedef kitle ilk temas sırasında tipik olarak hangi aşamadadır?' })}>
            <select className="form-input" value={audienceForm.journeyPhase} onChange={event => setAudienceForm(prev => ({ ...prev, journeyPhase: event.target.value }))}>
              {CUSTOMER_JOURNEY_PHASES.map(item => (
                <option key={item.phase} value={item.phase}>{item.phase}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t({ de: 'Alter / Segmentalter', en: 'Age / Segment Age', tr: 'Yaş / Segment Yaşı' })} hint={t({ de: 'Ein grober Rahmen reicht für den Start.', en: 'A rough range is enough to start.', tr: 'Başlangıç için kaba bir aralık yeterlidir.' })}>
            <input className="form-input" value={audienceForm.age} onChange={event => setAudienceForm(prev => ({ ...prev, age: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Standort / Markt', en: 'Location / Market', tr: 'Konum / Pazar' })} hint={t({ de: 'Hilft bei der Priorisierung von Sprache, Regionen und Touchpoints.', en: 'Helps prioritize language, regions, and touchpoints.', tr: 'Dil, bölgeler ve temas noktalarının önceliklendirilmesine yardımcı olur.' })}>
            <input className="form-input" value={audienceForm.location} onChange={event => setAudienceForm(prev => ({ ...prev, location: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Rolle / Jobtitel', en: 'Role / Job Title', tr: 'Rol / İş Unvanı' })} hint={t({ de: 'Vor allem für B2B wichtig, um Bedarf und Kaufhürden richtig einzuordnen.', en: 'Especially important for B2B to properly classify needs and buying barriers.', tr: 'İhtiyaçları ve satın alma engellerini doğru sınıflandırmak için özellikle B2B için önemli.' })}>
            <input className="form-input" value={audienceForm.jobTitle} onChange={event => setAudienceForm(prev => ({ ...prev, jobTitle: event.target.value }))} />
          </FormField>
          <FormField label={t({ de: 'Bildung / Erfahrungsniveau', en: 'Education / Experience Level', tr: 'Eğitim / Deneyim Düzeyi' })} hint={t({ de: 'Optional, aber oft nützlich für Einwände und Content-Tiefe.', en: 'Optional, but often useful for objections and content depth.', tr: 'İsteğe bağlı, ancak itirazlar ve içerik derinliği için genellikle faydalı.' })}>
            <input className="form-input" value={audienceForm.education} onChange={event => setAudienceForm(prev => ({ ...prev, education: event.target.value }))} />
          </FormField>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          <FormField label={t({ de: 'Kurzbeschreibung', en: 'Short Description', tr: 'Kısa Açıklama' })} hint={t({ de: 'Beschreibe die Persona so, dass Vertrieb, Marketing und KI sie gleich verstehen.', en: 'Describe the persona so that sales, marketing, and AI understand it equally.', tr: 'Personayı satış, pazarlama ve yapay zekanın eşit şekilde anlayacağı şekilde tanımlayın.' })}>
            <textarea className="form-input form-textarea" value={audienceForm.description} onChange={event => setAudienceForm(prev => ({ ...prev, description: event.target.value }))} style={{ minHeight: '96px' }} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label={t({ de: 'Pain Points', en: 'Pain Points', tr: 'Sorun Noktaları' })} hint={t({ de: 'Kommagetrennt. Das sind die Probleme, an denen spätere Botschaften andocken.', en: 'Comma-separated. These are the problems that future messages will address.', tr: 'Virgülle ayrılmış. Bunlar gelecekteki mesajların ele alacağı sorunlardır.' })}>
              <input className="form-input" value={audienceForm.painPoints} onChange={event => setAudienceForm(prev => ({ ...prev, painPoints: event.target.value }))} />
            </FormField>
            <FormField label={t({ de: 'Ziele', en: 'Goals', tr: 'Hedefler' })} hint={t({ de: 'Kommagetrennt. Welche Ergebnisse oder Veränderungen will die Persona erreichen?', en: 'Comma-separated. What results or changes does the persona want to achieve?', tr: 'Virgülle ayrılmış. Persona hangi sonuçları veya değişiklikleri elde etmek istiyor?' })}>
              <input className="form-input" value={audienceForm.goals} onChange={event => setAudienceForm(prev => ({ ...prev, goals: event.target.value }))} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label={t({ de: 'Bevorzugte Kanäle', en: 'Preferred Channels', tr: 'Tercih Edilen Kanallar' })} hint={t({ de: 'Kommagetrennt. Noch keine finale Kanalstrategie, aber eine belastbare Startannahme.', en: 'Comma-separated. Not a final channel strategy yet, but a reliable starting assumption.', tr: 'Virgülle ayrılmış. Henüz nihai bir kanal stratejisi değil, ancak güvenilir bir başlangıç varsayımı.' })}>
              <input className="form-input" value={audienceForm.preferredChannels} onChange={event => setAudienceForm(prev => ({ ...prev, preferredChannels: event.target.value }))} />
            </FormField>
            <FormField label={t({ de: 'Entscheidungsprozess', en: 'Decision Process', tr: 'Karar Süreci' })} hint={t({ de: 'Wie prüft die Persona, ob sie weitergeht oder abbricht?', en: 'How does the persona check whether to continue or drop off?', tr: 'Persona devam edip etmeyeceğini nasıl değerlendirir?' })}>
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
            <div className="card-title">{t({ de: 'Customer Journey als Start-Hülle', en: 'Customer Journey as Starting Shell', tr: 'Başlangıç Çerçevesi Olarak Müşteri Yolculuğu' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Die Journey muss schon sichtbar sein, bevor Kampagnen, Content oder Aufgaben existieren. Genau dafür wird hier zuerst die Struktur angelegt.', en: 'The journey must be visible before campaigns, content, or tasks exist. That is exactly why the structure is created here first.', tr: 'Yolculuk, kampanyalar, içerik veya görevler mevcut olmadan önce görünür olmalıdır. Bu nedenle yapı önce burada oluşturulur.' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginBottom: '18px' }}>
            <FormField label={t({ de: 'Journey-Name', en: 'Journey Name', tr: 'Yolculuk Adı' })} hint={t({ de: 'Beschreibe klar, für welche Zielgruppe oder welches Angebot diese Journey steht.', en: 'Clearly describe which target audience or offering this journey represents.', tr: 'Bu yolculuğun hangi hedef kitleyi veya teklifi temsil ettiğini açıkça belirtin.' })}>
              <input className="form-input" value={journeyForm.name} onChange={event => setJourneyForm(prev => ({ ...prev, name: event.target.value }))} />
            </FormField>
            <FormField label={t({ de: 'Journey-Beschreibung', en: 'Journey Description', tr: 'Yolculuk Açıklaması' })} hint={t({ de: 'Wozu dient diese Journey und wann ist sie für das Team hilfreich?', en: 'What is this journey for and when is it helpful for the team?', tr: 'Bu yolculuk ne işe yarar ve ekip için ne zaman faydalıdır?' })}>
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
                        {t({ de: `Phase ${index + 1}`, en: `Phase ${index + 1}`, tr: `Aşama ${index + 1}` })}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{stage.phase}</div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', maxWidth: '420px', textAlign: 'right' }}>
                      {phaseMeta?.prompt}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <FormField label={t({ de: 'Titel', en: 'Title', tr: 'Başlık' })} hint={phaseMeta?.explanation ?? t({ de: 'Erklärt die Rolle dieser Phase.', en: 'Explains the role of this phase.', tr: 'Bu aşamanın rolünü açıklar.' })} compact={true}>
                      <input
                        className="form-input"
                        value={stage.title}
                        onChange={event => setJourneyForm(prev => ({
                          ...prev,
                          stages: prev.stages.map((item, currentIndex) => currentIndex === index ? { ...item, title: event.target.value } : item),
                        }))}
                      />
                    </FormField>
                    <FormField label={t({ de: 'Was passiert in dieser Phase?', en: 'What happens in this phase?', tr: 'Bu aşamada ne olur?' })} hint={t({ de: 'Beschreibe die Situation des Kunden ohne bereits Kampagnen oder Aufgaben zu benötigen.', en: 'Describe the customer situation without needing campaigns or tasks yet.', tr: 'Henüz kampanya veya görevlere ihtiyaç duymadan müşteri durumunu tanımlayın.' })} compact={true}>
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
                    <FormField label={t({ de: 'Zentrale Hürden oder Fragen', en: 'Key Barriers or Questions', tr: 'Temel Engeller veya Sorular' })} hint={t({ de: 'Kommagetrennt. Diese Einwände helfen später bei Content und Touchpoints.', en: 'Comma-separated. These objections help later with content and touchpoints.', tr: 'Virgülle ayrılmış. Bu itirazlar daha sonra içerik ve temas noktalarında yardımcı olur.' })} compact={true}>
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
            <div className="card-title">{t({ de: 'Live-Vorschau der Hülle', en: 'Live Preview of the Shell', tr: 'Çerçevenin Canlı Önizlemesi' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'So erscheint die Journey im System, auch wenn Touchpoints, Inhalte und Aufgaben noch leer sind.', en: 'This is how the journey appears in the system, even when touchpoints, content, and tasks are still empty.', tr: 'Temas noktaları, içerik ve görevler henüz boş olsa bile yolculuk sistemde böyle görünür.' })}
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
                    {t({ de: 'Noch leer', en: 'Still empty', tr: 'Henüz boş' })}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t({ de: 'Touchpoints, Content und Aufgaben werden später hier angedockt.', en: 'Touchpoints, content, and tasks will be added here later.', tr: 'Temas noktaları, içerik ve görevler daha sonra buraya eklenecektir.' })}
                  </div>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  {t({ de: 'Fokus-Persona:', en: 'Focus Persona:', tr: 'Odak Persona:' })} <strong>{journeyPreviewAudience.name || t({ de: 'Noch nicht gespeichert', en: 'Not yet saved', tr: 'Henüz kaydedilmedi' })}</strong>
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
            <div className="card-title">{t({ de: 'Mindestbefüllung für den Projektstart', en: 'Minimum Data for Project Start', tr: 'Proje Başlangıcı İçin Asgari Veriler' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Hier siehst du, was bereits angelegt ist und was als Nächstes sinnvoll wäre.', en: 'Here you can see what has already been created and what would make sense next.', tr: 'Burada neler oluşturulduğunu ve sırada ne yapmanın mantıklı olacağını görebilirsiniz.' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <StatusRow done={setupStatus.company} label={t({ de: 'Digitale Positionierung ist als Arbeitsgrundlage angelegt.', en: 'Digital positioning has been set up as a working foundation.', tr: 'Dijital konumlandırma çalışma temeli olarak oluşturuldu.' })} />
          <StatusRow done={setupStatus.audience} label={t({ de: 'Die erste Zielgruppe ist definiert.', en: 'The first target audience is defined.', tr: 'İlk hedef kitle tanımlandı.' })} />
          <StatusRow done={setupStatus.journey} label={t({ de: 'Die Customer Journey ist als Hülle im System sichtbar.', en: 'The customer journey is visible as a shell in the system.', tr: 'Müşteri yolculuğu sistemde bir çerçeve olarak görünür.' })} />
          <StatusRow done={setupStatus.touchpoints} label={t({ de: 'Mindestens ein Touchpoint ist angelegt.', en: 'At least one touchpoint has been created.', tr: 'En az bir temas noktası oluşturuldu.' })} optional={true} optionalLabel={t({ de: 'Optional', en: 'Optional', tr: 'İsteğe Bağlı' })} />
        </div>
      </section>

      <section className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card-title">{t({ de: 'Empfohlene nächste Schritte', en: 'Recommended Next Steps', tr: 'Önerilen Sonraki Adımlar' })}</div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t({ de: 'Diese Schritte sind für die echte Arbeitsfähigkeit des Projekts besonders sinnvoll, auch wenn sie nicht zwingend Teil der Mindestdaten sind.', en: 'These steps are especially useful for the project to become truly operational, even if they are not strictly part of the minimum data.', tr: 'Bu adımlar, zorunlu verilerin bir parçası olmasa bile projenin gerçekten çalışır hale gelmesi için özellikle faydalıdır.' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <NextStepCard href={companyPath('/touchpoints')} icon={Radio} title={t({ de: 'Erste Touchpoints anlegen', en: 'Create First Touchpoints', tr: 'İlk Temas Noktalarını Oluşturun' })} description={t({ de: 'Mindestens einen Hauptkanal pro Persona festlegen, damit Journey-Phasen später sauber befüllt werden können.', en: 'Define at least one main channel per persona so that journey phases can be filled cleanly later.', tr: 'Yolculuk aşamalarının daha sonra düzgün doldurulabilmesi için persona başına en az bir ana kanal belirleyin.' })} />
          <NextStepCard href={companyPath('/positioning')} icon={Target} title={t({ de: 'Positionierung verfeinern', en: 'Refine Positioning', tr: 'Konumlandırmayı İyileştirin' })} description={t({ de: 'Werte, Sprachregeln und Keywords mit dem Team scharfziehen, bevor die ersten Inhalte entstehen.', en: 'Sharpen values, language rules, and keywords with the team before the first content is created.', tr: 'İlk içerik oluşturulmadan önce değerleri, dil kurallarını ve anahtar kelimeleri ekiple netleştirin.' })} />
          <NextStepCard href={companyPath('/audiences')} icon={Users2} title={t({ de: 'Weitere Personas ergänzen', en: 'Add More Personas', tr: 'Daha Fazla Persona Ekleyin' })} description={t({ de: 'Sobald das Kernprojekt steht, können weitere Segmente oder Buying Center aufgenommen werden.', en: 'Once the core project is set up, additional segments or buying centers can be added.', tr: 'Temel proje kurulduktan sonra ek segmentler veya satın alma merkezleri eklenebilir.' })} />
          <NextStepCard href={companyPath('/journeys')} icon={Map} title={t({ de: 'Journey weiter ausbauen', en: 'Expand Journey Further', tr: 'Yolculuğu Genişletin' })} description={t({ de: 'Touchpoints, Inhalte und später Aufgaben stufenweise pro Phase an die Hülle andocken.', en: 'Gradually attach touchpoints, content, and later tasks to the shell phase by phase.', tr: 'Temas noktalarını, içeriği ve daha sonra görevleri aşama aşama çerçeveye ekleyin.' })} />
        </div>
      </section>

      <section className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{t({ de: 'Projektbasis steht', en: 'Project Base is Ready', tr: 'Proje Temeli Hazır' })}</div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {t({ de: 'Du kannst jetzt direkt in die Customer Journey, in die Zielgruppen oder zu den Touchpoints springen.', en: 'You can now jump directly to the customer journey, target audiences, or touchpoints.', tr: 'Şimdi doğrudan müşteri yolculuğuna, hedef kitlelere veya temas noktalarına geçebilirsiniz.' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => router.push('/journeys')}>{t({ de: 'Journey öffnen', en: 'Open Journey', tr: 'Yolculuğu Aç' })}</button>
          <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>{t({ de: 'Zum Dashboard', en: 'Go to Dashboard', tr: 'Panele Git' })}</button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '24px' }}>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <h1 className="page-title">{t({ de: 'Geführtes Projekt-Setup', en: 'Guided Project Setup', tr: 'Rehberli Proje Kurulumu' })}</h1>
          <p className="page-subtitle">
            {t({ de: `${activeCompany?.name || 'Projekt'} wird jetzt mit den Mindestdaten startklar gemacht: Positionierung, erste Persona und Customer Journey.`, en: `${activeCompany?.name || 'Project'} is now being prepared with minimum data: positioning, first persona, and customer journey.`, tr: `${activeCompany?.name || 'Proje'} şimdi asgari verilerle hazırlanıyor: konumlandırma, ilk persona ve müşteri yolculuğu.` })}
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'grid', gap: '10px', justifyItems: 'end' }}>
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            {t({ de: 'Fortschritt:', en: 'Progress:', tr: 'İlerleme:' })} <strong style={{ color: 'var(--text-primary)' }}>{completionCount} / 4 {t({ de: 'Schritte', en: 'Steps', tr: 'Adım' })}</strong>
          </div>
          {searchParams.get('new') === '1' && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              {t({ de: 'Das neue Projekt wurde angelegt und direkt in das Setup übernommen.', en: 'The new project has been created and transferred directly to setup.', tr: 'Yeni proje oluşturuldu ve doğrudan kuruluma aktarıldı.' })}
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
            const meta = stepMeta[step];
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
              {currentStep === 'company' && t({ de: 'Speichere zuerst die Positionierung, damit alle weiteren Module dieselbe Grundlage nutzen.', en: 'Save the positioning first so that all other modules use the same foundation.', tr: 'Tüm diğer modüllerin aynı temeli kullanması için önce konumlandırmayı kaydedin.' })}
              {currentStep === 'audience' && t({ de: 'Die erste Persona ist die Brücke zwischen Positionierung und Customer Journey.', en: 'The first persona is the bridge between positioning and the customer journey.', tr: 'İlk persona, konumlandırma ile müşteri yolculuğu arasındaki köprüdür.' })}
              {currentStep === 'journey' && t({ de: 'Die Journey-Hülle wird bewusst ohne Kampagnen, Content und Aufgaben angelegt.', en: 'The journey shell is intentionally created without campaigns, content, and tasks.', tr: 'Yolculuk çerçevesi bilinçli olarak kampanyalar, içerik ve görevler olmadan oluşturulur.' })}
              {currentStep === 'review' && t({ de: 'Von hier aus kannst du direkt in die Fachmodule wechseln.', en: 'From here you can jump directly to the specialized modules.', tr: 'Buradan doğrudan uzmanlaşmış modüllere geçebilirsiniz.' })}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {currentStep !== 'company' && (
                <button className="btn btn-secondary" onClick={previousStep}>{t({ de: 'Zurück', en: 'Back', tr: 'Geri' })}</button>
              )}
              {currentStep === 'company' && (
                <button className="btn btn-primary" onClick={saveCompanyStep} disabled={busyStep === 'company'}>
                  {busyStep === 'company' ? t({ de: 'Speichere...', en: 'Saving...', tr: 'Kaydediliyor...' }) : t({ de: 'Projektbasis speichern', en: 'Save Project Base', tr: 'Proje Temelini Kaydet' })}
                </button>
              )}
              {currentStep === 'audience' && (
                <button className="btn btn-primary" onClick={saveAudienceStep} disabled={busyStep === 'audience'}>
                  {busyStep === 'audience' ? t({ de: 'Speichere...', en: 'Saving...', tr: 'Kaydediliyor...' }) : t({ de: 'Zielgruppe speichern', en: 'Save Target Audience', tr: 'Hedef Kitleyi Kaydet' })}
                </button>
              )}
              {currentStep === 'journey' && (
                <button className="btn btn-primary" onClick={saveJourneyStep} disabled={busyStep === 'journey'}>
                  {busyStep === 'journey' ? t({ de: 'Speichere...', en: 'Saving...', tr: 'Kaydediliyor...' }) : t({ de: 'Journey-Hülle anlegen', en: 'Create Journey Shell', tr: 'Yolculuk Çerçevesini Oluştur' })}
                </button>
              )}
              {currentStep === 'review' && (
                <button className="btn btn-primary" onClick={() => router.push('/journeys')}>
                  {t({ de: 'In die Journey', en: 'Go to Journey', tr: 'Yolculuğa Git' })} <ArrowRight size={16} />
                </button>
              )}
              {currentStep !== 'review' && currentStep !== 'company' && (
                <button className="btn btn-ghost" onClick={nextStep}>{t({ de: 'Schritt überspringen', en: 'Skip Step', tr: 'Adımı Atla' })}</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', display: 'grid', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{t({ de: 'Warum dieser Flow existiert', en: 'Why This Flow Exists', tr: 'Bu Akış Neden Var' })}</div>
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t({ de: 'Neue Projekte scheitern in der Regel nicht an fehlenden Ideen, sondern an fehlender Grundstruktur. Dieses Setup erzwingt die kleinste belastbare Ausgangslage, damit spätere Kampagnen, Inhalte, Touchpoints und Aufgaben in ein sauberes System laufen.', en: 'New projects typically fail not from lack of ideas, but from lack of basic structure. This setup enforces the smallest viable starting point so that future campaigns, content, touchpoints, and tasks run in a clean system.', tr: 'Yeni projeler genellikle fikir eksikliğinden değil, temel yapı eksikliğinden başarısız olur. Bu kurulum, gelecekteki kampanyaların, içeriklerin, temas noktalarının ve görevlerin temiz bir sistemde çalışması için mümkün olan en küçük geçerli başlangıç noktasını zorlar.' })}
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

function StatusRow({ done, label, optional = false, optionalLabel = 'Optional' }: { done: boolean; label: string; optional?: boolean; optionalLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
      {done ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <Circle size={18} style={{ color: 'var(--text-tertiary)' }} />}
      <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{label}</div>
      {optional && (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
          {optionalLabel}
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
          {title} <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

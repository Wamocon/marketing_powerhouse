'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ChevronRight, ChevronLeft, Check, Loader2, AlertCircle,
  Wand2, ArrowLeft, Eye, X, Target, Megaphone, Users2, Radio,
  Calendar, FileText, Zap, ShieldAlert,
} from 'lucide-react';
import { useContents } from '@/context/ContentContext';
import { useTasks } from '@/context/TaskContext';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCompany } from '@/context/CompanyContext';
import { buildContentIdeaPrompt } from '@/lib/contentIdeaPromptBuilder';
import type { ContentIdea, ContentStatus, TaskStatus } from '@/types';
import type { IdeaPromptContext } from '@/lib/contentIdeaPromptBuilder';

type SurveyStep = 'context' | 'channels' | 'config' | 'generating' | 'results' | 'success';

const JOURNEY_PHASES = ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'];

const PLATFORM_OPTIONS = [
  'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'X', 'YouTube',
  'Blog', 'Website', 'Google Ads', 'E-Mail',
];

const CONTENT_TYPE_MAP: Record<string, string> = {
  social: 'social',
  email: 'email',
  ads: 'ads',
  content: 'content',
  event: 'event',
};

const CONTENT_TYPE_LABELS: Record<string, { de: string; en: string; tr: string }> = {
  social: { de: 'Social Media', en: 'Social Media', tr: 'Sosyal Medya' },
  email: { de: 'E-Mail Marketing', en: 'E-Mail Marketing', tr: 'E-Posta Pazarlama' },
  ads: { de: 'Paid Advertising', en: 'Paid Advertising', tr: 'Ücretli Reklam' },
  content: { de: 'Blog / Content', en: 'Blog / Content', tr: 'Blog / İçerik' },
  event: { de: 'Event / Webinar', en: 'Event / Webinar', tr: 'Etkinlik / Webinar' },
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  social: '#6366f1',
  email: '#f59e0b',
  ads: '#ef4444',
  content: '#10b981',
  event: '#8b5cf6',
};

const JOURNEY_PHASE_COLORS: Record<string, string> = {
  Awareness: '#3b82f6',
  Consideration: '#8b5cf6',
  Purchase: '#10b981',
  Retention: '#f59e0b',
  Advocacy: '#ec4899',
};

const L = {
  pageTitle: { de: 'KI Content-Ideen Generator', en: 'AI Content Ideas Generator', tr: 'YZ İçerik Fikir Üreteci' },
  pageSubtitle: { de: 'Lass dir von der KI passende Content-Ideen und Aufgaben generieren', en: 'Let AI generate matching content ideas and tasks for you', tr: 'YZ\'nin sizin için uygun içerik fikirleri ve görevler üretmesine izin verin' },
  backToOverview: { de: 'Zurück zur Übersicht', en: 'Back to overview', tr: 'Genel bakışa dön' },
  step1Title: { de: 'Kampagne & Zielgruppe', en: 'Campaign & audience', tr: 'Kampanya & hedef kitle' },
  step1Desc: { de: 'Wähle den strategischen Rahmen für die Ideengenerierung. Eine Kampagne liefert Kontext, eine Zielgruppe schärft die Ansprache.', en: 'Choose the strategic framework for idea generation. A campaign provides context, an audience sharpens targeting.', tr: 'Fikir üretimi için stratejik çerçeveyi seçin. Kampanya bağlam sağlar, hedef kitle hedeflemeyi keskinleştirir.' },
  campaign: { de: 'Kampagne', en: 'Campaign', tr: 'Kampanya' },
  campaignHint: { de: 'Die Kampagne liefert Ziel, Master-Prompt und strategischen Kontext.', en: 'The campaign provides goals, master prompt and strategic context.', tr: 'Kampanya hedefleri, master promptu ve stratejik bağlamı sağlar.' },
  noCampaign: { de: 'Ohne Kampagne (freie Ideenfindung)', en: 'Without campaign (free ideation)', tr: 'Kampanyasız (serbest fikir üretimi)' },
  audience: { de: 'Zielgruppe', en: 'Audience', tr: 'Hedef Kitle' },
  audienceHint: { de: 'Die Zielgruppe bestimmt Sprache, Pain Points und bevorzugte Kanäle.', en: 'The audience determines language, pain points and preferred channels.', tr: 'Hedef kitle dili, sorunlu noktaları ve tercih edilen kanalları belirler.' },
  noAudience: { de: 'Keine Zielgruppe (allgemein)', en: 'No audience (general)', tr: 'Hedef kitle yok (genel)' },
  step2Title: { de: 'Kanäle & Customer Journey', en: 'Channels & customer journey', tr: 'Kanallar & müşteri yolculuğu' },
  step2Desc: { de: 'Bestimme, wo und in welcher Kaufphase dein Content wirken soll. Keine Auswahl bedeutet "alle".', en: 'Define where and in which buying phase your content should work. No selection means "all".', tr: 'İçeriğinizin nerede ve hangi satın alma aşamasında etkili olacağını belirleyin. Seçim yapılmazsa "tümü" anlamına gelir.' },
  channels: { de: 'Kanäle', en: 'Channels', tr: 'Kanallar' },
  channelsHint: { de: 'Auf welchen Plattformen soll der Content ausgespielt werden?', en: 'On which platforms should the content be published?', tr: 'İçerik hangi platformlarda yayınlanacak?' },
  journeyPhases: { de: 'Customer Journey Phase', en: 'Customer journey phase', tr: 'Müşteri yolculuğu aşaması' },
  journeyHint: { de: 'In welcher Phase der Kaufentscheidung soll der Content wirken?', en: 'In which phase of the buying decision should the content work?', tr: 'İçerik satın alma kararının hangi aşamasında etkili olmalı?' },
  step3Title: { de: 'Themen & Konfiguration', en: 'Topics & configuration', tr: 'Konular & yapılandırma' },
  step3Desc: { de: 'Verfeinere die Ideenfindung mit thematischen Schwerpunkten und wähle Ausgabeoptionen.', en: 'Refine idea generation with thematic focus areas and choose output options.', tr: 'Tematik odak alanları ile fikir üretimini iyileştirin ve çıktı seçeneklerini belirleyin.' },
  themeKeywords: { de: 'Thematische Schwerpunkte', en: 'Thematic focus areas', tr: 'Tematik odak alanları' },
  themeKeywordsHint: { de: 'Optional: Gib Themen, Trends oder Keywords an, die die KI als Inspiration nutzen soll.', en: 'Optional: Provide topics, trends or keywords the AI should use as inspiration.', tr: 'İsteğe bağlı: YZ\'nin ilham kaynağı olarak kullanacağı konuları, trendleri veya anahtar kelimeleri girin.' },
  themeKeywordsPlaceholder: { de: 'z.B. Nachhaltigkeit, KI-Trends, Q3-Launch, Employer Branding...', en: 'e.g. sustainability, AI trends, Q3 launch, employer branding...', tr: 'ör. sürdürülebilirlik, YZ trendleri, Q3 lansman, işveren markası...' },
  ideaCount: { de: 'Anzahl Ideen', en: 'Number of ideas', tr: 'Fikir sayısı' },
  ideaCountHint: { de: 'Mehr Ideen geben dir eine breitere Auswahl, dauern aber länger.', en: 'More ideas give you a broader selection, but take longer.', tr: 'Daha fazla fikir daha geniş bir seçenek sunar ancak daha uzun sürer.' },
  outputLanguage: { de: 'Ausgabesprache der Ideen', en: 'Output language of ideas', tr: 'Fikirlerin çıktı dili' },
  german: { de: 'Deutsch', en: 'German', tr: 'Almanca' },
  english: { de: 'Englisch', en: 'English', tr: 'İngilizce' },
  turkish: { de: 'Türkisch', en: 'Turkish', tr: 'Türkçe' },
  next: { de: 'Weiter', en: 'Next', tr: 'İleri' },
  back: { de: 'Zurück', en: 'Back', tr: 'Geri' },
  generate: { de: 'Ideen generieren', en: 'Generate ideas', tr: 'Fikir üret' },
  generating: { de: 'KI generiert Content-Ideen...', en: 'AI is generating content ideas...', tr: 'YZ içerik fikirleri üretiyor...' },
  generatingDesc: { de: 'Die KI analysiert deine Markenpositionierung, Kampagnenziele und Zielgruppe, um passgenaue Content-Ideen zu entwickeln. Dies dauert 10-30 Sekunden.', en: 'The AI analyzes your brand positioning, campaign goals and audience to develop tailored content ideas. This takes 10-30 seconds.', tr: 'YZ, uygun içerik fikirleri geliştirmek için marka konumlandırmanızı, kampanya hedeflerinizi ve hedef kitlenizi analiz ediyor. Bu 10-30 saniye sürer.' },
  resultsTitle: { de: 'Generierte Content-Ideen', en: 'Generated content ideas', tr: 'Üretilen içerik fikirleri' },
  resultsDesc: { de: 'Klicke auf eine Idee, um alle Details zu sehen. Wähle die Ideen aus, die du übernehmen möchtest.', en: 'Click on an idea to see all details. Select the ideas you want to adopt.', tr: 'Tüm detayları görmek için bir fikre tıklayın. Kabul etmek istediğiniz fikirleri seçin.' },
  selectAll: { de: 'Alle auswählen', en: 'Select all', tr: 'Tümünü seç' },
  deselectAll: { de: 'Alle abwählen', en: 'Deselect all', tr: 'Tümünü kaldır' },
  createSelected: { de: 'Ausgewählte übernehmen', en: 'Adopt selected', tr: 'Seçilenleri kabul et' },
  creating: { de: 'Erstelle Content & Aufgaben...', en: 'Creating content & tasks...', tr: 'İçerik & görevler oluşturuluyor...' },
  mockWarning: { de: 'Demo-Modus: Beispieldaten werden angezeigt, da kein API-Key konfiguriert ist.', en: 'Demo mode: Sample data is shown because no API key is configured.', tr: 'Demo modu: API anahtarı yapılandırılmadığı için örnek veriler gösteriliyor.' },
  errorTitle: { de: 'Fehler bei der Generierung', en: 'Generation error', tr: 'Üretim hatası' },
  selectedCount: { de: 'ausgewählt', en: 'selected', tr: 'seçildi' },
  successTitle: { de: 'Erfolgreich erstellt!', en: 'Successfully created!', tr: 'Başarıyla oluşturuldu!' },
  successDesc: { de: 'Content-Items und verknüpfte Aufgaben wurden in deinem Projekt angelegt.', en: 'Content items and linked tasks have been created in your project.', tr: 'İçerik öğeleri ve bağlantılı görevler projenizde oluşturuldu.' },
  goToContent: { de: 'Zur Content-Übersicht', en: 'Go to content overview', tr: 'İçerik genel bakışına git' },
  generateMore: { de: 'Weitere Ideen generieren', en: 'Generate more ideas', tr: 'Daha fazla fikir üret' },
  allChannels: { de: 'Alle Kanäle (keine Einschränkung)', en: 'All channels (no restriction)', tr: 'Tüm kanallar (kısıtlama yok)' },
  allPhases: { de: 'Alle Phasen (keine Einschränkung)', en: 'All phases (no restriction)', tr: 'Tüm aşamalar (kısıtlama yok)' },
  detailTitle: { de: 'Idee im Detail', en: 'Idea details', tr: 'Fikir detayları' },
  detailPlatform: { de: 'Plattform', en: 'Platform', tr: 'Platform' },
  detailType: { de: 'Content-Typ', en: 'Content type', tr: 'İçerik türü' },
  detailPhase: { de: 'Journey-Phase', en: 'Journey phase', tr: 'Yolculuk aşaması' },
  detailTaskType: { de: 'Aufgabentyp', en: 'Task type', tr: 'Görev türü' },
  detailRationale: { de: 'Strategische Begründung', en: 'Strategic rationale', tr: 'Stratejik gerekçe' },
  detailDescription: { de: 'Beschreibung', en: 'Description', tr: 'Açıklama' },
  detailWhatCreated: { de: 'Was wird erstellt?', en: 'What will be created?', tr: 'Ne oluşturulacak?' },
  detailContentItem: { de: 'Content-Item im Status "Idee"', en: 'Content item in status "Idea"', tr: '"Fikir" durumunda içerik öğesi' },
  detailTask: { de: 'Verknüpfte Aufgabe mit KI-Briefing', en: 'Linked task with AI briefing', tr: 'YZ brifingine sahip bağlantılı görev' },
  leaveTitle: { de: 'Seite verlassen?', en: 'Leave page?', tr: 'Sayfadan ayrıl?' },
  leaveDesc: { de: 'Dein Fortschritt im Content-Ideen Generator geht verloren. Möchtest du die Seite wirklich verlassen?', en: 'Your progress in the content ideas generator will be lost. Do you really want to leave?', tr: 'İçerik fikir oluşturucudaki ilerlemeniz kaybolacak. Sayfadan gerçekten ayrılmak istiyor musunuz?' },
  leaveStay: { de: 'Hier bleiben', en: 'Stay here', tr: 'Burada kal' },
  leaveGo: { de: 'Seite verlassen', en: 'Leave page', tr: 'Sayfadan ayrıl' },
};

export default function ContentIdeaSurveyPage() {
  const router = useRouter();
  const { addContent } = useContents();
  const { addTask, setPromptContext } = useTasks();
  const { campaigns, audiences, touchpoints, positioning, companyKeywords } = useData();
  const { currentUser } = useAuth();
  const { activeCompany } = useCompany();
  const { t } = useLanguage();

  const [step, setStep] = useState<SurveyStep>('context');
  const [campaignId, setCampaignId] = useState('');
  const [audienceId, setAudienceId] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [themeKeywords, setThemeKeywords] = useState('');
  const [ideaCount, setIdeaCount] = useState(7);
  const [outputLanguage, setOutputLanguage] = useState<'de' | 'en' | 'tr'>('de');
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [detailIdea, setDetailIdea] = useState<ContentIdea | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNavTarget, setPendingNavTarget] = useState('');
  const overlayMouseDownRef = useRef(false);

  const selectedCampaign = campaigns.find(c => c.id === campaignId) ?? null;
  const selectedAudience = audiences.find(a => a.id === audienceId) ?? null;
  const selectedIdeasCount = ideas.filter(i => i.selected).length;

  const companyBase = activeCompany ? `/project/${activeCompany.id}` : '';

  const hasProgress = step !== 'context' && step !== 'success';

  const navigateWithGuard = (target: string) => {
    if (hasProgress) {
      setPendingNavTarget(target);
      setShowLeaveConfirm(true);
    } else {
      router.push(target);
    }
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    router.push(pendingNavTarget);
  };

  const toggleChannel = (ch: string) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch],
    );
  };

  const togglePhase = (ph: string) => {
    setSelectedPhases(prev =>
      prev.includes(ph) ? prev.filter(p => p !== ph) : [...prev, ph],
    );
  };

  const toggleIdea = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  const selectAllIdeas = () => setIdeas(prev => prev.map(i => ({ ...i, selected: true })));
  const deselectAllIdeas = () => setIdeas(prev => prev.map(i => ({ ...i, selected: false })));

  const handleGenerate = useCallback(async () => {
    setStep('generating');
    setError(null);

    const promptContext: IdeaPromptContext = {
      positioning,
      companyKeywords,
      campaign: selectedCampaign,
      audience: selectedAudience,
      touchpoints,
      channels: selectedChannels,
      journeyPhases: selectedPhases,
      themeKeywords,
      ideaCount,
      language: outputLanguage,
    };

    const prompt = buildContentIdeaPrompt(promptContext);

    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || `Fehler ${response.status}`);
        setStep('config');
        return;
      }

      const generatedIdeas: ContentIdea[] = (data.ideas || []).map(
        (idea: Record<string, string>, index: number) => ({
          id: `idea-${Date.now()}-${index}`,
          title: idea.title || '',
          description: idea.description || '',
          platform: idea.platform || '',
          contentType: CONTENT_TYPE_MAP[idea.contentType] || idea.contentType || 'social',
          journeyPhase: idea.journeyPhase || 'Awareness',
          taskType: idea.taskType || 'Task',
          rationale: idea.rationale || '',
          selected: true,
        }),
      );

      setIdeas(generatedIdeas);
      setIsMock(data.isMock === true);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStep('config');
    }
  }, [positioning, companyKeywords, selectedCampaign, selectedAudience, touchpoints, selectedChannels, selectedPhases, themeKeywords, ideaCount, outputLanguage]);

  const handleCreateSelected = useCallback(async () => {
    const selected = ideas.filter(i => i.selected);
    if (selected.length === 0) return;

    setIsCreating(true);
    let created = 0;

    if (positioning) {
      setPromptContext({
        positioning,
        companyKeywords,
        campaign: selectedCampaign,
        audience: selectedAudience,
      });
    }

    for (const idea of selected) {
      try {
        await addContent({
          title: idea.title,
          description: idea.description,
          publishDate: null,
          platform: idea.platform,
          campaignId: campaignId || null,
          contentType: idea.contentType,
          touchpointId: null,
          journeyPhase: idea.journeyPhase,
          taskIds: [],
          author: currentUser?.name || 'Unbekannt',
          status: 'idea' as ContentStatus,
        });

        await addTask({
          title: `${idea.taskType}: ${idea.title}`,
          status: 'draft' as TaskStatus,
          assignee: '',
          author: currentUser?.name || 'Unbekannt',
          dueDate: '',
          publishDate: null as string | null,
          platform: idea.platform || null,
          type: idea.taskType,
          oneDriveLink: '',
          description: idea.description,
          campaignId: campaignId || null,
          touchpointId: null as string | null,
          scope: 'single',
        });

        created++;
      } catch (err) {
        console.error(`Failed to create content for idea: ${idea.title}`, err);
      }
    }

    setCreatedCount(created);
    setIsCreating(false);
    setStep('success');
  }, [ideas, addContent, addTask, campaignId, currentUser, positioning, companyKeywords, selectedCampaign, selectedAudience, setPromptContext]);

  // ─── Step Indicator ──────────────────────────────────────

  const STEPS: { key: SurveyStep; label: { de: string; en: string; tr: string }; icon: typeof Megaphone }[] = [
    { key: 'context', label: { de: 'Kontext', en: 'Context', tr: 'Bağlam' }, icon: Target },
    { key: 'channels', label: { de: 'Kanäle', en: 'Channels', tr: 'Kanallar' }, icon: Radio },
    { key: 'config', label: { de: 'Konfiguration', en: 'Configuration', tr: 'Yapılandırma' }, icon: Zap },
    { key: 'results', label: { de: 'Ergebnisse', en: 'Results', tr: 'Sonuçlar' }, icon: Sparkles },
  ];

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigateWithGuard(`${companyBase}/content-overview`)}
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> {t(L.backToOverview)}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
          }}>
            <Wand2 size={28} color="white" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>{t(L.pageTitle)}</h1>
            <p className="page-subtitle">{t(L.pageSubtitle)}</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {step !== 'generating' && step !== 'success' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '32px', padding: '16px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
        }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : isDone ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? '#10b981' : isActive ? 'var(--color-primary)' : 'var(--bg-hover)',
                    color: isDone || isActive ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s',
                  }}>
                    {isDone ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span style={{
                    fontSize: 'var(--font-size-sm)', fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-primary)' : isDone ? '#10b981' : 'var(--text-secondary)',
                  }}>
                    {t(s.label)}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: '2px', minWidth: '16px',
                    background: isDone ? '#10b981' : 'var(--border-color)',
                    borderRadius: '1px', transition: 'background 0.3s',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Survey Content */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)', overflow: 'hidden',
      }}>
        <div style={{ padding: '32px' }}>
          {/* Step 1: Context */}
          {step === 'context' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>{t(L.step1Title)}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '600px' }}>{t(L.step1Desc)}</p>

              <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Megaphone size={16} color="var(--color-primary)" /> {t(L.campaign)}
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t(L.campaignHint)}</p>
                  <select className="form-select" value={campaignId} onChange={e => setCampaignId(e.target.value)}>
                    <option value="">{t(L.noCampaign)}</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                    ))}
                  </select>
                  {selectedCampaign && (
                    <div style={{
                      marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>{selectedCampaign.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{selectedCampaign.description}</div>
                      {selectedCampaign.channels?.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {selectedCampaign.channels.map(ch => (
                            <span key={ch} className="badge" style={{ fontSize: '0.65rem' }}>{ch}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users2 size={16} color="var(--color-primary)" /> {t(L.audience)}
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t(L.audienceHint)}</p>
                  <select className="form-select" value={audienceId} onChange={e => setAudienceId(e.target.value)}>
                    <option value="">{t(L.noAudience)}</option>
                    {audiences.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.segment})</option>
                    ))}
                  </select>
                  {selectedAudience && (
                    <div style={{
                      marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>{selectedAudience.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {selectedAudience.segment} | {selectedAudience.age} | {selectedAudience.location}
                      </div>
                      {selectedAudience.painPoints?.length > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          Pain Points: {selectedAudience.painPoints.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Channels */}
          {step === 'channels' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>{t(L.step2Title)}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '600px' }}>{t(L.step2Desc)}</p>

              <div style={{ display: 'grid', gap: '28px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Radio size={16} color="var(--color-primary)" /> {t(L.channels)}
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{t(L.channelsHint)}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PLATFORM_OPTIONS.map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                          border: selectedChannels.includes(ch) ? '2px solid var(--color-primary)' : '2px solid var(--border-color)',
                          background: selectedChannels.includes(ch) ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                          color: selectedChannels.includes(ch) ? 'var(--color-primary)' : 'var(--text-primary)',
                          fontWeight: selectedChannels.includes(ch) ? 600 : 400,
                          fontSize: 'var(--font-size-sm)', transition: 'all 0.15s',
                        }}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                  {selectedChannels.length === 0 && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '8px', fontStyle: 'italic' }}>{t(L.allChannels)}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={16} color="var(--color-primary)" /> {t(L.journeyPhases)}
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{t(L.journeyHint)}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {JOURNEY_PHASES.map(ph => (
                      <button
                        key={ph}
                        type="button"
                        onClick={() => togglePhase(ph)}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                          border: selectedPhases.includes(ph) ? `2px solid ${JOURNEY_PHASE_COLORS[ph]}` : '2px solid var(--border-color)',
                          background: selectedPhases.includes(ph) ? `${JOURNEY_PHASE_COLORS[ph]}15` : 'var(--bg-card)',
                          color: selectedPhases.includes(ph) ? JOURNEY_PHASE_COLORS[ph] : 'var(--text-primary)',
                          fontWeight: selectedPhases.includes(ph) ? 600 : 400,
                          fontSize: 'var(--font-size-sm)', transition: 'all 0.15s',
                        }}
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                  {selectedPhases.length === 0 && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '8px', fontStyle: 'italic' }}>{t(L.allPhases)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Config */}
          {step === 'config' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>{t(L.step3Title)}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '600px' }}>{t(L.step3Desc)}</p>

              <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
                <div className="form-group">
                  <label className="form-label">{t(L.themeKeywords)}</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t(L.themeKeywordsHint)}</p>
                  <textarea
                    className="form-input"
                    value={themeKeywords}
                    onChange={e => setThemeKeywords(e.target.value)}
                    placeholder={t(L.themeKeywordsPlaceholder)}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">{t(L.ideaCount)}</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t(L.ideaCountHint)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="range" min={3} max={15} value={ideaCount}
                        onChange={e => setIdeaCount(parseInt(e.target.value, 10))}
                        style={{ flex: 1 }}
                      />
                      <span style={{
                        fontSize: '1.25rem', fontWeight: 700, minWidth: '36px', textAlign: 'center',
                        color: 'var(--color-primary)', background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 'var(--radius-sm)', padding: '4px 8px',
                      }}>
                        {ideaCount}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t(L.outputLanguage)}</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>&nbsp;</p>
                    <select
                      className="form-select"
                      value={outputLanguage}
                      onChange={e => setOutputLanguage(e.target.value as 'de' | 'en' | 'tr')}
                    >
                      <option value="de">{t(L.german)}</option>
                      <option value="en">{t(L.english)}</option>
                      <option value="tr">{t(L.turkish)}</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '14px', borderRadius: 'var(--radius-md)', marginTop: '20px',
                  background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-size-sm)',
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div><strong>{t(L.errorTitle)}:</strong> {error}</div>
                </div>
              )}
            </div>
          )}

          {/* Generating */}
          {step === 'generating' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', marginBottom: '28px',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              }}>
                <Loader2 size={40} color="white" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px' }}>{t(L.generating)}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>{t(L.generatingDesc)}</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Results */}
          {step === 'results' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                  {t(L.resultsTitle)} ({ideas.length})
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={selectAllIdeas}>{t(L.selectAll)}</button>
                  <button className="btn btn-ghost btn-sm" onClick={deselectAllIdeas}>{t(L.deselectAll)}</button>
                </div>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '20px' }}>{t(L.resultsDesc)}</p>

              {isMock && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
                  background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <AlertCircle size={16} />
                  {t(L.mockWarning)}
                </div>
              )}

              <div style={{ display: 'grid', gap: '12px' }}>
                {ideas.map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => setDetailIdea(idea)}
                    style={{
                      padding: '18px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      border: `2px solid ${idea.selected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      background: idea.selected ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-card)',
                      transition: 'all 0.15s', position: 'relative',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      {/* Checkbox */}
                      <div
                        onClick={e => toggleIdea(idea.id, e)}
                        style={{
                          width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', flexShrink: 0, marginTop: '2px',
                          border: `2px solid ${idea.selected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                          background: idea.selected ? 'var(--color-primary)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                          cursor: 'pointer',
                        }}
                      >
                        {idea.selected && <Check size={14} color="white" />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', margin: 0 }}>{idea.title}</h3>
                          <Eye size={14} color="var(--text-tertiary)" />
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                          {idea.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600,
                            background: CONTENT_TYPE_COLORS[idea.contentType] || '#6366f1', color: 'white',
                          }}>
                            {t(CONTENT_TYPE_LABELS[idea.contentType] || { de: idea.contentType, en: idea.contentType, tr: idea.contentType })}
                          </span>
                          <span style={{
                            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 500,
                            background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                          }}>
                            {idea.platform}
                          </span>
                          <span style={{
                            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 500,
                            background: `${JOURNEY_PHASE_COLORS[idea.journeyPhase] || '#6366f1'}15`,
                            color: JOURNEY_PHASE_COLORS[idea.journeyPhase] || '#6366f1',
                            border: `1px solid ${JOURNEY_PHASE_COLORS[idea.journeyPhase] || '#6366f1'}30`,
                          }}>
                            {idea.journeyPhase}
                          </span>
                          <span style={{
                            padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 500,
                            background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                          }}>
                            {idea.taskType}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.4 }}>
                          {idea.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#10b981', marginBottom: '28px', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              }}>
                <Check size={40} color="white" />
              </div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px' }}>{t(L.successTitle)}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px', marginBottom: '8px' }}>
                {t(L.successDesc)}
              </p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: '#10b981', marginBottom: '28px' }}>
                {createdCount} Content-Items + {createdCount} Tasks
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => router.push(`${companyBase}/content-overview`)}>
                  <FileText size={16} /> {t(L.goToContent)}
                </button>
                <button className="btn btn-secondary" onClick={() => { setStep('context'); setIdeas([]); setCreatedCount(0); }}>
                  <Sparkles size={16} /> {t(L.generateMore)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step !== 'generating' && step !== 'success' && (
          <div style={{
            padding: '18px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-elevated)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              {step !== 'context' && step !== 'results' && (
                <button className="btn btn-ghost" onClick={() => {
                  if (step === 'channels') setStep('context');
                  if (step === 'config') setStep('channels');
                }}>
                  <ChevronLeft size={16} /> {t(L.back)}
                </button>
              )}
              {step === 'results' && (
                <button className="btn btn-ghost" onClick={() => setStep('config')}>
                  <ChevronLeft size={16} /> {t(L.back)}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {step === 'results' && (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginRight: '8px' }}>
                  {selectedIdeasCount} / {ideas.length} {t(L.selectedCount)}
                </span>
              )}
              {step === 'context' && (
                <button className="btn btn-primary" onClick={() => setStep('channels')}>
                  {t(L.next)} <ChevronRight size={16} />
                </button>
              )}
              {step === 'channels' && (
                <button className="btn btn-primary" onClick={() => setStep('config')}>
                  {t(L.next)} <ChevronRight size={16} />
                </button>
              )}
              {step === 'config' && (
                <button className="btn btn-primary" onClick={handleGenerate} disabled={ideaCount < 3 || ideaCount > 15}>
                  <Sparkles size={16} /> {t(L.generate)}
                </button>
              )}
              {step === 'results' && (
                <button className="btn btn-primary" onClick={handleCreateSelected} disabled={selectedIdeasCount === 0 || isCreating}>
                  {isCreating ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t(L.creating)}</>
                  ) : (
                    <><Check size={16} /> {t(L.createSelected)} ({selectedIdeasCount})</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailIdea && (
        <div
          className="modal-overlay"
          onMouseDown={e => { overlayMouseDownRef.current = e.target === e.currentTarget; }}
          onClick={e => {
            if (e.target === e.currentTarget && overlayMouseDownRef.current) {
              setDetailIdea(null);
            }
            overlayMouseDownRef.current = false;
          }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div
            className="modal animate-in"
            onClick={e => e.stopPropagation()}
            style={{
              margin: 0, maxHeight: '90vh', width: '100%', maxWidth: '750px',
              borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-color-strong)',
              boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* HEADER */}
            <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                {t(L.detailTitle)}
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDetailIdea(null)}><X size={20} /></button>
            </div>

            {/* BODY */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
              {/* Title + Tags + Description */}
              <div className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${CONTENT_TYPE_COLORS[detailIdea.contentType] || '#6366f1'}` }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px' }}>{detailIdea.title}</h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: `${CONTENT_TYPE_COLORS[detailIdea.contentType] || '#6366f1'}18`, color: CONTENT_TYPE_COLORS[detailIdea.contentType] || '#6366f1', border: `1px solid ${CONTENT_TYPE_COLORS[detailIdea.contentType] || '#6366f1'}33` }}>
                    {t(CONTENT_TYPE_LABELS[detailIdea.contentType] || { de: detailIdea.contentType, en: detailIdea.contentType, tr: detailIdea.contentType })}
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-hover)' }}>{detailIdea.platform}</span>
                  <span className="badge" style={{ background: `${JOURNEY_PHASE_COLORS[detailIdea.journeyPhase] || '#6366f1'}18`, color: JOURNEY_PHASE_COLORS[detailIdea.journeyPhase] || '#6366f1', border: `1px solid ${JOURNEY_PHASE_COLORS[detailIdea.journeyPhase] || '#6366f1'}33` }}>
                    {detailIdea.journeyPhase}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{detailIdea.description}</p>
              </div>

              {/* Metadata */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '14px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t({ de: 'Metadaten', en: 'Metadata', tr: 'Meta Veriler' })}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', fontSize: 'var(--font-size-sm)', alignItems: 'center' }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>{t(L.detailPlatform)}:</div>
                  <div style={{ fontWeight: 500 }}>{detailIdea.platform}</div>

                  <div style={{ color: 'var(--text-tertiary)' }}>{t(L.detailType)}:</div>
                  <div style={{ fontWeight: 500 }}>{t(CONTENT_TYPE_LABELS[detailIdea.contentType] || { de: detailIdea.contentType, en: detailIdea.contentType, tr: detailIdea.contentType })}</div>

                  <div style={{ color: 'var(--text-tertiary)' }}>{t(L.detailPhase)}:</div>
                  <div style={{ fontWeight: 500, color: JOURNEY_PHASE_COLORS[detailIdea.journeyPhase] }}>{detailIdea.journeyPhase}</div>

                  <div style={{ color: 'var(--text-tertiary)' }}>{t(L.detailTaskType)}:</div>
                  <div style={{ fontWeight: 500 }}>{detailIdea.taskType}</div>
                </div>
              </div>

              {/* Strategic Rationale */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '14px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t(L.detailRationale)}
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--text-primary)', fontStyle: 'italic' }}>{detailIdea.rationale}</p>
              </div>

              {/* What gets created */}
              <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '14px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t(L.detailWhatCreated)}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
                    <FileText size={16} color="var(--color-primary)" />
                    <span>{t(L.detailContentItem)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
                    <Calendar size={16} color="var(--color-primary)" />
                    <span>{t(L.detailTask)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                className={`btn ${detailIdea.selected ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => {
                  setIdeas(prev => prev.map(i => i.id === detailIdea.id ? { ...i, selected: !i.selected } : i));
                  setDetailIdea({ ...detailIdea, selected: !detailIdea.selected });
                }}
              >
                <Check size={16} />
                {detailIdea.selected
                  ? t({ de: 'Abwählen', en: 'Deselect', tr: 'Seçimi kaldır' })
                  : t({ de: 'Auswählen', en: 'Select', tr: 'Seç' })
                }
              </button>
              <button className="btn btn-ghost" onClick={() => setDetailIdea(null)}>
                {t({ de: 'Schließen', en: 'Close', tr: 'Kapat' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowLeaveConfirm(false); }}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal animate-in"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px', margin: 0 }}
          >
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(245, 158, 11, 0.12)', border: '2px solid rgba(245, 158, 11, 0.25)',
              }}>
                <ShieldAlert size={28} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '10px' }}>{t(L.leaveTitle)}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0' }}>{t(L.leaveDesc)}</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-primary" onClick={() => setShowLeaveConfirm(false)}>
                {t(L.leaveStay)}
              </button>
              <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={confirmLeave}>
                {t(L.leaveGo)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

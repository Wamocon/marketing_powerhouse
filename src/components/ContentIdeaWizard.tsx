import { useState, useCallback } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft, Check, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { useContents } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { buildContentIdeaPrompt } from '../lib/contentIdeaPromptBuilder';
import type { ContentIdea, ContentStatus, TaskStatus } from '../types';
import type { IdeaPromptContext } from '../lib/contentIdeaPromptBuilder';

interface ContentIdeaWizardProps {
  onClose: () => void;
}

type WizardStep = 'context' | 'channels' | 'config' | 'generating' | 'results';

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

const LABELS = {
  title: { de: 'KI Content-Ideen Generator', en: 'AI Content Ideas Generator', tr: 'YZ İçerik Fikir Üreteci' },
  step1Title: { de: 'Kontext wählen', en: 'Choose context', tr: 'Bağlam seçin' },
  step1Desc: { de: 'Wähle die Kampagne und Zielgruppe, für die Content-Ideen generiert werden sollen.', en: 'Select the campaign and audience for content idea generation.', tr: 'İçerik fikirleri üretilecek kampanyayı ve hedef kitleyi seçin.' },
  campaign: { de: 'Kampagne', en: 'Campaign', tr: 'Kampanya' },
  campaignPlaceholder: { de: 'Kampagne wählen...', en: 'Select campaign...', tr: 'Kampanya seçin...' },
  audience: { de: 'Zielgruppe', en: 'Audience', tr: 'Hedef Kitle' },
  audiencePlaceholder: { de: 'Zielgruppe wählen...', en: 'Select audience...', tr: 'Hedef kitle seçin...' },
  step2Title: { de: 'Kanäle & Journey', en: 'Channels & journey', tr: 'Kanallar & yolculuk' },
  step2Desc: { de: 'Wähle die gewünschten Kanäle und Customer-Journey-Phasen.', en: 'Select desired channels and customer journey phases.', tr: 'İstenen kanalları ve müşteri yolculuğu aşamalarını seçin.' },
  channels: { de: 'Kanäle', en: 'Channels', tr: 'Kanallar' },
  journeyPhases: { de: 'Journey-Phasen', en: 'Journey phases', tr: 'Yolculuk aşamaları' },
  step3Title: { de: 'Themen & Einstellungen', en: 'Topics & settings', tr: 'Konular & ayarlar' },
  step3Desc: { de: 'Gib optionale Themen-Keywords an und konfiguriere die Ausgabe.', en: 'Provide optional topic keywords and configure the output.', tr: 'İsteğe bağlı konu anahtar kelimeleri girin ve çıktıyı yapılandırın.' },
  themeKeywords: { de: 'Themen-Keywords (optional)', en: 'Topic keywords (optional)', tr: 'Konu anahtar kelimeleri (isteğe bağlı)' },
  themeKeywordsPlaceholder: { de: 'z.B. Nachhaltigkeit, KI-Trends, Digitalisierung...', en: 'e.g. sustainability, AI trends, digitalization...', tr: 'ör. sürdürülebilirlik, YZ trendleri, dijitalleşme...' },
  ideaCount: { de: 'Anzahl Ideen', en: 'Number of ideas', tr: 'Fikir sayısı' },
  outputLanguage: { de: 'Ausgabesprache', en: 'Output language', tr: 'Çıktı dili' },
  german: { de: 'Deutsch', en: 'German', tr: 'Almanca' },
  english: { de: 'Englisch', en: 'English', tr: 'İngilizce' },
  turkish: { de: 'Türkisch', en: 'Turkish', tr: 'Türkçe' },
  next: { de: 'Weiter', en: 'Next', tr: 'İleri' },
  back: { de: 'Zurück', en: 'Back', tr: 'Geri' },
  generate: { de: 'Ideen generieren', en: 'Generate ideas', tr: 'Fikir üret' },
  generating: { de: 'KI generiert Content-Ideen...', en: 'AI is generating content ideas...', tr: 'YZ içerik fikirleri üretiyor...' },
  generatingDesc: { de: 'Dies kann 10-30 Sekunden dauern.', en: 'This may take 10-30 seconds.', tr: 'Bu 10-30 saniye sürebilir.' },
  resultsTitle: { de: 'Generierte Content-Ideen', en: 'Generated content ideas', tr: 'Üretilen içerik fikirleri' },
  selectAll: { de: 'Alle auswählen', en: 'Select all', tr: 'Tümünü seç' },
  deselectAll: { de: 'Alle abwählen', en: 'Deselect all', tr: 'Tümünü kaldır' },
  createSelected: { de: 'Ausgewählte erstellen', en: 'Create selected', tr: 'Seçilenleri oluştur' },
  creating: { de: 'Erstelle...', en: 'Creating...', tr: 'Oluşturuluyor...' },
  mockWarning: { de: 'Beispieldaten (kein API-Key konfiguriert)', en: 'Sample data (no API key configured)', tr: 'Örnek veriler (API anahtarı yapılandırılmadı)' },
  errorTitle: { de: 'Fehler bei der Generierung', en: 'Generation error', tr: 'Üretim hatası' },
  retry: { de: 'Erneut versuchen', en: 'Retry', tr: 'Tekrar dene' },
  noCampaign: { de: '(Ohne Kampagne)', en: '(No campaign)', tr: '(Kampanyasız)' },
  selectedCount: { de: 'ausgewählt', en: 'selected', tr: 'seçildi' },
  successTitle: { de: 'Erfolgreich erstellt!', en: 'Successfully created!', tr: 'Başarıyla oluşturuldu!' },
  successDesc: { de: 'Content-Items und Aufgaben wurden angelegt. Die KI-Generierung der Task-Inhalte wurde gestartet.', en: 'Content items and tasks have been created. AI generation of task content has been started.', tr: 'İçerik öğeleri ve görevler oluşturuldu. Görev içeriklerinin YZ üretimi başlatıldı.' },
  close: { de: 'Schließen', en: 'Close', tr: 'Kapat' },
  allChannels: { de: 'Alle Kanäle', en: 'All channels', tr: 'Tüm kanallar' },
  allPhases: { de: 'Alle Phasen', en: 'All phases', tr: 'Tüm aşamalar' },
};

export default function ContentIdeaWizard({ onClose }: ContentIdeaWizardProps) {
  const { addContent } = useContents();
  const { addTask, executeAiAgent, setPromptContext } = useTasks();
  const { campaigns, audiences, touchpoints, positioning, companyKeywords } = useData();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<WizardStep>('context');
  const [campaignId, setCampaignId] = useState('');
  const [audienceId, setAudienceId] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [themeKeywords, setThemeKeywords] = useState('');
  const [ideaCount, setIdeaCount] = useState(5);
  const [outputLanguage, setOutputLanguage] = useState<'de' | 'en' | 'tr'>('de');
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  const selectedCampaign = campaigns.find(c => c.id === campaignId) ?? null;
  const selectedAudience = audiences.find(a => a.id === audienceId) ?? null;
  const selectedIdeasCount = ideas.filter(i => i.selected).length;

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

  const toggleIdea = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  const selectAllIdeas = () => {
    setIdeas(prev => prev.map(i => ({ ...i, selected: true })));
  };

  const deselectAllIdeas = () => {
    setIdeas(prev => prev.map(i => ({ ...i, selected: false })));
  };

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

    // Set prompt context for AI task generation
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
        // 1. Create Content Item
        const contentId = await addContent({
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

        // 2. Create linked Task
        if (contentId) {
          const taskData = {
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
          };

          await addTask(taskData);

          // 3. Trigger AI generation for the task (non-blocking)
          // The task will be in the list after addTask, so we trigger AI on the next cycle
        }

        created++;
      } catch (err) {
        console.error(`Failed to create content for idea: ${idea.title}`, err);
      }
    }

    setCreatedCount(created);
    setIsCreating(false);
    setStep('context'); // Reset to show success
    onClose();
  }, [ideas, addContent, addTask, campaignId, currentUser, positioning, companyKeywords, selectedCampaign, selectedAudience, setPromptContext, onClose]);

  const canProceedFromContext = true; // Campaign and audience are optional
  const canProceedFromChannels = true; // All channels selected by default
  const canProceedFromConfig = ideaCount >= 3 && ideaCount <= 15;

  const renderStepIndicator = () => {
    const steps: { key: WizardStep; label: Record<string, string> }[] = [
      { key: 'context', label: { de: 'Kontext', en: 'Context', tr: 'Bağlam' } },
      { key: 'channels', label: { de: 'Kanäle', en: 'Channels', tr: 'Kanallar' } },
      { key: 'config', label: { de: 'Einstellungen', en: 'Settings', tr: 'Ayarlar' } },
      { key: 'results', label: { de: 'Ergebnisse', en: 'Results', tr: 'Sonuçlar' } },
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 600,
              background: i <= currentIndex ? 'var(--color-primary)' : 'var(--bg-hover)',
              color: i <= currentIndex ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
              {i < currentIndex ? <Check size={14} /> : i + 1}
            </div>
            <span style={{
              fontSize: 'var(--font-size-sm)',
              color: i <= currentIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: i === currentIndex ? 600 : 400,
            }}>
              {t(s.label as { de: string; en: string; tr: string })}
            </span>
            {i < steps.length - 1 && (
              <div style={{
                width: '24px', height: '1px',
                background: i < currentIndex ? 'var(--color-primary)' : 'var(--border-color)',
              }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContextStep = () => (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>{t(LABELS.step1Title)}</h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '20px' }}>{t(LABELS.step1Desc)}</p>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">{t(LABELS.campaign)}</label>
        <select className="form-select" value={campaignId} onChange={e => setCampaignId(e.target.value)}>
          <option value="">{t(LABELS.noCampaign)}</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">{t(LABELS.audience)}</label>
        <select className="form-select" value={audienceId} onChange={e => setAudienceId(e.target.value)}>
          <option value="">{t(LABELS.audiencePlaceholder)}</option>
          {audiences.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.segment})</option>
          ))}
        </select>
      </div>

      {selectedCampaign && (
        <div style={{
          padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-hover)',
          border: '1px solid var(--border-color)', fontSize: 'var(--font-size-sm)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{selectedCampaign.name}</div>
          <div style={{ color: 'var(--text-secondary)' }}>{selectedCampaign.description}</div>
          {selectedCampaign.channels?.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {selectedCampaign.channels.map(ch => (
                <span key={ch} className="badge" style={{ fontSize: '0.65rem' }}>{ch}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderChannelsStep = () => (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>{t(LABELS.step2Title)}</h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '20px' }}>{t(LABELS.step2Desc)}</p>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label">{t(LABELS.channels)}</label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {selectedChannels.length === 0 ? t(LABELS.allChannels) : `${selectedChannels.length} ${t(LABELS.selectedCount)}`}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PLATFORM_OPTIONS.map(ch => (
            <button
              key={ch}
              type="button"
              className={`btn btn-sm ${selectedChannels.includes(ch) ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => toggleChannel(ch)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t(LABELS.journeyPhases)}</label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {selectedPhases.length === 0 ? t(LABELS.allPhases) : `${selectedPhases.length} ${t(LABELS.selectedCount)}`}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {JOURNEY_PHASES.map(ph => (
            <button
              key={ph}
              type="button"
              className={`btn btn-sm ${selectedPhases.includes(ph) ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => togglePhase(ph)}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {ph}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConfigStep = () => (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>{t(LABELS.step3Title)}</h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '20px' }}>{t(LABELS.step3Desc)}</p>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">{t(LABELS.themeKeywords)}</label>
        <input
          type="text"
          className="form-input"
          value={themeKeywords}
          onChange={e => setThemeKeywords(e.target.value)}
          placeholder={t(LABELS.themeKeywordsPlaceholder)}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">{t(LABELS.ideaCount)}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="range"
              min={3}
              max={15}
              value={ideaCount}
              onChange={e => setIdeaCount(parseInt(e.target.value, 10))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, minWidth: '30px', textAlign: 'center', color: 'var(--color-primary)' }}>
              {ideaCount}
            </span>
          </div>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">{t(LABELS.outputLanguage)}</label>
          <select
            className="form-select"
            value={outputLanguage}
            onChange={e => setOutputLanguage(e.target.value as 'de' | 'en' | 'tr')}
          >
            <option value="de">{t(LABELS.german)}</option>
            <option value="en">{t(LABELS.english)}</option>
            <option value="tr">{t(LABELS.turkish)}</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)',
        }}>
          <AlertCircle size={16} />
          <div>
            <strong>{t(LABELS.errorTitle)}:</strong> {error}
          </div>
        </div>
      )}
    </div>
  );

  const renderGeneratingStep = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', marginBottom: '24px',
      }}>
        <Loader2 size={32} color="white" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '8px' }}>{t(LABELS.generating)}</h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{t(LABELS.generatingDesc)}</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const CONTENT_TYPE_COLORS: Record<string, string> = {
    social: '#6366f1',
    email: '#f59e0b',
    ads: '#ef4444',
    content: '#10b981',
    event: '#8b5cf6',
  };

  const renderResultsStep = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
          {t(LABELS.resultsTitle)} ({ideas.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={selectAllIdeas}>{t(LABELS.selectAll)}</button>
          <button className="btn btn-ghost btn-sm" onClick={deselectAllIdeas}>{t(LABELS.deselectAll)}</button>
        </div>
      </div>

      {isMock && (
        <div style={{
          padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px',
          background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
          color: '#f59e0b', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertCircle size={14} />
          {t(LABELS.mockWarning)}
        </div>
      )}

      <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ideas.map(idea => (
          <div
            key={idea.id}
            onClick={() => toggleIdea(idea.id)}
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              border: `2px solid ${idea.selected ? 'var(--color-primary)' : 'var(--border-color)'}`,
              background: idea.selected ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-card)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: 'var(--radius-sm)', flexShrink: 0, marginTop: '2px',
                border: `2px solid ${idea.selected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                background: idea.selected ? 'var(--color-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}>
                {idea.selected && <Check size={14} color="white" />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{idea.title}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {idea.description}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge" style={{ background: CONTENT_TYPE_COLORS[idea.contentType] || '#6366f1', color: 'white', fontSize: '0.6rem' }}>
                    {idea.contentType}
                  </span>
                  <span className="badge" style={{ fontSize: '0.6rem' }}>{idea.platform}</span>
                  <span className="badge" style={{ fontSize: '0.6rem' }}>{idea.journeyPhase}</span>
                  <span className="badge" style={{ fontSize: '0.6rem', background: 'var(--bg-hover)' }}>{idea.taskType}</span>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '6px', fontStyle: 'italic' }}>
                  {idea.rationale}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
            }}>
              <Wand2 size={20} color="white" />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{t(LABELS.title)}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {step !== 'generating' && renderStepIndicator()}
          {step === 'context' && renderContextStep()}
          {step === 'channels' && renderChannelsStep()}
          {step === 'config' && renderConfigStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'results' && renderResultsStep()}
        </div>

        {/* Footer */}
        {step !== 'generating' && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              {step !== 'context' && step !== 'results' && (
                <button className="btn btn-ghost" onClick={() => {
                  if (step === 'channels') setStep('context');
                  if (step === 'config') setStep('channels');
                }}>
                  <ChevronLeft size={16} /> {t(LABELS.back)}
                </button>
              )}
              {step === 'results' && (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {selectedIdeasCount} / {ideas.length} {t(LABELS.selectedCount)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {step === 'context' && (
                <button className="btn btn-primary" onClick={() => setStep('channels')} disabled={!canProceedFromContext}>
                  {t(LABELS.next)} <ChevronRight size={16} />
                </button>
              )}
              {step === 'channels' && (
                <button className="btn btn-primary" onClick={() => setStep('config')} disabled={!canProceedFromChannels}>
                  {t(LABELS.next)} <ChevronRight size={16} />
                </button>
              )}
              {step === 'config' && (
                <button className="btn btn-primary" onClick={handleGenerate} disabled={!canProceedFromConfig}>
                  <Sparkles size={16} /> {t(LABELS.generate)}
                </button>
              )}
              {step === 'results' && (
                <button
                  className="btn btn-primary"
                  onClick={handleCreateSelected}
                  disabled={selectedIdeasCount === 0 || isCreating}
                >
                  {isCreating ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t(LABELS.creating)}</>
                  ) : (
                    <><Check size={16} /> {t(LABELS.createSelected)} ({selectedIdeasCount})</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

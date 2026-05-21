import { useEffect, useState } from 'react';
import { useProjectRouter } from '../hooks/useProjectRouter';
import type { ContentItem, Touchpoint } from '../types';
import { Share2, Plus, TrendingUp, Map, Heart, Frown, Megaphone, Search, DollarSign, Store, ExternalLink, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useContents } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PageHelp from '../components/PageHelp';
import ContentDetailModal from '../components/ContentDetailModal';
import TouchpointDetailModal from '../components/TouchpointDetailModal';
import { createCustomerJourneyPlaceholder } from '../lib/projectSetup';

const PHASE_COLORS = {
    Awareness: { bg: '#e0e7ff', border: '#818cf8', icon: <Megaphone size={16} /> },
    Consideration: { bg: '#fef3c7', border: '#fbbf24', icon: <Search size={16} /> },
    Purchase: { bg: '#dcfce7', border: '#34d399', icon: <DollarSign size={16} /> },
    Retention: { bg: '#f3e8ff', border: '#c084fc', icon: <Heart size={16} /> },
    Advocacy: { bg: '#ffedd5', border: '#fdba74', icon: <Share2 size={16} /> },
};

export default function CustomerJourneyPage() {
    const router = useProjectRouter();
    const { can } = useAuth();
    const { t } = useLanguage();
    const canEdit = can('canEditPositioning');
    const { customerJourneys, audiences, touchpoints, addJourney } = useData();
    const { contents: allContent } = useContents();

    const [selectedJourneyId, setSelectedJourneyId] = useState('');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [selectedTouchpoint, setSelectedTouchpoint] = useState<Touchpoint | null>(null);
    const [showNewJourney, setShowNewJourney] = useState(false);
    const [newJourneyName, setNewJourneyName] = useState('');
    const [newJourneyAudience, setNewJourneyAudience] = useState('');
    const [newJourneyDesc, setNewJourneyDesc] = useState('');

    useEffect(() => {
        if (customerJourneys.length === 0) {
            setSelectedJourneyId('');
            return;
        }

        const hasSelectedJourney = customerJourneys.some(journey => journey.id === selectedJourneyId);
        if (!hasSelectedJourney) {
            setSelectedJourneyId(customerJourneys[0].id);
        }
    }, [customerJourneys, selectedJourneyId]);

    const selectedJourney = customerJourneys.find(journey => journey.id === selectedJourneyId);
    const hasRealJourney = Boolean(selectedJourney);
    const placeholderAudience = audiences[0] ?? null;
    const displayedJourney = selectedJourney ?? createCustomerJourneyPlaceholder(placeholderAudience);
    const audience = audiences.find(item => item.id === displayedJourney.audienceId) ?? placeholderAudience;

    const resolveTouchpoint = (tpId: string) => {
        return touchpoints.find(touchpoint => touchpoint.id === tpId);
    };

    const resolveContent = (cntId: string) => {
        return allContent.find(content => content.id === cntId);
    };

    const touchpointHasPhase = (touchpoint: Touchpoint, phase: string) => {
        const phases = touchpoint.journeyPhases?.length
            ? touchpoint.journeyPhases
            : (touchpoint.journeyPhase ? [touchpoint.journeyPhase] : []);
        return phases.includes(phase);
    };

    const handleCreateJourney = async () => {
        if (!newJourneyName.trim()) return;
        const created = await addJourney({
            name: newJourneyName,
            audienceId: newJourneyAudience || audiences[0]?.id || '',
            description: newJourneyDesc,
            stages: Object.keys(PHASE_COLORS).map(phase => ({
                id: crypto.randomUUID(),
                phase,
                title: phase,
                description: '',
                touchpoints: [],
                contentFormats: [],
                emotions: [],
                painPoints: [],
                metrics: { label: '', value: '', trend: '' },
                contentIds: [],
            })),
        });
        setSelectedJourneyId(created.id);
        setShowNewJourney(false);
        setNewJourneyName('');
        setNewJourneyAudience('');
        setNewJourneyDesc('');
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">{t({ de: 'Customer Journey Map', en: 'Customer Journey Map', tr: 'Müşteri Yolculuğu Haritası' })}</h1>
                    <p className="page-subtitle">{t({ de: 'Standard 5-Phasen Modell', en: 'Standard 5-Phase Model', tr: 'Standart 5 Aşamalı Model' })}</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={t({ de: 'Customer Journey (5 Phasen)', en: 'Customer Journey (5 Phases)', tr: 'Müşteri Yolculuğu (5 Aşama)' })}>
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Die Customer Journey verbindet deine Zielgruppen mit relevantem Content über den gesamten Lebenszyklus des Kunden hinweg.', en: 'The customer journey connects your audiences with relevant content across the entire customer lifecycle.', tr: 'Müşteri yolculuğu hedef kitlelerinizi müşteri yaşam döngüsü boyunca ilgili içerikle birleştirir.' })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'Phasen:', en: 'Phases:', tr: 'Aşamalar:' })}</strong> {t({ de: 'Geleite Kunden von der Awareness bis zur aktiven Advocacy (Weiterempfehlung).', en: 'Guide customers from Awareness to active Advocacy (referral).', tr: 'Müşterileri Farkındalıktan aktif Savunuculuğa (tavsiye) yönlendirin.' })}</li>
                            <li><strong>{t({ de: 'Touchpoints:', en: 'Touchpoints:', tr: 'Temas Noktaları:' })}</strong> {t({ de: 'Klicke auf einen Touchpoint, um direkt in das Kanal-Management zu wechseln.', en: 'Click on a touchpoint to navigate directly to channel management.', tr: 'Kanal yönetimine geçmek için bir temas noktasına tıklayın.' })}</li>
                            <li><strong>{t({ de: 'Real-Content Linking:', en: 'Real Content Linking:', tr: 'Gerçek İçerik Bağlantısı:' })}</strong> {t({ de: 'Verknüpfter Content kann direkt zur Ansicht geöffnet werden.', en: 'Linked content can be opened directly for viewing.', tr: 'Bağlantılı içerik doğrudan görüntülemek için açılabilir.' })}</li>
                        </ul>
                    </PageHelp>

                    {customerJourneys.length > 0 ? (
                        <select
                            className="form-input"
                            value={selectedJourneyId}
                            onChange={event => setSelectedJourneyId(event.target.value)}
                            style={{ width: 'auto', backgroundColor: 'var(--bg-elevated)', maxWidth: '300px' }}
                        >
                            {customerJourneys.map(journey => (
                                <option key={journey.id} value={journey.id}>{journey.name}</option>
                            ))}
                        </select>
                    ) : (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-elevated)',
                            border: '2px solid var(--border-color)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)',
                        }}>
                            {t({ de: 'Noch keine Journey gespeichert', en: 'No journey saved yet', tr: 'Henüz kaydedilmiş yolculuk yok' })}
                        </div>
                    )}

                    {canEdit && (
                        <button className="btn btn-primary" onClick={() => setShowNewJourney(true)}>
                            <Plus size={16} /> {t({ de: 'Neue Journey', en: 'New Journey', tr: 'Yeni Yolculuk' })}
                        </button>
                    )}
                </div>
            </div>

            {!hasRealJourney && (
                <div className="card" style={{ marginBottom: '24px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            {t({ de: 'Die Journey-Hülle ist sichtbar, obwohl noch nichts verknüpft ist.', en: 'The journey shell is visible even though nothing is linked yet.', tr: 'Henüz hiçbir şey bağlanmamış olsa da yolculuk yapısı görünür.' })}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '760px' }}>
                            {t({ de: 'Das System zeigt die Struktur bereits vor Kampagnen, Content und Aufgaben an. So kann die erste Logik sauber gebaut werden, bevor operative Arbeit startet.', en: 'The system shows the structure before campaigns, content, and tasks. This allows building the initial logic cleanly before operational work starts.', tr: 'Sistem yapıyı kampanyalar, içerik ve görevlerden önce gösterir. Böylece operasyonel çalışma başlamadan önce ilk mantık temiz bir şekilde kurulabilir.' })}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => router.push('/setup?step=journey')}>{t({ de: 'Im Setup ausfüllen', en: 'Fill in Setup', tr: 'Kurulumda doldur' })}</button>
                        {canEdit && (
                            <button className="btn btn-primary" onClick={() => setShowNewJourney(true)}>
                                <Plus size={16} /> {t({ de: 'Journey anlegen', en: 'Create Journey', tr: 'Yolculuk oluştur' })}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showNewJourney && (
                <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div className="card-header"><div className="card-title">{t({ de: 'Neue Customer Journey erstellen', en: 'Create New Customer Journey', tr: 'Yeni Müşteri Yolculuğu Oluştur' })}</div></div>
                    <div className="form-group">
                        <label className="form-label">{t({ de: 'Name', en: 'Name', tr: 'Ad' })}</label>
                        <input className="form-input" value={newJourneyName} onChange={event => setNewJourneyName(event.target.value)} placeholder={t({ de: 'z.B. Onboarding-Journey', en: 'e.g. Onboarding Journey', tr: 'ör. Onboarding Yolculuğu' })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t({ de: 'Zielgruppe', en: 'Audience', tr: 'Hedef Kitle' })}</label>
                        <select className="form-select" value={newJourneyAudience} onChange={event => setNewJourneyAudience(event.target.value)}>
                            <option value="">{t({ de: 'Bitte wählen', en: 'Please select', tr: 'Lütfen seçin' })}</option>
                            {audiences.map(audienceItem => <option key={audienceItem.id} value={audienceItem.id}>{audienceItem.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t({ de: 'Beschreibung', en: 'Description', tr: 'Açıklama' })}</label>
                        <textarea className="form-input form-textarea" value={newJourneyDesc} onChange={event => setNewJourneyDesc(event.target.value)} placeholder={t({ de: 'Kurze Beschreibung der Journey...', en: 'Brief description of the journey...', tr: 'Yolculuğun kısa açıklaması...' })} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowNewJourney(false)}>{t({ de: 'Abbrechen', en: 'Cancel', tr: 'İptal' })}</button>
                        <button className="btn btn-primary" onClick={handleCreateJourney} disabled={!newJourneyName.trim()}>{t({ de: 'Erstellen', en: 'Create', tr: 'Oluştur' })}</button>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Map size={20} style={{ color: 'var(--color-primary)' }} />
                            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, margin: 0 }}>{displayedJourney.name}</h2>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0, maxWidth: '800px' }}>
                            {displayedJourney.description}
                        </p>
                    </div>

                    {audience && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                            <div className="persona-avatar" style={{ background: audience.color }}>
                                {audience.initials}
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>{t({ de: 'Persona / Fokus', en: 'Persona / Focus', tr: 'Persona / Odak' })}</div>
                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{audience.name}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                paddingBottom: '24px',
                minHeight: '650px'
            }}>
                {displayedJourney.stages.map((stage, index) => {
                    const styleConfig = PHASE_COLORS[stage.phase as keyof typeof PHASE_COLORS] || { bg: '#f1f5f9', border: '#cbd5e1', icon: null };
                    const contentItems = (stage.contentIds || []).map(cntId => resolveContent(cntId)).filter(Boolean) as ContentItem[];
                    const dynamicTouchpointIds = touchpoints
                        .filter(touchpoint => touchpointHasPhase(touchpoint, stage.phase))
                        .map(touchpoint => touchpoint.id);
                    const stageTouchpointIds = Array.from(new Set([...(stage.touchpoints || []), ...dynamicTouchpointIds]));

                    return (
                        <div key={stage.id} style={{
                            minWidth: '340px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            background: 'var(--bg-surface)',
                            border: '2px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '18px',
                            position: 'relative',
                            boxShadow: 'none'
                        }}>
                            <div style={{
                                background: styleConfig.bg,
                                borderLeft: `5px solid ${styleConfig.border}`,
                                padding: '14px 18px',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    {styleConfig.icon}
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)' }}>
                                        {index + 1}. {stage.phase}
                                    </div>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{stage.title}</h3>
                            </div>

                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                {stage.description}
                            </p>

                            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                                    {t({ de: 'Erfolgsmessung:', en: 'Success Metric:', tr: 'Başarı Ölçümü:' })} {stage.metrics.label || t({ de: 'Noch offen', en: 'Not set yet', tr: 'Henüz belirlenmedi' })}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stage.metrics.value || 'n/a'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                        <TrendingUp size={14} style={{ marginRight: '4px' }} /> {stage.metrics.trend || 'Setup'}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>📱 Touchpoints</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {stageTouchpointIds.length > 0 ? stageTouchpointIds.map((tpId, itemIndex) => {
                                        const touchpoint = resolveTouchpoint(tpId);
                                        return (
                                            <div
                                                key={`${stage.id}-${itemIndex}`}
                                                onClick={() => setSelectedTouchpoint(touchpoint ?? null)}
                                                style={{
                                                    padding: '10px 12px',
                                                    background: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontWeight: 600,
                                                    borderLeft: '3px solid var(--color-primary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                <span>{touchpoint ? touchpoint.name : tpId}</span>
                                                <ExternalLink size={12} style={{ opacity: 0.5 }} />
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '2px dashed var(--border-color)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', lineHeight: 1.5 }}>
                                            {t({ de: 'Noch keine Touchpoints hinterlegt. Die Hülle bleibt trotzdem sichtbar und kann später erweitert werden.', en: 'No touchpoints assigned yet. The shell remains visible and can be expanded later.', tr: 'Henüz temas noktası atanmadı. Yapı görünür kalır ve daha sonra genişletilebilir.' })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>📝 Content & Assets</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {contentItems.map(content => (
                                        <div
                                            key={content.id}
                                            onClick={() => setSelectedContent(content)}
                                            style={{
                                                padding: '10px 12px',
                                                background: 'var(--color-primary-50)',
                                                border: '2px solid var(--border-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-primary)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                            <FileText size={14} />
                                            <span>{content.title}</span>
                                        </div>
                                    ))}
                                    {stage.contentFormats.map((contentFormat, itemIndex) => (
                                        <div key={`${stage.id}-format-${itemIndex}`} style={{
                                            padding: '10px 12px',
                                            background: 'var(--bg-hover)',
                                            border: '2px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {contentFormat}
                                        </div>
                                    ))}
                                    {contentItems.length === 0 && stage.contentFormats.length === 0 && (
                                        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '2px dashed var(--border-color)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', lineHeight: 1.5 }}>
                                            {t({ de: 'Noch kein Content verknüpft. Die Phase kann zuerst strategisch beschrieben und später operativ befüllt werden.', en: 'No content linked yet. The phase can first be described strategically and filled operationally later.', tr: 'Henüz içerik bağlanmadı. Aşama önce stratejik olarak tanımlanabilir ve daha sonra operasyonel olarak doldurulabilir.' })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0, marginTop: 'auto' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <Frown size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                                    Pain Points
                                </div>
                                <div style={{ background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '2px solid var(--border-color)' }}>
                                    {stage.painPoints.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {stage.painPoints.map((painPoint, itemIndex) => (
                                                <li key={`${stage.id}-pain-${itemIndex}`} style={{ fontSize: '0.7rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                    <span style={{ color: 'var(--color-danger)', fontWeight: 900 }}>!</span>
                                                    {painPoint}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', lineHeight: 1.5 }}>
                                            {t({ de: 'Für diese Phase wurden noch keine zentralen Hürden dokumentiert.', en: 'No key barriers have been documented for this phase yet.', tr: 'Bu aşama için henüz temel engeller belgelenmedi.' })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {stage.phase === 'Purchase' && (
                                <div style={{
                                    marginTop: '20px',
                                    border: '2px dashed var(--color-success)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '18px',
                                    background: 'var(--color-success-bg)',
                                    textAlign: 'center'
                                }}>
                                    <Store size={26} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                                        {t({ de: 'Vertrieb (B2B/B2C)', en: 'Sales (B2B/B2C)', tr: 'Satış (B2B/B2C)' })}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-success)', marginTop: '6px', marginBottom: '12px', lineHeight: 1.4 }}>
                                        {t({ de: 'Der Handoff an Sales oder Checkout kann später hier operationalisiert werden.', en: 'The handoff to Sales or Checkout can be operationalized here later.', tr: 'Satış veya Ödeme\'ye aktarım daha sonra burada operasyonelleştirilebilir.' })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedContent && (
                <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
            )}
            {selectedTouchpoint && (
                <TouchpointDetailModal touchpoint={selectedTouchpoint} onClose={() => setSelectedTouchpoint(null)} />
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useProjectRouter } from '../hooks/useProjectRouter';
import type { ContentItem, Touchpoint } from '../types';
import { Share2, Plus, TrendingUp, Map, Heart, Frown, Megaphone, Search, DollarSign, Store, ExternalLink, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useContents } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
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
                    <h1 className="page-title">Customer Journey Map</h1>
                    <p className="page-subtitle">Standard 5-Phasen Modell</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Customer Journey (5 Phasen)">
                        <p style={{ marginBottom: '12px' }}>Die Customer Journey verbindet deine Zielgruppen mit relevantem Content über den gesamten Lebenszyklus des Kunden hinweg.</p>
                        <ul className="help-list">
                            <li><strong>Phasen:</strong> Geleite Kunden von der <i>Awareness</i> bis zur aktiven <i>Advocacy</i> (Weiterempfehlung).</li>
                            <li><strong>Touchpoints:</strong> Klicke auf einen Touchpoint, um direkt in das Kanal-Management zu wechseln.</li>
                            <li><strong>Real-Content Linking:</strong> Verknüpfter Content kann direkt zur Ansicht geöffnet werden.</li>
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
                            border: '1px solid var(--border-color)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)',
                        }}>
                            Noch keine Journey gespeichert
                        </div>
                    )}

                    {canEdit && (
                        <button className="btn btn-primary" onClick={() => setShowNewJourney(true)}>
                            <Plus size={16} /> Neue Journey
                        </button>
                    )}
                </div>
            </div>

            {!hasRealJourney && (
                <div className="card" style={{ marginBottom: '24px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Die Journey-Hülle ist sichtbar, obwohl noch nichts verknüpft ist.
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '760px' }}>
                            Das System zeigt die Struktur bereits vor Kampagnen, Content und Aufgaben an. So kann die erste Logik sauber gebaut werden, bevor operative Arbeit startet.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => router.push('/setup?step=journey')}>Im Setup ausfüllen</button>
                        {canEdit && (
                            <button className="btn btn-primary" onClick={() => setShowNewJourney(true)}>
                                <Plus size={16} /> Journey anlegen
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showNewJourney && (
                <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div className="card-header"><div className="card-title">Neue Customer Journey erstellen</div></div>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-input" value={newJourneyName} onChange={event => setNewJourneyName(event.target.value)} placeholder="z.B. Onboarding-Journey" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Zielgruppe</label>
                        <select className="form-select" value={newJourneyAudience} onChange={event => setNewJourneyAudience(event.target.value)}>
                            <option value="">Bitte wählen</option>
                            {audiences.map(audienceItem => <option key={audienceItem.id} value={audienceItem.id}>{audienceItem.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Beschreibung</label>
                        <textarea className="form-input form-textarea" value={newJourneyDesc} onChange={event => setNewJourneyDesc(event.target.value)} placeholder="Kurze Beschreibung der Journey..." />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowNewJourney(false)}>Abbrechen</button>
                        <button className="btn btn-primary" onClick={handleCreateJourney} disabled={!newJourneyName.trim()}>Erstellen</button>
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
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Persona / Fokus</div>
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
                            border: '1px solid var(--border-color)',
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
                                color: '#1e293b'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    {styleConfig.icon}
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#475569' }}>
                                        {index + 1}. {stage.phase}
                                    </div>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{stage.title}</h3>
                            </div>

                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                {stage.description}
                            </p>

                            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                                    Erfolgsmessung: {stage.metrics.label || 'Noch offen'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stage.metrics.value || 'n/a'}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
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
                                        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', lineHeight: 1.5 }}>
                                            Noch keine Touchpoints hinterlegt. Die Hülle bleibt trotzdem sichtbar und kann später erweitert werden.
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
                                                background: 'rgba(99, 102, 241, 0.05)',
                                                border: '1px solid rgba(99, 102, 241, 0.15)',
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
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: '#64748b'
                                        }}>
                                            {contentFormat}
                                        </div>
                                    ))}
                                    {contentItems.length === 0 && stage.contentFormats.length === 0 && (
                                        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', lineHeight: 1.5 }}>
                                            Noch kein Content verknüpft. Die Phase kann zuerst strategisch beschrieben und später operativ befüllt werden.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0, marginTop: 'auto' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <Frown size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                                    Pain Points
                                </div>
                                <div style={{ background: '#fef2f2', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid #fee2e2' }}>
                                    {stage.painPoints.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {stage.painPoints.map((painPoint, itemIndex) => (
                                                <li key={`${stage.id}-pain-${itemIndex}`} style={{ fontSize: '0.7rem', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                    <span style={{ color: '#ef4444', fontWeight: 900 }}>!</span>
                                                    {painPoint}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div style={{ fontSize: '0.7rem', color: '#991b1b', lineHeight: 1.5 }}>
                                            Für diese Phase wurden noch keine zentralen Hürden dokumentiert.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {stage.phase === 'Purchase' && (
                                <div style={{
                                    marginTop: '20px',
                                    border: '2px dashed #10b981',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '18px',
                                    background: '#ecfdf5',
                                    textAlign: 'center'
                                }}>
                                    <Store size={26} style={{ color: '#10b981', margin: '0 auto 10px' }} />
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#064e3b', textTransform: 'uppercase' }}>
                                        Vertrieb (B2B/B2C)
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#047857', marginTop: '6px', marginBottom: '12px', lineHeight: 1.4 }}>
                                        Der Handoff an Sales oder Checkout kann später hier operationalisiert werden.
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

import { useState } from 'react';
import type { ContentItem, Touchpoint } from '../types';
import { Share2, Plus, Edit, MoreVertical, TrendingUp, Users, Map, Target, Heart, Frown, Megaphone, Search, Zap, DollarSign, Store, ExternalLink, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useContents } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import PageHelp from '../components/PageHelp';
import ContentDetailModal from '../components/ContentDetailModal';
import TouchpointDetailModal from '../components/TouchpointDetailModal';

const ASIDAS_COLORS = {
    Attention: { bg: '#e0e7ff', border: '#818cf8', icon: <Megaphone size={16} /> },
    Search: { bg: '#fef3c7', border: '#fbbf24', icon: <Search size={16} /> },
    Interest: { bg: '#dcfce7', border: '#34d399', icon: <Target size={16} /> },
    Desire: { bg: '#ffedd5', border: '#fdba74', icon: <Zap size={16} /> },
    Action: { bg: '#fee2e2', border: '#ef4444', icon: <DollarSign size={16} /> },
    Share: { bg: '#f3e8ff', border: '#c084fc', icon: <Heart size={16} /> },
};

export default function AsidasFunnelPage() {
    const { can } = useAuth();
    const canEdit = can('canEditPositioning');
    const { asidasJourneys, audiences, touchpoints, addJourney } = useData();
    const { contents: allContent } = useContents();

    const [selectedJourneyId, setSelectedJourneyId] = useState(asidasJourneys[0]?.id || '');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [selectedTouchpoint, setSelectedTouchpoint] = useState<Touchpoint | null>(null);
    const [showNewJourney, setShowNewJourney] = useState(false);
    const [newJourneyName, setNewJourneyName] = useState('');
    const [newJourneyAudience, setNewJourneyAudience] = useState('');
    const [newJourneyDesc, setNewJourneyDesc] = useState('');

    const selectedJourney = asidasJourneys.find(j => j.id === selectedJourneyId);
    const audience = audiences.find(a => a.id === selectedJourney?.audienceId);

    if (!selectedJourney) return <div>Keine Journey gefunden.</div>;

    const resolveTouchpoint = (tpId: string) => {
        return touchpoints.find(t => t.id === tpId);
    };

    const resolveContent = (cntId: string) => {
        return allContent.find(c => c.id === cntId);
    };

    const handleCreateJourney = async () => {
        if (!newJourneyName.trim()) return;
        const created = await addJourney({
            name: newJourneyName,
            audienceId: newJourneyAudience || audiences[0]?.id || '',
            description: newJourneyDesc,
            stages: Object.keys(ASIDAS_COLORS).map(phase => ({
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
        }, 'asidas');
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
                    <h1 className="page-title">ASIDAS Funnel</h1>
                    <p className="page-subtitle">Strategisches Mapping nach dem ASIDAS-Modell</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Customer Journey (ASIDAS)">
                        <p style={{ marginBottom: '12px' }}>Die Customer Journey verbindet deine Zielgruppen (Personas) mit konkretem Content in der richtigen Reihenfolge nach dem praxisbewährten <strong>ASIDAS-Modell</strong>.</p>
                        <ul className="help-list">
                            <li><strong>Omnipräsenz in ASIDAS:</strong> Search und Share begleiten die Nutzer oft durchgehend. In dieser Ansicht sind sie als vertikale Ankerpunkte markiert.</li>
                            <li><strong>Touchpoints:</strong> Klicke auf einen Touchpoint, um direkt in das Kanal-Management zu wechseln.</li>
                            <li><strong>Real-Content Linking:</strong> Verknüpfter Content aus der Redaktionsplanung kann direkt zur Ansicht/Bearbeitung geöffnet werden.</li>
                        </ul>
                    </PageHelp>

                    <select
                        className="form-input"
                        value={selectedJourneyId}
                        onChange={e => setSelectedJourneyId(e.target.value)}
                        style={{ width: 'auto', backgroundColor: 'var(--bg-elevated)', maxWidth: '300px' }}
                    >
                        {asidasJourneys.map(j => (
                            <option key={j.id} value={j.id}>{j.name}</option>
                        ))}
                    </select>

                    {canEdit && (
                        <button className="btn btn-primary" onClick={() => setShowNewJourney(true)}>
                            <Plus size={16} /> Neue Journey
                        </button>
                    )}
                </div>
            </div>

            {/* New Journey Inline Form */}
            {showNewJourney && (
                <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                    <div className="card-header"><div className="card-title">Neue ASIDAS Journey erstellen</div></div>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-input" value={newJourneyName} onChange={e => setNewJourneyName(e.target.value)} placeholder="z.B. Launch-Journey für Produkt X" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Zielgruppe</label>
                        <select className="form-select" value={newJourneyAudience} onChange={e => setNewJourneyAudience(e.target.value)}>
                            <option value="">Bitte wählen</option>
                            {audiences.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Beschreibung</label>
                        <textarea className="form-input form-textarea" value={newJourneyDesc} onChange={e => setNewJourneyDesc(e.target.value)} placeholder="Kurze Beschreibung der Journey..." />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowNewJourney(false)}>Abbrechen</button>
                        <button className="btn btn-primary" onClick={handleCreateJourney} disabled={!newJourneyName.trim()}>Erstellen</button>
                    </div>
                </div>
            )}

            {/* Meta-Info Card */}
            <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Map size={20} style={{ color: 'var(--color-primary)' }} />
                            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, margin: 0 }}>{selectedJourney.name}</h2>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0, maxWidth: '800px' }}>
                            {selectedJourney.description}
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

            {/* Journey Board */}
            <div style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                paddingTop: '32px',
                paddingBottom: '24px',
                minHeight: '650px'
            }}>
                {selectedJourney.stages.map((stage, index) => {
                    const isOmnipresent = ['Search', 'Share'].includes(stage.phase);
                    const styleConfig = ASIDAS_COLORS[stage.phase] || { bg: '#f1f5f9', border: '#cbd5e1', icon: null };

                    return (
                        <div key={stage.id} style={{
                            minWidth: '340px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            background: isOmnipresent ? 'rgba(var(--color-primary-rgb), 0.02)' : 'var(--bg-surface)',
                            border: isOmnipresent ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '18px',
                            position: 'relative',
                            boxShadow: isOmnipresent ? '0 8px 30px rgba(99, 102, 241, 0.12)' : 'none'
                        }}>
                            {isOmnipresent && (
                                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
                                    OMNIPRÄSENTE PHASE
                                </div>
                            )}

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

                            {/* Metrics */}
                            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                                    Erfolgsmessung: {stage.metrics.label}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stage.metrics.value}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                        <TrendingUp size={14} style={{ marginRight: '4px' }} /> {stage.metrics.trend}
                                    </span>
                                </div>
                            </div>

                            {/* Touchpoints */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>📱 Touchpoints</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {stage.touchpoints.map((tpId, i) => {
                                        const tp = resolveTouchpoint(tpId);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedTouchpoint(tp ?? null)}
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
                                                <span>{tp ? tp.name : tpId}</span>
                                                <ExternalLink size={12} style={{ opacity: 0.5 }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>📝 Content & Assets</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {/* Real Content Links */}
                                    {(stage.contentIds || []).map(cntId => {
                                        const cnt = resolveContent(cntId);
                                        if (!cnt) return null;
                                        return (
                                            <div
                                                key={cntId}
                                                onClick={() => setSelectedContent(cnt)}
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
                                                <span>{cnt.title}</span>
                                            </div>
                                        );
                                    })}
                                    {/* Fallback Text Formats */}
                                    {stage.contentFormats.map((content, i) => (
                                        <div key={i} style={{
                                            padding: '10px 12px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: '#64748b'
                                        }}>
                                            {content}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pain Points */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0, marginTop: 'auto' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <Frown size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                                    Pain Points
                                </div>
                                <div style={{ background: '#fef2f2', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid #fee2e2' }}>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {stage.painPoints.map((pp, i) => (
                                            <li key={i} style={{ fontSize: '0.7rem', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <span style={{ color: '#ef4444', fontWeight: 900 }}>!</span>
                                                {pp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Sales Handoff */}
                            {stage.phase === 'Action' && (
                                <div style={{
                                    marginTop: '20px',
                                    border: '2px dashed #ef4444',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '18px',
                                    background: '#fff1f2',
                                    textAlign: 'center',
                                    animation: 'pulse 3s infinite'
                                }}>
                                    <Store size={26} style={{ color: '#ef4444', margin: '0 auto 10px' }} />
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                                        Vertrieb (B2B/B2C)
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#b91c1c', marginTop: '6px', marginBottom: '12px', lineHeight: 1.4 }}>
                                        Automatisierter Handoff an Sales Hub. <br />Pipeline-Trigger bei Conversion.
                                    </div>
                                    <div style={{ background: 'white', border: '1px solid #fecaca', padding: '6px', borderRadius: 'var(--radius-sm)', fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>
                                        Feature Coming Soon
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

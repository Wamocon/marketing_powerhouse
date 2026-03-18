import { useState } from 'react';
import { Plus, Users, Bot, Tag, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NewCampaignModalProps {
    onClose: () => void;
}

export default function NewCampaignModal({ onClose }: NewCampaignModalProps) {
    const { audiences: allAudiences, touchpoints, addCampaign } = useData();
    const [modalStep, setModalStep] = useState(1);
    const [campaignName, setCampaignName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
    const [campaignKeywords, setCampaignKeywords] = useState('');
    const [selectedTouchpoints, setSelectedTouchpoints] = useState<string[]>([]);

    const toggleAudience = (id: string) => {
        setSelectedAudiences(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const toggleTouchpoint = (id: string) => {
        setSelectedTouchpoints(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Neue Kampagne erstellen</h2>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                            {[1, 2, 3].map(step => (
                                <div key={step} style={{
                                    height: '3px', flex: 1, borderRadius: 'var(--radius-full)',
                                    background: step <= modalStep ? 'var(--color-primary)' : 'var(--bg-elevated)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                            Schritt {modalStep} von 3: {modalStep === 1 ? 'Grunddaten' : modalStep === 2 ? 'Master-Prompt & Zielgruppen' : 'Schlüsselbegriffe'}
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {modalStep === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            <div className="form-group">
                                <label className="form-label">Kampagnenname</label>
                                <input type="text" className="form-input" placeholder="z.B. Sommer-Sale 2026" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Beschreibung</label>
                                <textarea className="form-input form-textarea" placeholder="Beschreibe das Ziel der Kampagne…" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Startdatum</label>
                                    <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Enddatum</label>
                                    <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Budget (€)</label>
                                <input type="number" className="form-input" placeholder="z.B. 15000" value={budget} onChange={e => setBudget(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                                    Touchpoints / Kanäle
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    Wähle die vordefinierten Touchpoints für deine Kampagne aus.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {touchpoints.map(tp => (
                                        <div
                                            key={tp.id}
                                            onClick={() => toggleTouchpoint(tp.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                                background: selectedTouchpoints.includes(tp.id) ? 'rgba(37,99,235,0.1)' : 'var(--bg-elevated)',
                                                border: `1px solid ${selectedTouchpoints.includes(tp.id) ? 'var(--color-primary)' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                fontSize: 'var(--font-size-xs)'
                                            }}
                                        >
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                                border: `2px solid ${selectedTouchpoints.includes(tp.id) ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                background: selectedTouchpoints.includes(tp.id) ? 'var(--color-primary)' : 'var(--bg-surface)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {selectedTouchpoints.includes(tp.id) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>{tp.name}</span>
                                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>{tp.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 2 && (
                        <div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Bot size={14} style={{ color: 'var(--color-primary)' }} />
                                    Master-Prompt
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px', lineHeight: 1.5 }}>
                                    Der Master-Prompt ist die allgemeingültige KI-Zusammenfassung deiner Kampagne. Er wird als Kontextbasis für alle KI-generierten Inhalte genutzt.
                                </p>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Beschreibe Ton, Zielgruppe, USPs, Kernbotschaft und Dos & Don'ts dieser Kampagne…"
                                    style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users size={14} style={{ color: '#10b981' }} />
                                    Zielgruppen zuweisen
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    Wähle eine oder mehrere Personas aus der Zielgruppen-Bibliothek.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {allAudiences.map(a => (
                                        <div
                                            key={a.id}
                                            onClick={() => toggleAudience(a.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px', borderRadius: 'var(--radius-md)',
                                                background: selectedAudiences.includes(a.id) ? 'rgba(220,38,38,0.1)' : 'var(--bg-elevated)',
                                                border: `1px solid ${selectedAudiences.includes(a.id) ? 'var(--color-primary)' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <div className="persona-avatar persona-avatar--sm" style={{ background: a.color, flexShrink: 0 }}>
                                                {a.initials}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{a.name}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    {a.segment} · {a.age} J. · {a.jobTitle}
                                                </div>
                                            </div>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                                border: `2px solid ${selectedAudiences.includes(a.id) ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                background: selectedAudiences.includes(a.id) ? 'var(--color-primary)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {selectedAudiences.includes(a.id) && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 3 && (
                        <div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Tag size={14} style={{ color: '#f59e0b' }} />
                                    Kampagnenspezifische Keywords
                                </label>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px', lineHeight: 1.5 }}>
                                    Ergänze Keywords, die spezifisch für diese Kampagne sind. Unternehmensweite Keywords werden automatisch hinzugefügt.
                                </p>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Keywords kommagetrennt eingeben, z.B. Sommer-Sale, New Arrivals, …"
                                    value={campaignKeywords}
                                    onChange={(e) => setCampaignKeywords(e.target.value)}
                                />
                                {campaignKeywords && (
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                        {campaignKeywords.split(',').filter(k => k.trim()).map(k => (
                                            <span key={k} className="keyword-tag keyword-tag--campaign">{k.trim()}</span>
                                        ))}
                                    </div>
                                )}
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        🔒 Unternehmensweite Keywords (werden automatisch eingebunden)
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {['DSGVO-konform', 'Made in Europe', 'Nachhaltigkeit', 'Premium-Qualität', 'Vertrauen'].map(kw => (
                                            <span key={kw} className="keyword-tag keyword-tag--company">🔒 {kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {modalStep > 1 && (
                        <button className="btn btn-secondary" onClick={() => setModalStep(prev => prev - 1)}>
                            ← Zurück
                        </button>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
                        {modalStep < 3 ? (
                            <button className="btn btn-primary" onClick={() => setModalStep(prev => prev + 1)}>
                                Weiter →
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={async () => {
                                await addCampaign({
                                    name: campaignName || 'Neue Kampagne',
                                    status: 'planned',
                                    startDate,
                                    endDate,
                                    budget: Number(budget) || 0,
                                    spent: 0,
                                    channels: selectedTouchpoints.map(tpId => touchpoints.find(t => t.id === tpId)?.name || ''),
                                    touchpointIds: selectedTouchpoints,
                                    description,
                                    masterPrompt: '',
                                    targetAudiences: selectedAudiences,
                                    campaignKeywords: campaignKeywords.split(',').map(k => k.trim()).filter(Boolean),
                                    kpis: { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
                                    owner: '',
                                    progress: 0,
                                });
                                onClose();
                            }}>
                                Kampagne erstellen
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

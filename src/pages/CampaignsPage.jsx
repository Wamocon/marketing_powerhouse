import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Users, Bot, Tag } from 'lucide-react';
import { campaigns, audiences as allAudiences } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
    active: { label: 'Aktiv', badge: 'badge-success' },
    planned: { label: 'Geplant', badge: 'badge-info' },
    draft: { label: 'Entwurf', badge: 'badge-warning' },
    completed: { label: 'Abgeschlossen', badge: 'badge-primary' },
    paused: { label: 'Pausiert', badge: 'badge-danger' },
};

export default function CampaignsPage() {
    const navigate = useNavigate();
    const { can } = useAuth();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

    // Modal state
    const [modalStep, setModalStep] = useState(1); // 1 = Basis, 2 = Prompt & Zielgruppen, 3 = Keywords
    const [selectedAudiences, setSelectedAudiences] = useState([]);
    const [campaignKeywords, setCampaignKeywords] = useState('');

    const filteredCampaigns = campaigns
        .filter(c => filter === 'all' || c.status === filter)
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleAudience = (id) => {
        setSelectedAudiences(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const closeModal = () => {
        setShowNewCampaignModal(false);
        setModalStep(1);
        setSelectedAudiences([]);
        setCampaignKeywords('');
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Kampagnen</h1>
                    <p className="page-subtitle">{campaigns.length} Kampagnen insgesamt · {campaigns.filter(c => c.status === 'active').length} aktiv</p>
                </div>
                <div className="page-header-actions">
                    {can('canCreateCampaigns') && (
                        <button className="btn btn-primary" onClick={() => setShowNewCampaignModal(true)}>
                            <Plus size={16} />
                            Neue Kampagne
                        </button>
                    )}
                </div>
            </div>


            {/* Filter & Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Kampagnen durchsuchen…"
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                    {[
                        { key: 'all', label: 'Alle' },
                        { key: 'active', label: 'Aktiv' },
                        { key: 'planned', label: 'Geplant' },
                        { key: 'draft', label: 'Entwurf' },
                        { key: 'completed', label: 'Abgeschlossen' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab ${filter === tab.key ? 'active' : ''}`}
                            onClick={() => setFilter(tab.key)}
                            style={{
                                borderBottom: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 16px',
                                background: filter === tab.key ? 'var(--bg-hover)' : 'transparent',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                {filteredCampaigns.map((campaign) => {
                    const status = statusConfig[campaign.status];
                    const linkedAudienceCount = campaign.targetAudiences?.length || 0;
                    const keywordCount = campaign.campaignKeywords?.length || 0;
                    return (
                        <div
                            key={campaign.id}
                            className="card"
                            style={{ cursor: 'pointer', padding: '20px' }}
                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>
                                        {campaign.name}
                                    </h3>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {campaign.description}
                                    </p>
                                </div>
                                <span className={`badge ${status.badge}`}>{status.label}</span>
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    <span>Fortschritt</span>
                                    <span>{campaign.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`progress-bar-fill ${campaign.progress >= 80 ? 'success' : campaign.progress >= 50 ? 'primary' : 'warning'}`}
                                        style={{ width: `${campaign.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Quick badges: Master Prompt + Audiences + Keywords */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                {campaign.masterPrompt && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.6875rem', padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(220,38,38,0.15)',
                                        color: 'var(--color-primary)',
                                    }}>
                                        <Bot size={10} /> Master-Prompt
                                    </span>
                                )}
                                {linkedAudienceCount > 0 && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.6875rem', padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(16,185,129,0.15)',
                                        color: '#10b981',
                                    }}>
                                        <Users size={10} /> {linkedAudienceCount} Persona{linkedAudienceCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {keywordCount > 0 && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.6875rem', padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(245,158,11,0.15)',
                                        color: '#f59e0b',
                                    }}>
                                        <Tag size={10} /> {keywordCount} Keywords
                                    </span>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div style={{ display: 'flex', gap: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} />
                                    <span>{new Date(campaign.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} – {new Date(campaign.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={12} />
                                    <span>{campaign.owner}</span>
                                </div>
                            </div>

                            {/* Channels */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                                {campaign.channels.map(ch => (
                                    <span key={ch} style={{
                                        fontSize: '0.6875rem',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--bg-hover)',
                                        color: 'var(--text-secondary)',
                                    }}>
                                        {ch}
                                    </span>
                                ))}
                            </div>

                            {/* Budget */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '16px',
                                paddingTop: '12px',
                                borderTop: '1px solid var(--border-color)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Budget</span>
                                <span style={{ fontWeight: 600 }}>
                                    €{campaign.spent.toLocaleString('de-DE')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ €{campaign.budget.toLocaleString('de-DE')}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* New Campaign Modal — Multi-Step */}
            {showNewCampaignModal && (
                <div className="modal-overlay" onClick={closeModal}>
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
                            <button className="btn btn-ghost btn-icon" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            {/* Step 1: Basis */}
                            {modalStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    <div className="form-group">
                                        <label className="form-label">Kampagnenname</label>
                                        <input type="text" className="form-input" placeholder="z.B. Sommer-Sale 2026" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Beschreibung</label>
                                        <textarea className="form-input form-textarea" placeholder="Beschreibe das Ziel der Kampagne…" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Startdatum</label>
                                            <input type="date" className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Enddatum</label>
                                            <input type="date" className="form-input" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Budget (€)</label>
                                        <input type="number" className="form-input" placeholder="z.B. 15000" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Kanäle</label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {['E-Mail', 'Social Media', 'Google Ads', 'Meta Ads', 'SEO', 'Content', 'LinkedIn'].map(ch => (
                                                <button key={ch} className="btn btn-secondary btn-sm">{ch}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Master-Prompt & Zielgruppen */}
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

                            {/* Step 3: Keywords */}
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
                                <button className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
                                {modalStep < 3 ? (
                                    <button className="btn btn-primary" onClick={() => setModalStep(prev => prev + 1)}>
                                        Weiter →
                                    </button>
                                ) : (
                                    <button className="btn btn-primary" onClick={closeModal}>
                                        Kampagne erstellen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

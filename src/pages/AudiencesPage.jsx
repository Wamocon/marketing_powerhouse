import { useState } from 'react';
import { Plus, Search, Users, Target, Megaphone, ChevronRight, Tag, MapPin, Briefcase, Heart } from 'lucide-react';
import { audiences, campaigns } from '../data/mockData';

const segmentConfig = {
    'B2C': { badge: 'badge-info', label: 'B2C' },
    'B2B': { badge: 'badge-primary', label: 'B2B' },
};

const typeConfig = {
    'buyer': { label: 'Buyer Persona', icon: '🎯' },
    'user': { label: 'User Persona', icon: '🧑‍💻' },
};

export default function AudiencesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('all');
    const [selectedAudience, setSelectedAudience] = useState(null);
    const [showNewAudienceModal, setShowNewAudienceModal] = useState(false);

    const filtered = audiences
        .filter(a => segmentFilter === 'all' || a.segment === segmentFilter)
        .filter(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const getLinkedCampaigns = (audienceId) =>
        campaigns.filter(c => c.targetAudiences?.includes(audienceId));

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Zielgruppen & Avatare</h1>
                    <p className="page-subtitle">
                        {audiences.length} Personas definiert · {audiences.filter(a => a.segment === 'B2B').length} B2B · {audiences.filter(a => a.segment === 'B2C').length} B2C
                    </p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewAudienceModal(true)}>
                        <Plus size={16} />
                        Neue Persona
                    </button>
                </div>
            </div>

            {/* Filter & Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Personas durchsuchen…"
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                    {[
                        { key: 'all', label: 'Alle' },
                        { key: 'B2B', label: 'B2B' },
                        { key: 'B2C', label: 'B2C' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab ${segmentFilter === tab.key ? 'active' : ''}`}
                            onClick={() => setSegmentFilter(tab.key)}
                            style={{
                                borderBottom: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 16px',
                                background: segmentFilter === tab.key ? 'var(--bg-hover)' : 'transparent',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedAudience ? '1fr 380px' : '1fr', gap: '20px', alignItems: 'start' }}>
                {/* Personas Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedAudience ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {filtered.map(audience => {
                        const linkedCampaigns = getLinkedCampaigns(audience.id);
                        const isSelected = selectedAudience?.id === audience.id;
                        return (
                            <div
                                key={audience.id}
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    padding: '20px',
                                    borderColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                }}
                                onClick={() => setSelectedAudience(isSelected ? null : audience)}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                                    <div className="persona-avatar" style={{ background: audience.color }}>
                                        {audience.initials}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{audience.name}</h3>
                                            <span className={`badge ${segmentConfig[audience.segment].badge}`}>{audience.segment}</span>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                {typeConfig[audience.type].icon} {typeConfig[audience.type].label}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            {audience.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Info Row */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={11} /> {audience.age} J.
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={11} /> {audience.location}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Briefcase size={11} /> {audience.jobTitle}
                                    </span>
                                </div>

                                {/* Interests */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                    {audience.interests.slice(0, 3).map(interest => (
                                        <span key={interest} className="keyword-tag keyword-tag--read">
                                            {interest}
                                        </span>
                                    ))}
                                    {audience.interests.length > 3 && (
                                        <span className="keyword-tag keyword-tag--read" style={{ color: 'var(--text-tertiary)' }}>
                                            +{audience.interests.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--border-color)',
                                    fontSize: 'var(--font-size-xs)',
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)' }}>
                                        <Megaphone size={11} />
                                        {linkedCampaigns.length} Kampagne{linkedCampaigns.length !== 1 ? 'n' : ''}
                                    </span>
                                    <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                        Details <ChevronRight size={12} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detail Panel */}
                {selectedAudience && (
                    <div className="card animate-in" style={{ position: 'sticky', top: '24px', padding: '24px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div className="persona-avatar persona-avatar--lg" style={{ background: selectedAudience.color }}>
                                {selectedAudience.initials}
                            </div>
                            <div>
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>{selectedAudience.name}</h2>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <span className={`badge ${segmentConfig[selectedAudience.segment].badge}`}>{selectedAudience.segment}</span>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {typeConfig[selectedAudience.type].icon} {typeConfig[selectedAudience.type].label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Demografie */}
                        <div className="detail-section">
                            <div className="detail-section-title">Demografie</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { label: 'Alter', value: selectedAudience.age + ' J.' },
                                    { label: 'Geschlecht', value: selectedAudience.gender },
                                    { label: 'Standort', value: selectedAudience.location },
                                    { label: 'Einkommen', value: selectedAudience.income },
                                    { label: 'Bildung', value: selectedAudience.education },
                                    { label: 'Berufsfeld', value: selectedAudience.jobTitle },
                                ].map(item => (
                                    <div key={item.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{item.label}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pain Points */}
                        <div className="detail-section">
                            <div className="detail-section-title">😤 Pain Points</div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {selectedAudience.painPoints.map(p => (
                                    <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: '#ef4444', marginTop: '1px' }}>●</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Goals */}
                        <div className="detail-section">
                            <div className="detail-section-title">🎯 Ziele & Motivationen</div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {selectedAudience.goals.map(g => (
                                    <li key={g} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: '#10b981', marginTop: '1px' }}>●</span> {g}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kanäle */}
                        <div className="detail-section">
                            <div className="detail-section-title">📡 Bevorzugte Kanäle</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {selectedAudience.preferredChannels.map(ch => (
                                    <span key={ch} className="keyword-tag keyword-tag--read">{ch}</span>
                                ))}
                            </div>
                        </div>

                        {/* Customer Journey */}
                        <div className="detail-section">
                            <div className="detail-section-title">🗺️ Customer Journey Phase</div>
                            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                                {selectedAudience.journeyPhase}
                            </div>
                        </div>

                        {/* Entscheidungsprozess */}
                        <div className="detail-section">
                            <div className="detail-section-title">🧠 Entscheidungsprozess</div>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                {selectedAudience.decisionProcess}
                            </p>
                        </div>

                        {/* Verknüpfte Kampagnen */}
                        <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <div className="detail-section-title">
                                <Megaphone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Verknüpfte Kampagnen
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {getLinkedCampaigns(selectedAudience.id).map(c => (
                                    <div key={c.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                                    }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{c.name}</span>
                                        <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'planned' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                                            {c.status === 'active' ? 'Aktiv' : c.status === 'planned' ? 'Geplant' : c.status}
                                        </span>
                                    </div>
                                ))}
                                {getLinkedCampaigns(selectedAudience.id).length === 0 && (
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                        Keine Kampagnen verknüpft
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New Audience Modal */}
            {showNewAudienceModal && (
                <div className="modal-overlay" onClick={() => setShowNewAudienceModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Neue Persona erstellen</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowNewAudienceModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Persona-Name</label>
                                    <input type="text" className="form-input" placeholder="z.B. Digital Dave" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Typ</label>
                                    <select className="form-input">
                                        <option value="buyer">Buyer Persona</option>
                                        <option value="user">User Persona</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Segment</label>
                                    <select className="form-input">
                                        <option value="B2C">B2C</option>
                                        <option value="B2B">B2B</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Altersgruppe</label>
                                    <input type="text" className="form-input" placeholder="z.B. 28–38" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Standort</label>
                                    <input type="text" className="form-input" placeholder="z.B. DACH-Region" />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Berufsfeld / Job Title</label>
                                    <input type="text" className="form-input" placeholder="z.B. Marketing Manager" />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Beschreibung</label>
                                    <textarea className="form-input form-textarea" placeholder="Beschreibe diese Persona in 2–3 Sätzen…" />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Pain Points (kommagetrennt)</label>
                                    <input type="text" className="form-input" placeholder="z.B. Zu viele Tools, Zeitmangel, …" />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Ziele (kommagetrennt)</label>
                                    <input type="text" className="form-input" placeholder="z.B. Produktivität steigern, …" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowNewAudienceModal(false)}>Abbrechen</button>
                            <button className="btn btn-primary" onClick={() => setShowNewAudienceModal(false)}>Persona erstellen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, ExternalLink, Edit, MoreVertical, Bot, Tag, Lock, Plus, X } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
} from 'recharts';
import { campaigns, tasks, audiences, companyKeywords } from '../data/mockData';

const statusConfig = {
    active: { label: 'Aktiv', badge: 'badge-success', steps: 3 },
    planned: { label: 'Geplant', badge: 'badge-info', steps: 1 },
    draft: { label: 'Entwurf', badge: 'badge-warning', steps: 0 },
    completed: { label: 'Abgeschlossen', badge: 'badge-primary', steps: 5 },
    paused: { label: 'Pausiert', badge: 'badge-danger', steps: 2 },
};

const statusSteps = ['Entwurf', 'Geplant', 'In Review', 'Aktiv', 'Optimierung', 'Abgeschlossen'];

const performanceData = [
    { day: '04 Mär', impressions: 8200, clicks: 420, conversions: 18 },
    { day: '05 Mär', impressions: 9100, clicks: 510, conversions: 24 },
    { day: '06 Mär', impressions: 7800, clicks: 380, conversions: 15 },
    { day: '07 Mär', impressions: 11200, clicks: 620, conversions: 32 },
    { day: '08 Mär', impressions: 10500, clicks: 580, conversions: 29 },
    { day: '09 Mär', impressions: 12600, clicks: 710, conversions: 38 },
    { day: '10 Mär', impressions: 13400, clicks: 780, conversions: 42 },
];

export default function CampaignDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const campaign = campaigns.find(c => c.id === id) || campaigns[0];
    const status = statusConfig[campaign.status];
    const campaignTasks = tasks.filter(t => t.campaign === campaign.name);
    const linkedAudiences = audiences.filter(a => campaign.targetAudiences?.includes(a.id));

    // Master-Prompt State
    const [masterPromptExpanded, setMasterPromptExpanded] = useState(false);
    const [promptEditMode, setPromptEditMode] = useState(false);
    const [promptValue, setPromptValue] = useState(campaign.masterPrompt || '');

    // Campaign Keywords State
    const [campaignKeywords, setCampaignKeywords] = useState(campaign.campaignKeywords || []);
    const [newKeyword, setNewKeyword] = useState('');
    const [addingKeyword, setAddingKeyword] = useState(false);

    const addKeyword = () => {
        if (newKeyword.trim() && !campaignKeywords.includes(newKeyword.trim())) {
            setCampaignKeywords([...campaignKeywords, newKeyword.trim()]);
            setNewKeyword('');
            setAddingKeyword(false);
        }
    };

    const removeKeyword = (kw) => {
        setCampaignKeywords(campaignKeywords.filter(k => k !== kw));
    };

    return (
        <div className="animate-in">
            {/* Back + Title */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/campaigns')}
                    style={{ marginBottom: '16px' }}
                >
                    <ArrowLeft size={16} /> Zurück zu Kampagnen
                </button>

                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div className="page-header-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 className="page-title">{campaign.name}</h1>
                            <span className={`badge ${status.badge}`}>{status.label}</span>
                        </div>
                        <p className="page-subtitle">{campaign.description}</p>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn btn-secondary">
                            <Edit size={16} /> Bearbeiten
                        </button>
                        <button className="btn btn-ghost btn-icon">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Pipeline */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-title" style={{ marginBottom: '16px' }}>Kampagnen-Status</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {statusSteps.map((step, idx) => (
                        <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{
                                height: '6px',
                                borderRadius: 'var(--radius-full)',
                                background: idx <= status.steps ? 'var(--color-primary)' : 'var(--bg-elevated)',
                                marginBottom: '8px',
                                transition: 'background 0.3s',
                            }} />
                            <span style={{
                                fontSize: 'var(--font-size-xs)',
                                color: idx <= status.steps ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                fontWeight: idx === status.steps ? 600 : 400,
                            }}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card info">
                    <span className="stat-card-label">Zeitraum</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                        {new Date(campaign.startDate).toLocaleDateString('de-DE')} – {new Date(campaign.endDate).toLocaleDateString('de-DE')}
                    </span>
                </div>
                <div className="stat-card primary">
                    <span className="stat-card-label">Budget</span>
                    <span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>€{campaign.budget.toLocaleString('de-DE')}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        €{campaign.spent.toLocaleString('de-DE')} ausgegeben ({Math.round(campaign.spent / (campaign.budget || 1) * 100)}%)
                    </span>
                </div>
                <div className="stat-card success">
                    <span className="stat-card-label">Impressionen</span>
                    <span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.impressions.toLocaleString('de-DE')}</span>
                </div>
                <div className="stat-card accent">
                    <span className="stat-card-label">Conversions</span>
                    <span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.conversions.toLocaleString('de-DE')}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        CTR: {campaign.kpis.ctr}%
                    </span>
                </div>
            </div>

            {/* ─── MASTER PROMPT ─── */}
            <div className="card master-prompt-card" style={{ marginBottom: '24px' }}>
                <div className="card-header" style={{ marginBottom: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="master-prompt-icon">
                            <Bot size={16} />
                        </div>
                        <div>
                            <div className="card-title">Master-Prompt</div>
                            <div className="card-subtitle">Allgemeingültige KI-Zusammenfassung & Kontext dieser Kampagne</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setMasterPromptExpanded(!masterPromptExpanded)}
                        >
                            {masterPromptExpanded ? 'Einklappen' : 'Ausklappen'}
                        </button>
                        <button
                            className={`btn btn-sm ${promptEditMode ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => {
                                if (promptEditMode) setPromptEditMode(false);
                                else { setPromptEditMode(true); setMasterPromptExpanded(true); }
                            }}
                        >
                            {promptEditMode ? '✓ Speichern' : <><Edit size={14} /> Bearbeiten</>}
                        </button>
                    </div>
                </div>

                <div style={{
                    marginTop: '16px',
                    maxHeight: masterPromptExpanded ? '2000px' : '80px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease',
                    position: 'relative',
                }}>
                    {promptEditMode ? (
                        <textarea
                            className="form-input form-textarea master-prompt-textarea"
                            value={promptValue}
                            onChange={(e) => setPromptValue(e.target.value)}
                            style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                        />
                    ) : (
                        <div className="master-prompt-content">
                            {promptValue || campaign.masterPrompt || (
                                <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                    Noch kein Master-Prompt definiert. Klicke auf "Bearbeiten" um einen hinzuzufügen.
                                </span>
                            )}
                        </div>
                    )}
                    {!masterPromptExpanded && !promptEditMode && (
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '40px',
                            background: 'linear-gradient(transparent, var(--bg-card))',
                            pointerEvents: 'none',
                        }} />
                    )}
                </div>
            </div>

            {/* ─── ZIELGRUPPEN ─── */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">
                            <Users size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                            Zielgruppen & Avatare
                        </div>
                        <div className="card-subtitle">{linkedAudiences.length} Persona{linkedAudiences.length !== 1 ? 's' : ''} zugewiesen</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/audiences')}>
                        Verwalten
                    </button>
                </div>

                {linkedAudiences.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                        {linkedAudiences.map(audience => (
                            <div key={audience.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '12px',
                                padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                                borderLeft: `3px solid ${audience.color}`,
                            }}>
                                <div className="persona-avatar persona-avatar--sm" style={{ background: audience.color, flexShrink: 0 }}>
                                    {audience.initials}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>{audience.name}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                                        {audience.segment} · {audience.age} J. · {audience.jobTitle}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {audience.preferredChannels.slice(0, 2).map(ch => (
                                            <span key={ch} className="keyword-tag keyword-tag--read" style={{ fontSize: '0.6rem' }}>{ch}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Keine Zielgruppen zugewiesen –{' '}
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/audiences')} style={{ padding: '0 4px' }}>
                            Personas verwalten
                        </button>
                    </div>
                )}
            </div>

            {/* ─── SCHLÜSSELBEGRIFFE ─── */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">
                            <Tag size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                            Schlüsselbegriffe
                        </div>
                        <div className="card-subtitle">Unternehmensweite & kampagnenspezifische Keywords</div>
                    </div>
                </div>

                {/* Unternehmensweite Keywords */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                    }}>
                        <Lock size={11} />
                        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Unternehmensweite Keywords
                        </span>
                        <span style={{ fontSize: '0.6rem', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
                            Read-only
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {companyKeywords.map(kw => (
                            <span key={kw.id} className="keyword-tag keyword-tag--company" title={kw.description}>
                                <Lock size={9} style={{ opacity: 0.6 }} />
                                {kw.term}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                    }}>
                        <Tag size={11} />
                        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Kampagnenspezifische Keywords
                        </span>
                        <span style={{ fontSize: '0.6rem', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                            Editierbar
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {campaignKeywords.map(kw => (
                            <span key={kw} className="keyword-tag keyword-tag--campaign">
                                {kw}
                                <button
                                    onClick={() => removeKeyword(kw)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }}
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                        {addingKeyword ? (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); if (e.key === 'Escape') setAddingKeyword(false); }}
                                    placeholder="Keyword…"
                                    style={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--color-primary)',
                                        borderRadius: 'var(--radius-full)',
                                        padding: '3px 10px',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        width: '140px',
                                    }}
                                />
                                <button className="btn btn-primary btn-sm" onClick={addKeyword} style={{ padding: '4px 10px' }}>+</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setAddingKeyword(false); setNewKeyword(''); }} style={{ padding: '4px 8px' }}>✕</button>
                            </div>
                        ) : (
                            <button
                                className="keyword-tag keyword-tag--add"
                                onClick={() => setAddingKeyword(true)}
                            >
                                <Plus size={10} /> Keyword hinzufügen
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="content-grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Performance-Verlauf</div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="gradPerf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-xs)',
                                    }}
                                />
                                <Area type="monotone" dataKey="impressions" stroke="#6366f1" strokeWidth={2} fill="url(#gradPerf)" name="Impressionen" />
                                <Area type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={2} fill="transparent" name="Klicks" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Conversions pro Tag</div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-xs)',
                                    }}
                                />
                                <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Channels & Tasks */}
            <div className="content-grid-2" style={{ marginTop: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Kanäle</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {campaign.channels.map((ch) => (
                            <div key={ch} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-sm)',
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{ch}</span>
                                <span className="badge badge-success">Verbunden</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Zugehörige Aufgaben</div>
                            <div className="card-subtitle">{campaignTasks.length} Aufgaben</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>Alle</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {campaignTasks.length > 0 ? campaignTasks.map(task => (
                            <div key={task.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-sm)',
                            }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{task.title}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{task.assignee}</div>
                                </div>
                                <span className={`badge ${task.status === 'done' ? 'badge-success' : task.status === 'in-progress' ? 'badge-info' : 'badge-warning'}`}>
                                    {task.status === 'done' ? 'Erledigt' : task.status === 'in-progress' ? 'In Arbeit' : 'Offen'}
                                </span>
                            </div>
                        )) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                Keine Aufgaben verknüpft
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

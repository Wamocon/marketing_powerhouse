import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Users, Edit, MoreVertical, Bot, Tag, Lock, Plus, X,
    ChevronLeft, ChevronRight, Instagram, Youtube, Linkedin, Facebook, Globe,
    Sparkles, Eye, CheckCircle2, Clock, Send, BarChart3, AlertCircle, RefreshCw,
    FileText, Image, Video, MessageSquare, Target, Trash2
} from 'lucide-react';
import { campaigns, audiences, companyKeywords, testUsers, CONTENT_TYPE_COLORS, touchpoints } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useContents, CONTENT_STATUSES } from '../context/ContentContext';
import TaskDetailModal from '../components/TaskDetailModal';
import ContentDetailModal from '../components/ContentDetailModal';
import NewContentModal from '../components/NewContentModal';
import PageHelp from '../components/PageHelp';

// ─── Status Config ───
const statusConfig = {
    active: { label: 'Aktiv', badge: 'badge-success', steps: 3 },
    planned: { label: 'Geplant', badge: 'badge-info', steps: 1 },
    draft: { label: 'Entwurf', badge: 'badge-warning', steps: 0 },
    completed: { label: 'Abgeschlossen', badge: 'badge-primary', steps: 5 },
    paused: { label: 'Pausiert', badge: 'badge-danger', steps: 2 },
};
const statusSteps = ['Entwurf', 'Geplant', 'In Review', 'Aktiv', 'Optimierung', 'Abgeschlossen'];

// ─── Creative Workflow Steps ───
const CREATIVE_STATES = {
    draft: { label: 'Entwurf', color: '#64748b', icon: FileText, step: 0 },
    ai_generating: { label: 'KI generiert…', color: '#f59e0b', icon: Sparkles, step: 1 },
    ai_ready: { label: 'KI-Vorschlag', color: '#8b5cf6', icon: Bot, step: 2 },
    review: { label: 'Im Review', color: '#2563eb', icon: Eye, step: 3 },
    revision: { label: 'Überarbeitung', color: '#f97316', icon: RefreshCw, step: 4 },
    approved: { label: 'Freigegeben', color: '#10b981', icon: CheckCircle2, step: 5 },
    scheduled: { label: 'Eingeplant', color: '#06b6d4', icon: Clock, step: 6 },
    posted: { label: 'Gepostet', color: '#dc2626', icon: Send, step: 7 },
    monitoring: { label: 'Beobachtung', color: '#ec4899', icon: BarChart3, step: 8 },
    analyzed: { label: 'Analysiert', color: '#10b981', icon: Target, step: 9 },
};

const PLATFORM_ICONS = {
    'Instagram': Instagram, 'YouTube': Youtube, 'LinkedIn': Linkedin, 'LinkedIn Ads': Linkedin,
    'Facebook': Facebook, 'Meta Ads': Facebook, 'Google Ads': Globe, 'E-Mail': MessageSquare,
    'Direct Mail': MessageSquare, 'Google Search Ads': Globe,
};

const CREATIVE_TYPES = [
    { value: 'post', label: 'Post', icon: Image },
    { value: 'reel', label: 'Reel/Video', icon: Video },
    { value: 'story', label: 'Story', icon: FileText },
    { value: 'ad', label: 'Anzeige', icon: Target },
    { value: 'email', label: 'E-Mail', icon: MessageSquare },
];

// ─── Mini Calendar Component ───
function MiniCalendar({ startDate, endDate }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const [viewMonth, setViewMonth] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const firstDay = (() => { const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay(); return d === 0 ? 6 : d - 1; })();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isInRange = (day) => {
        if (!day) return false;
        const dt = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
        return dt >= new Date(start.toDateString()) && dt <= new Date(end.toDateString());
    };
    const isStart = (day) => day && new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day).toDateString() === start.toDateString();
    const isEnd = (day) => day && new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day).toDateString() === end.toDateString();

    return (
        <div style={{ fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}><ChevronLeft size={14} /></button>
                <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
                <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}><ChevronRight size={14} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '1px', textAlign: 'center' }}>
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d} style={{ padding: '2px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{d}</div>)}
                {cells.map((day, i) => (
                    <div key={i} style={{
                        padding: '3px', borderRadius: isStart(day) ? '4px 0 0 4px' : isEnd(day) ? '0 4px 4px 0' : '0',
                        background: isInRange(day) ? 'rgba(220,38,38,0.12)' : 'transparent',
                        color: isInRange(day) ? 'var(--color-primary)' : day ? 'var(--text-secondary)' : 'transparent',
                        fontWeight: (isStart(day) || isEnd(day)) ? 700 : 400,
                    }}>{day || '·'}</div>
                ))}
            </div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                <span>📅 {start.toLocaleDateString('de-DE')} – {end.toLocaleDateString('de-DE')}</span>
            </div>
        </div>
    );
}

// ─── Creative Card ───
function CreativeCard({ creative, onStatusChange, onAnalyze, onClick }) {
    const st = CREATIVE_STATES[creative.status];
    const Icon = st.icon;
    const PlatIcon = PLATFORM_ICONS[creative.platform] || Globe;

    return (
        <div onClick={onClick} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
            padding: '16px', borderLeft: `3px solid ${st.color}`, transition: 'all 0.2s', cursor: 'pointer'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>{creative.title}</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        <PlatIcon size={12} />
                        <span>{creative.platform || 'Alle Plattformen'}</span>
                        <span>·</span>
                        <span>{creative.type}</span>
                    </div>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 600,
                    background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}33`,
                }}><Icon size={10} /> {st.label}</span>
            </div>

            {creative.description && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                    {creative.description.length > 120 ? creative.description.slice(0, 120) + '…' : creative.description}
                </div>
            )}

            {creative.aiSuggestion && (creative.status === 'ai_ready' || creative.status === 'review') && (
                <div style={{ padding: '8px 10px', background: 'rgba(139,92,246,0.06)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', fontSize: '0.7rem', color: 'var(--text-secondary)', borderLeft: '2px solid #8b5cf6' }}>
                    <strong style={{ color: '#8b5cf6' }}>🤖 KI-Vorschlag:</strong> {creative.aiSuggestion.slice(0, 150)}…
                </div>
            )}

            {creative.publishDate && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>📅 Geplant: {new Date(creative.publishDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            )}

            {creative.status === 'monitoring' && creative.performance && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                    {[{ l: 'Impressions', v: creative.performance.impressions }, { l: 'Clicks', v: creative.performance.clicks }, { l: 'CTR', v: creative.performance.ctr + '%' }].map(m => (
                        <div key={m.l} style={{ padding: '6px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{m.l}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{m.v.toLocaleString?.('de-DE') || m.v}</div>
                        </div>
                    ))}
                </div>
            )}

            {creative.analysisResult && (
                <div style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '0.7rem',
                    background: creative.analysisResult.verdict === 'good' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    borderLeft: `2px solid ${creative.analysisResult.verdict === 'good' ? '#10b981' : '#ef4444'}`,
                }}>
                    <strong>{creative.analysisResult.verdict === 'good' ? '✅ Gute Performance' : '⚠️ Optimierungsbedarf'}</strong>
                    <div style={{ marginTop: '2px' }}>{creative.analysisResult.text}</div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {creative.status === 'draft' && <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'ai_generating'); }}><Sparkles size={12} /> KI-Vorschlag</button>}
                {creative.status === 'ai_generating' && <button className="btn btn-sm" style={{ background: '#f59e0b22', color: '#f59e0b' }} disabled onClick={e => e.stopPropagation()}><RefreshCw size={12} className="spin" /> Generiert…</button>}
                {creative.status === 'ai_ready' && <button className="btn btn-sm" style={{ background: '#2563eb18', color: '#2563eb' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'review'); }}><Eye size={12} /> Review starten</button>}
                {creative.status === 'review' && (
                    <>
                        <button className="btn btn-sm" style={{ background: '#10b98118', color: '#10b981' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'approved'); }}><CheckCircle2 size={12} /> Freigeben</button>
                        <button className="btn btn-sm" style={{ background: '#f9731618', color: '#f97316' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'revision'); }}><RefreshCw size={12} /> Zurück an KI</button>
                    </>
                )}
                {creative.status === 'revision' && <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'ai_generating'); }}><Sparkles size={12} /> Erneut generieren</button>}
                {creative.status === 'approved' && <button className="btn btn-sm" style={{ background: '#06b6d418', color: '#06b6d4' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'scheduled'); }}><Clock size={12} /> Einplanen</button>}
                {creative.status === 'scheduled' && <button className="btn btn-sm" style={{ background: '#dc262618', color: '#dc2626' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'posted'); }}><Send size={12} /> Posten</button>}
                {creative.status === 'posted' && <button className="btn btn-sm" style={{ background: '#ec489918', color: '#ec4899' }} onClick={(e) => { e.stopPropagation(); onStatusChange(creative.id, 'monitoring'); }}><BarChart3 size={12} /> Beobachtung</button>}
                {creative.status === 'monitoring' && <button className="btn btn-sm" style={{ background: '#10b98118', color: '#10b981' }} onClick={(e) => { e.stopPropagation(); onAnalyze(creative.id); }}><Target size={12} /> Analyse</button>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function CampaignDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = useAuth();
    const canDelete = can('canDeleteItems');
    const campaign = campaigns.find(c => c.id === id) || campaigns[0];
    const status = statusConfig[campaign.status];
    const linkedAudiences = audiences.filter(a => campaign.targetAudiences?.includes(a.id));

    // ─── Tabs ───
    const [activeTab, setActiveTab] = useState('overview');

    // ─── Master Prompt ───
    const [masterPromptExpanded, setMasterPromptExpanded] = useState(false);
    const [promptEditMode, setPromptEditMode] = useState(false);
    const [promptValue, setPromptValue] = useState(campaign.masterPrompt || '');

    // ─── Keywords ───
    const [kwList, setKwList] = useState(campaign.campaignKeywords || []);
    const [newKw, setNewKw] = useState('');
    const [addingKw, setAddingKw] = useState(false);

    // ─── Creatives / Aufgaben ───
    const { tasks, addTask, updateTaskStatus, analyzeTask } = useTasks();
    const { contents } = useContents();
    const creatives = tasks.filter(t => t.campaignId === id);
    const campaignContents = contents.filter(c => c.campaignId === id);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedCampaignContent, setSelectedCampaignContent] = useState(null);
    const [showNewCampaignContent, setShowNewCampaignContent] = useState(false);

    const [showNewCreativeModal, setShowNewCreativeModal] = useState(false);
    const [newCreative, setNewCreative] = useState({ title: '', platform: '', type: 'Post', description: '', scope: 'single' });

    // ─── Handlers ───
    const handleStatusChange = (creativeId, newStatus) => {
        updateTaskStatus(creativeId, newStatus);
    };

    const handleAnalyze = (creativeId) => {
        analyzeTask(creativeId);
    };
    const handleAddCreative = () => {
        if (!newCreative.title.trim()) return;
        addTask({
            ...newCreative,
            platform: newCreative.scope === 'all' ? null : newCreative.platform,
            status: 'draft',
            assignee: testUsers[3]?.name || 'Unzugewiesen',
            author: 'Anna Schmidt', // Mock author
            campaignId: id,
            dueDate: new Date().toISOString().split('T')[0],
            publishDate: null,
            oneDriveLink: '',
            performance: null, aiSuggestion: null, analysisResult: null,
        });
        setNewCreative({ title: '', platform: '', type: 'Post', description: '', scope: 'single' });
        setShowNewCreativeModal(false);
    };

    const addKeyword = () => { if (newKw.trim() && !kwList.includes(newKw.trim())) { setKwList([...kwList, newKw.trim()]); setNewKw(''); setAddingKw(false); } };

    // ─── Derived ───
    const singlePlatformCreatives = creatives.filter(c => c.scope === 'single');
    const allPlatformCreatives = creatives.filter(c => c.scope === 'all');

    // ═══════════════════ RENDER ═══════════════════
    return (
        <div className="animate-in">
            {/* Back + Title */}
            <div style={{ marginBottom: '24px' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/campaigns')} style={{ marginBottom: '16px' }}>
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
                        <PageHelp title="Kampagnen-Details">
                            <p style={{ marginBottom: '12px' }}>Die Detailansicht einer Kampagne bündelt alle relevanten Workstreams zu diesem Projekt.</p>
                            <ul className="help-list">
                                <li><strong>Übersicht:</strong> Eine Zusammenfassung der zugehörigen Zielgruppen, SEO-Keywords, sowie des Timings und der Zielsetzung der Kampagne.</li>
                                <li><strong>Creatives & Aufgaben (Workflow):</strong> Hier siehst du das Mini-Kanban Board exklusiv für diese Kampagne. Ideal für Manager, um die Design-Realisierung zu überwachen.</li>
                                <li><strong>Content (Redaktion):</strong> Hier siehst du alle geplanten Beiträge (Social Media, Blog, E-Mail) für diese Kampagne. Verknüpfe direkt Content mit den dazugehörigen Aufgaben.</li>
                                <li><strong>Performance:</strong> Analytics und Spendings-Tracking speziell heruntergebrochen auf die laufende Kampagne.</li>
                            </ul>
                        </PageHelp>
                        {canDelete && (
                            <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => {
                                if (window.confirm('Möchtest du diese Kampagne wirklich löschen?')) {
                                    navigate('/campaigns');
                                }
                            }}>
                                <Trash2 size={16} /> Löschen
                            </button>
                        )}
                        <button className="btn btn-secondary"><Edit size={16} /> Bearbeiten</button>
                        <button className="btn btn-ghost btn-icon"><MoreVertical size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Status Pipeline */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-title" style={{ marginBottom: '16px' }}>Kampagnen-Status</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {statusSteps.map((step, idx) => (
                        <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: idx <= status.steps ? 'var(--color-primary)' : 'var(--bg-active)', marginBottom: '8px' }} />
                            <span style={{ fontSize: 'var(--font-size-xs)', color: idx <= status.steps ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: idx === status.steps ? 600 : 400 }}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '24px' }}>
                {[{ id: 'overview', label: 'Übersicht' }, { id: 'creatives', label: `Creatives & Aufgaben (${creatives.length})` }, { id: 'content', label: `Content (${campaignContents.length})` }, { id: 'performance', label: 'Performance' }].map(t => (
                    <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {/* ═══ TAB: OVERVIEW ═══ */}
            {activeTab === 'overview' && (
                <>
                    {/* Info Cards + Mini Calendar */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div className="stat-card primary"><span className="stat-card-label">Budget</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>€{campaign.budget.toLocaleString('de-DE')}</span><span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>€{campaign.spent.toLocaleString('de-DE')} ausgegeben ({Math.round(campaign.spent / (campaign.budget || 1) * 100)}%)</span></div>
                                <div className="stat-card success"><span className="stat-card-label">Impressionen</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.impressions.toLocaleString('de-DE')}</span></div>
                                <div className="stat-card info"><span className="stat-card-label">Clicks</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.clicks.toLocaleString('de-DE')}</span></div>
                                <div className="stat-card warning"><span className="stat-card-label">CTR</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.ctr}%</span></div>
                            </div>

                            <div className="card">
                                <div className="card-title" style={{ marginBottom: '12px' }}>Verknüpfte Kanäle & Touchpoints</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {(campaign.touchpointIds || []).map(tpId => {
                                        const tp = touchpoints.find(t => t.id === tpId);
                                        if (!tp) return null;
                                        const ChIcon = PLATFORM_ICONS[tp.name] || PLATFORM_ICONS[tp.type] || Globe;
                                        return (
                                            <div
                                                key={tpId}
                                                onClick={() => navigate('/touchpoints', { state: { selectedTpId: tpId } })}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 16px',
                                                    background: 'var(--bg-hover)',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--border-color)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <ChIcon size={16} style={{ color: 'var(--color-primary)' }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{tp.name}</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{tp.type}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!campaign.touchpointIds || campaign.touchpointIds.length === 0) && campaign.channels.map(ch => {
                                        const ChIcon = PLATFORM_ICONS[ch] || Globe;
                                        return (
                                            <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                                <ChIcon size={16} style={{ color: 'var(--color-primary)' }} />
                                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{ch}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: '12px' }}><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />Kampagnenzeitraum</div>
                            <MiniCalendar startDate={campaign.startDate} endDate={campaign.endDate} />
                        </div>
                    </div>

                    {/* Master Prompt */}
                    <div className="card" style={{ marginBottom: '24px', borderLeft: '3px solid #8b5cf6' }}>
                        <div className="card-header" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bot size={18} style={{ color: '#8b5cf6' }} />
                                <div><div className="card-title">Master-Prompt</div><div className="card-subtitle">KI-Kontext für alle Creatives dieser Kampagne</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setMasterPromptExpanded(!masterPromptExpanded)}>{masterPromptExpanded ? 'Einklappen' : 'Ausklappen'}</button>
                                {can('canEditCampaigns') && <button className={`btn btn-sm ${promptEditMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { if (promptEditMode) setPromptEditMode(false); else { setPromptEditMode(true); setMasterPromptExpanded(true); } }}>{promptEditMode ? '✓ Speichern' : <><Edit size={14} /> Bearbeiten</>}</button>}
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', maxHeight: masterPromptExpanded ? '2000px' : '80px', overflow: 'hidden', transition: 'max-height 0.4s ease', position: 'relative' }}>
                            {promptEditMode
                                ? <textarea className="form-input form-textarea" value={promptValue} onChange={e => setPromptValue(e.target.value)} style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }} />
                                : <div style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{promptValue}</div>
                            }
                            {!masterPromptExpanded && !promptEditMode && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--bg-surface))', pointerEvents: 'none' }} />}
                        </div>
                    </div>

                    {/* Zielgruppen & Keywords side-by-side */}
                    <div className="content-grid-2">
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: '12px' }}><Users size={14} style={{ display: 'inline', marginRight: '6px' }} />Zielgruppen ({linkedAudiences.length})</div>
                            {linkedAudiences.map(a => (
                                <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${a.color}`, marginBottom: '8px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{a.initials}</div>
                                    <div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{a.name}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{a.segment} · {a.age} · {a.jobTitle}</div></div>
                                </div>
                            ))}
                        </div>
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: '12px' }}><Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />Schlüsselbegriffe</div>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}><Lock size={10} style={{ display: 'inline', marginRight: '4px' }} />Unternehmensweit</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{companyKeywords.map(k => <span key={k.id} className="keyword-tag keyword-tag--company" style={{ fontSize: '0.65rem' }}><Lock size={8} style={{ opacity: .5 }} /> {k.term}</span>)}</div>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Kampagnenspezifisch</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {kwList.map(kw => <span key={kw} className="keyword-tag keyword-tag--campaign" style={{ fontSize: '0.65rem' }}>{kw} <button onClick={() => setKwList(kwList.filter(k => k !== kw))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={8} /></button></span>)}
                                    {addingKw ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <input autoFocus value={newKw} onChange={e => setNewKw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addKeyword(); if (e.key === 'Escape') setAddingKw(false); }} placeholder="Keyword…" style={{ background: 'var(--bg-hover)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: '0.65rem', color: 'var(--text-primary)', outline: 'none', width: '100px' }} />
                                            <button className="btn btn-primary btn-sm" onClick={addKeyword} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>+</button>
                                        </div>
                                    ) : <button onClick={() => setAddingKw(true)} className="keyword-tag keyword-tag--add" style={{ fontSize: '0.65rem' }}><Plus size={8} /> Hinzufügen</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ TAB: CREATIVES ═══ */}
            {activeTab === 'creatives' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Creatives & Aufgaben</h2>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Erstelle, reviewe und veröffentliche Inhalte für diese Kampagne</p>
                        </div>
                        {can('canCreateCampaignTasks') && <button className="btn btn-primary" onClick={() => setShowNewCreativeModal(true)}><Plus size={16} /> Neues Creative</button>}
                    </div>

                    {/* Workflow Legend */}
                    <div className="card" style={{ marginBottom: '20px', padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '8px' }}>CREATIVE WORKFLOW</div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {Object.entries(CREATIVE_STATES).map(([key, s], i) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: `${s.color}18`, color: s.color, fontWeight: 600 }}>{s.label}</span>
                                    {i < Object.keys(CREATIVE_STATES).length - 1 && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>→</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* All-Platform Creatives */}
                    {allPlatformCreatives.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> Übergreifende Aufgaben (alle Plattformen)</div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {allPlatformCreatives.map(c => <CreativeCard key={c.id} creative={c} onStatusChange={handleStatusChange} onAnalyze={handleAnalyze} onClick={() => setSelectedTask(c)} />)}
                            </div>
                        </div>
                    )}

                    {/* Per-Platform Creatives */}
                    {campaign.channels.map(ch => {
                        const platformCreatives = singlePlatformCreatives.filter(c => c.platform === ch);
                        if (platformCreatives.length === 0) return null;
                        const ChIcon = PLATFORM_ICONS[ch] || Globe;
                        return (
                            <div key={ch} style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><ChIcon size={14} /> {ch}</div>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {platformCreatives.map(c => <CreativeCard key={c.id} creative={c} onStatusChange={handleStatusChange} onAnalyze={handleAnalyze} onClick={() => setSelectedTask(c)} />)}
                                </div>
                            </div>
                        );
                    })}

                    {creatives.length === 0 && (
                        <div className="card"><div className="empty-state"><div className="empty-state-icon">🎨</div><div className="empty-state-title">Noch keine Creatives</div><div className="empty-state-text">Erstelle dein erstes Creative, um den KI-gestützten Workflow zu starten.</div></div></div>
                    )}
                </>
            )}

            {/* ═══ TAB: CONTENT ═══ */}
            {activeTab === 'content' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>Kampagnen-Content ({campaignContents.length})</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowNewCampaignContent(true)}>
                            <Plus size={14} /> Content hinzufügen
                        </button>
                    </div>
                    {campaignContents.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">📄</div>
                                <div className="empty-state-title">Noch kein Content</div>
                                <div className="empty-state-text">Erstelle Content-Einträge für diese Kampagne, um die Redaktionsplanung zu starten.</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                            {campaignContents.map(cnt => {
                                const cst = CONTENT_STATUSES[cnt.status];
                                const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                                return (
                                    <div key={cnt.id} className="card" onClick={() => setSelectedCampaignContent(cnt)} style={{
                                        cursor: 'pointer', padding: '16px', transition: 'all 0.2s',
                                        borderLeft: hasTasks ? `3px solid ${cst?.color}` : '3px solid #ef4444',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{cnt.title}</div>
                                            <span className="badge" style={{ background: `${cst?.color}18`, color: cst?.color, border: `1px solid ${cst?.color}33`, fontSize: '0.65rem', flexShrink: 0 }}>
                                                {cst?.icon} {cst?.label}
                                            </span>
                                        </div>
                                        {cnt.description && (
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                                                {cnt.description.length > 80 ? cnt.description.slice(0, 80) + '…' : cnt.description}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                            <span className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || 'info'}`} style={{ fontSize: '0.6rem' }}>{cnt.platform}</span>
                                            {hasTasks ? (
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>✅ {cnt.taskIds.length} Aufgabe(n)</span>
                                            ) : (
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: '#ef4444', fontWeight: 600 }}>⚠ Keine Aufgaben</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {selectedCampaignContent && (
                        <ContentDetailModal content={selectedCampaignContent} onClose={() => setSelectedCampaignContent(null)} />
                    )}
                    {showNewCampaignContent && (
                        <NewContentModal onClose={() => setShowNewCampaignContent(false)} defaultCampaignId={id} />
                    )}
                </>
            )}

            {/* ═══ TAB: PERFORMANCE ═══ */}
            {activeTab === 'performance' && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <div className="empty-state-title">Performance-Dashboard</div>
                        <div className="empty-state-text">Detaillierte Performance-Auswertung wird nach Backend-Integration verfügbar. Nutze den Creative-Workflow um einzelne Creatives zu beobachten und zu analysieren.</div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL: New Creative ═══ */}
            {showNewCreativeModal && (
                <div className="modal-overlay" onClick={() => setShowNewCreativeModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Neues Creative erstellen</div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowNewCreativeModal(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Titel *</label>
                                <input className="form-input" placeholder="z.B. Instagram Reel: Kursvorstellung" value={newCreative.title} onChange={e => setNewCreative({ ...newCreative, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Umfang</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className={`btn btn-sm ${newCreative.scope === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNewCreative({ ...newCreative, scope: 'all', platform: '' })}><Globe size={14} /> Übergreifend</button>
                                    <button className={`btn btn-sm ${newCreative.scope === 'single' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNewCreative({ ...newCreative, scope: 'single' })}><Target size={14} /> Einzelne Plattform</button>
                                </div>
                            </div>
                            {newCreative.scope === 'single' && (
                                <div className="form-group">
                                    <label className="form-label">Plattform</label>
                                    <select className="form-input" value={newCreative.platform} onChange={e => setNewCreative({ ...newCreative, platform: e.target.value })}>
                                        <option value="">Bitte wählen…</option>
                                        {campaign.channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Typ</label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {CREATIVE_TYPES.map(t => (
                                        <button key={t.value} className={`btn btn-sm ${newCreative.type === t.label ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNewCreative({ ...newCreative, type: t.label })}>
                                            <t.icon size={14} /> {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Beschreibung / Briefing</label>
                                <textarea className="form-input form-textarea" placeholder="Beschreibe das gewünschte Creative..." value={newCreative.description} onChange={e => setNewCreative({ ...newCreative, description: e.target.value })} style={{ minHeight: '100px' }} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowNewCreativeModal(false)}>Abbrechen</button>
                            <button className="btn btn-primary" onClick={handleAddCreative} disabled={!newCreative.title.trim()}>
                                <Plus size={16} /> Creative erstellen
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
}

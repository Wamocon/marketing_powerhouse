import { useState } from 'react';
import type { Task, ContentItem } from '../types';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Calendar, Users, Edit, MoreVertical, Bot, Tag, Lock, Plus, X,
    ChevronLeft, ChevronRight, Instagram, Youtube, Linkedin, Facebook, Globe,
    Sparkles, Eye, CheckCircle2, Clock, Send, BarChart3, AlertCircle, RefreshCw,
    FileText, Image, Video, MessageSquare, Target, Trash2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CONTENT_TYPE_COLORS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useContents, CONTENT_STATUSES } from '../context/ContentContext';
import TaskDetailModal from '../components/TaskDetailModal';
import ContentDetailModal from '../components/ContentDetailModal';
import NewContentModal from '../components/NewContentModal';
import PageHelp from '../components/PageHelp';
import ChannelKpiSection from '../components/ChannelKpiSection';
import { statusConfig, statusSteps, CREATIVE_STATES, PLATFORM_ICONS, CREATIVE_TYPES, MiniCalendar, CreativeCard } from '../components/CampaignDetailComponents';

import { CampaignOverviewTab, NewCreativeModal } from '../components/CampaignDetailTabs';
// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function CampaignDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { can } = useAuth();
    const { campaigns, audiences, users: testUsers, touchpoints, deleteCampaign, loading } = useData();
    const canDelete = can('canDeleteItems');
    const campaign = campaigns.find(c => c.id === id);
    const status = campaign ? statusConfig[campaign.status] : statusConfig.planned;
    const linkedAudiences = audiences.filter(a => campaign?.targetAudiences?.includes(a.id));

    // ─── Tabs ───
    const [activeTab, setActiveTab] = useState('overview');

    // ─── Master Prompt ───
    const [masterPromptExpanded, setMasterPromptExpanded] = useState(false);
    const [promptEditMode, setPromptEditMode] = useState(false);
    const [promptValue, setPromptValue] = useState(campaign?.masterPrompt || '');

    // ─── Keywords ───
    const [kwList, setKwList] = useState(campaign?.campaignKeywords || []);
    const [newKw, setNewKw] = useState('');
    const [addingKw, setAddingKw] = useState(false);

    // ─── Creatives / Aufgaben ───
    const { tasks, addTask, updateTaskStatus, analyzeTask } = useTasks();
    const { contents } = useContents();
    const creatives = tasks.filter(t => t.campaignId === id);
    const campaignContents = contents.filter(c => c.campaignId === id);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedCampaignContent, setSelectedCampaignContent] = useState<ContentItem | null>(null);
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
            status: 'draft' as import('../types').TaskStatus,
            assignee: testUsers[3]?.name || 'Unzugewiesen',
            author: 'Anna Schmidt', // Mock author
            campaignId: id || null,
            dueDate: new Date().toISOString().split('T')[0],
            publishDate: null,
            oneDriveLink: '',
            touchpointId: undefined,
            performance: null, aiSuggestion: undefined, analysisResult: null,
        });
        setNewCreative({ title: '', platform: '', type: 'Post', description: '', scope: 'single' });
        setShowNewCreativeModal(false);
    };

    const addKeyword = () => { if (newKw.trim() && !kwList.includes(newKw.trim())) { setKwList([...kwList, newKw.trim()]); setNewKw(''); setAddingKw(false); } };

    // ─── Derived ───
    const singlePlatformCreatives = creatives.filter(c => c.scope === 'single');
    const allPlatformCreatives = creatives.filter(c => c.scope === 'all');

    // ═══════════════════ RENDER ═══════════════════
    if (loading) {
        return (
            <div className="animate-in">
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div className="empty-state-icon">⏳</div>
                    <div className="empty-state-title">Kampagne wird geladen…</div>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="animate-in">
                <button className="btn btn-ghost" onClick={() => router.push('/campaigns')} style={{ marginBottom: '16px' }}>
                    <ArrowLeft size={16} /> Zurück zu Kampagnen
                </button>
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">Kampagne nicht gefunden</div>
                    <div className="empty-state-text">Die Kampagne mit der ID „{id}" existiert nicht.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            {/* Back + Title */}
            <div style={{ marginBottom: '24px' }}>
                <button className="btn btn-ghost" onClick={() => router.push('/campaigns')} style={{ marginBottom: '16px' }}>
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
                                <li><strong>Manager & Team:</strong> Jede Kampagne zeigt den verantwortlichen Manager und die eingeplanten Team-Mitglieder. So ist auf einen Blick klar, wer die Kampagne leitet und wer daran arbeitet.</li>
                                <li><strong>Creatives & Aufgaben (Workflow):</strong> Hier siehst du das Mini-Kanban Board exklusiv für diese Kampagne. Ideal für Manager, um die Design-Realisierung zu überwachen.</li>
                                <li><strong>Content (Redaktion):</strong> Hier siehst du alle geplanten Beiträge (Social Media, Blog, E-Mail) für diese Kampagne. Verknüpfe direkt Content mit den dazugehörigen Aufgaben.</li>
                                <li><strong>Performance:</strong> Analytics und Spendings-Tracking speziell heruntergebrochen auf die laufende Kampagne. Die <strong>Kanal-KPIs</strong> zeigen Impressionen, Clicks, CTR, Conversions, Spend, CPC und CPA pro verknüpftem Touchpoint/Kanal – so siehst du auf einen Blick, welcher Kanal am besten performt.</li>
                            </ul>
                        </PageHelp>
                        {canDelete && (
                            <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={async () => {
                                if (window.confirm('Möchtest du diese Kampagne wirklich löschen?')) {
                                    await deleteCampaign(campaign.id);
                                    router.push('/campaigns');
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
                <CampaignOverviewTab
                    campaign={campaign}
                    linkedAudiences={linkedAudiences}
                    navigate={router.push}
                    can={can}
                    kwList={kwList}
                    setKwList={setKwList}
                    newKw={newKw}
                    setNewKw={setNewKw}
                    addingKw={addingKw}
                    setAddingKw={setAddingKw}
                    addKeyword={addKeyword}
                    masterPromptExpanded={masterPromptExpanded}
                    setMasterPromptExpanded={setMasterPromptExpanded}
                    promptEditMode={promptEditMode}
                    setPromptEditMode={setPromptEditMode}
                    promptValue={promptValue}
                    setPromptValue={setPromptValue}
                />
            )}
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
                <>
                    {/* Aggregate KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        <div className="stat-card success"><span className="stat-card-label">Impressionen</span><span className="stat-card-value">{campaign.kpis.impressions.toLocaleString('de-DE')}</span></div>
                        <div className="stat-card info"><span className="stat-card-label">Clicks</span><span className="stat-card-value">{campaign.kpis.clicks.toLocaleString('de-DE')}</span></div>
                        <div className="stat-card warning"><span className="stat-card-label">Conversions</span><span className="stat-card-value">{campaign.kpis.conversions.toLocaleString('de-DE')}</span></div>
                        <div className="stat-card primary"><span className="stat-card-label">CTR</span><span className="stat-card-value">{campaign.kpis.ctr}%</span></div>
                    </div>

                    {/* Channel KPI Breakdown */}
                    {campaign.channelKpis && Object.keys(campaign.channelKpis).length > 0 ? (
                        <div className="card" style={{ padding: '20px' }}>
                            <ChannelKpiSection
                                channelKpis={campaign.channelKpis}
                                touchpoints={touchpoints}
                                title="Performance nach Kanal / Touchpoint"
                            />
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">📊</div>
                                <div className="empty-state-title">Keine Kanal-KPIs</div>
                                <div className="empty-state-text">Für diese Kampagne liegen noch keine kanalspezifischen Performance-Daten vor.</div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══ MODAL: New Creative ═══ */}
            {showNewCreativeModal && (
                <NewCreativeModal
                    campaign={campaign}
                    newCreative={newCreative}
                    setNewCreative={setNewCreative}
                    onClose={() => setShowNewCreativeModal(false)}
                    onSubmit={handleAddCreative}
                />
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw, Zap, Send, Sparkles,
    CheckCircle2, AlertTriangle, XCircle, Loader2,
    Linkedin, Instagram, Clock, Image as ImageIcon,
    Radio, Eye, ThumbsUp, ThumbsDown, X, Hash,
    MessageSquare, ExternalLink, Filter, Search,
    Link2, AlertCircle, Shield, PlayCircle,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PageHelp from '../components/PageHelp';
import {
    checkSocialHubHealth,
    getReadiness,
    listPosts,
    getPostDetail,
    approvePost,
    rejectPost,
    publishPost,
    getConnectedAccounts,
    generateAiPost,
    subscribeToPostChanges,
    SOCIAL_HUB_URL,
    type ReadinessResult,
    type ScheduledPost,
    type PostDetail,
    type ConnectedAccount,
} from '../lib/socialHub';

// ─── Constants ─────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Entwurf', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    scheduled: { label: 'Geplant', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    approved: { label: 'Freigegeben', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    publishing: { label: 'Wird veröffentlicht…', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    published: { label: 'Veröffentlicht', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    failed: { label: 'Fehlgeschlagen', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    rejected: { label: 'Abgelehnt', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const STATE_ICON: Record<string, typeof CheckCircle2> = {
    ready: CheckCircle2, warn: AlertTriangle, issue: XCircle,
};
const STATE_COLOR: Record<string, string> = {
    ready: 'var(--color-success)', warn: 'var(--color-warning)', issue: 'var(--color-danger)',
};

const PLATFORM_ICON: Record<string, typeof Linkedin> = {
    linkedin: Linkedin, instagram: Instagram,
};

const TOKEN_STATUS_MAP: Record<string, { label: string; color: string }> = {
    ok: { label: 'Verbunden', color: 'var(--color-success)' },
    expiring_soon: { label: 'Läuft bald ab', color: 'var(--color-warning)' },
    expired: { label: 'Abgelaufen', color: 'var(--color-danger)' },
};

// ─── Component ─────────────────────────────────────────────

export default function SocialHubPage() {
    const { activeCompany } = useCompany();
    const { currentUser } = useAuth();
    const { language } = useLanguage();
    const t = language === 'en';

    // Data state
    const [health, setHealth] = useState<Record<string, unknown> | null>(null);
    const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'generate' | 'accounts'>('overview');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Generate state
    const [genTopic, setGenTopic] = useState('');
    const [genPlatform, setGenPlatform] = useState<'linkedin' | 'instagram'>('linkedin');
    const [generating, setGenerating] = useState(false);
    const [genResult, setGenResult] = useState<{ post_id: string; topic: string; platform: string } | null>(null);

    // Action state
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const companyId = activeCompany?.id || '';
    const isOnline = health?.status === 'ok' || health?.status === 'degraded';

    // ─── Data Loading ──────────────────────────────────────

    const loadData = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const [healthRes, readinessRes, postsRes, accountsRes] = await Promise.allSettled([
                checkSocialHubHealth(),
                getReadiness(companyId),
                listPosts(companyId),
                getConnectedAccounts(companyId),
            ]);
            if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
            if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value);
            if (postsRes.status === 'fulfilled') setPosts(postsRes.value);
            if (accountsRes.status === 'fulfilled') setAccounts(accountsRes.value);

            if (healthRes.status === 'rejected') {
                setError(t
                    ? 'Social Hub service is not reachable behind the app route. Make sure the shared dev server is running.'
                    : 'Der Social-Hub-Service ist über die App-Route nicht erreichbar. Stelle sicher, dass der gemeinsame Dev-Start läuft.');
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Connection failed');
        } finally {
            setLoading(false);
        }
    }, [companyId, t]);

    useEffect(() => { loadData(); }, [loadData]);

    // Real-time subscription: auto-refresh when scheduled_posts change
    useEffect(() => {
        if (!companyId) return;
        const unsubscribe = subscribeToPostChanges(companyId, () => {
            // Refresh posts list silently (no loading spinner)
            listPosts(companyId).then(setPosts).catch(() => {});
        });
        return unsubscribe;
    }, [companyId]);

    // ─── Post Detail ───────────────────────────────────────

    const openPostDetail = async (postId: string) => {
        setDetailLoading(true);
        try {
            const detail = await getPostDetail(companyId, postId);
            setSelectedPost(detail);
        } catch {
            setSelectedPost(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closePostDetail = () => setSelectedPost(null);

    // ─── Actions ───────────────────────────────────────────

    const handleApprove = async (postId: string) => {
        if (!currentUser?.id) return;
        setActionLoading(postId);
        try {
            await approvePost(companyId, postId, currentUser.id);
            if (selectedPost?.id === postId) {
                const updated = await getPostDetail(companyId, postId);
                setSelectedPost(updated);
            }
            await loadData();
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (postId: string, notes?: string) => {
        if (!currentUser?.id) return;
        setActionLoading(postId);
        try {
            await rejectPost(companyId, postId, currentUser.id, notes);
            if (selectedPost?.id === postId) {
                const updated = await getPostDetail(companyId, postId);
                setSelectedPost(updated);
            }
            await loadData();
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublish = async (postId: string) => {
        setActionLoading(postId);
        try {
            await publishPost(companyId, postId);
            if (selectedPost?.id === postId) {
                const updated = await getPostDetail(companyId, postId);
                setSelectedPost(updated);
            }
            await loadData();
        } finally {
            setActionLoading(null);
        }
    };

    const handleGenerate = async () => {
        if (!genTopic.trim()) return;
        setGenerating(true);
        setGenResult(null);
        try {
            const result = await generateAiPost({
                companyId,
                platform: genPlatform,
                topic: genTopic,
            });
            setGenResult(result);
            setGenTopic('');
            await loadData();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    // ─── Filtering ─────────────────────────────────────────

    const filteredPosts = posts.filter(p => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (p.topic?.toLowerCase().includes(q) || p.post_text?.toLowerCase().includes(q));
        }
        return true;
    });

    // ─── Derived ───────────────────────────────────────────

    const scoreColor = (readiness?.score ?? 0) >= 80 ? 'var(--color-success)' : (readiness?.score ?? 0) >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const approvedCount = posts.filter(p => p.status === 'approved' || p.status === 'scheduled').length;
    const publishedCount = posts.filter(p => p.status === 'published').length;

    // ─── Empty State ───────────────────────────────────────

    if (!activeCompany) {
        return (
            <div className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ textAlign: 'center', padding: '48px', maxWidth: '420px' }}>
                    <Radio size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
                    <h2 style={{ marginBottom: '8px' }}>{t ? 'No project selected' : 'Kein Projekt ausgewählt'}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {t ? 'Select a project to use the Social Hub.' : 'Wähle zuerst ein Projekt aus, um den Social Hub zu nutzen.'}
                    </p>
                </div>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────

    return (
        <div className="animate-in">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Radio size={24} style={{ color: 'var(--color-primary)' }} />
                        Social Hub
                    </h1>
                    <p className="page-subtitle">
                        {t ? 'AI-powered social media publishing for LinkedIn & Instagram' : 'KI-gestützte Social-Media-Veröffentlichung für LinkedIn & Instagram'}
                    </p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Social Hub">
                        <p style={{ marginBottom: '12px' }}>
                            {t
                                ? 'The Social Hub is your central hub for AI-generated social media posts. It connects to your LinkedIn and Instagram accounts.'
                                : 'Der Social Hub ist deine Zentrale für KI-generierte Social-Media-Posts. Er verbindet sich automatisch mit deinen LinkedIn- und Instagram-Accounts.'}
                        </p>
                        <ul className="help-list">
                            <li><strong>{t ? 'Overview' : 'Übersicht'}:</strong> {t ? 'System status, readiness score and stats' : 'Systemstatus, Readiness-Score und Statistiken'}</li>
                            <li><strong>Posts:</strong> {t ? 'Review, approve and publish posts' : 'Posts prüfen, freigeben und veröffentlichen'}</li>
                            <li><strong>{t ? 'Generate' : 'Generieren'}:</strong> {t ? 'Create new AI posts' : 'Neue KI-Posts erstellen'}</li>
                            <li><strong>Accounts:</strong> {t ? 'Connected account status' : 'Status der verbundenen Accounts'}</li>
                        </ul>
                    </PageHelp>
                    <button className="btn btn-ghost" onClick={loadData} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        {t ? 'Refresh' : 'Aktualisieren'}
                    </button>
                </div>
            </div>

            {/* Connection Status Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', marginBottom: '24px', borderRadius: 'var(--radius-md)',
                background: isOnline ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
                    boxShadow: isOnline ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
                }} />
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: isOnline ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isOnline ? (t ? 'Social Hub Connected' : 'Social Hub verbunden') : (t ? 'Social Hub Offline' : 'Social Hub offline')}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                    {accounts.length} {t ? 'accounts connected' : 'Accounts verbunden'}
                </span>
            </div>

            {error && (
                <div style={{
                    padding: '16px', marginBottom: '24px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-danger-bg)', border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-size-sm)',
                }}>
                    <XCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                    <span>{error}</span>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setError(null)}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '4px', marginBottom: '24px',
                borderBottom: '1px solid var(--border-color)', paddingBottom: '0',
            }}>
                {([
                    { key: 'overview', label: t ? 'Overview' : 'Übersicht' },
                    { key: 'posts', label: `Posts (${posts.length})` },
                    { key: 'generate', label: t ? 'Generate' : 'Generieren' },
                    { key: 'accounts', label: `Accounts (${accounts.length})` },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '10px 20px', fontSize: 'var(--font-size-sm)', fontWeight: 600,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--text-tertiary)',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                            transition: 'all 0.15s ease', marginBottom: '-1px',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                    <Loader2 size={32} className="spin" style={{ color: 'var(--text-tertiary)' }} />
                </div>
            ) : (
                <>
                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Stats Row */}
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <span className="stat-card-label">{t ? 'Readiness' : 'Bereitschaft'}</span>
                                        <div className="stat-card-icon" style={{ color: scoreColor, background: `${scoreColor}15` }}><Zap size={20} /></div>
                                    </div>
                                    <div className="stat-card-value" style={{ color: scoreColor }}>{readiness?.score ?? '–'}%</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {(readiness?.items?.filter(i => i.state === 'ready').length ?? 0)}/{readiness?.items?.length ?? 0} {t ? 'checks passed' : 'Checks bestanden'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <span className="stat-card-label">{t ? 'Total Posts' : 'Gesamt Posts'}</span>
                                        <div className="stat-card-icon" style={{ color: 'var(--color-accent)', background: 'var(--color-info-bg)' }}><Send size={20} /></div>
                                    </div>
                                    <div className="stat-card-value">{posts.length}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {publishedCount} {t ? 'published' : 'veröffentlicht'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <span className="stat-card-label">{t ? 'Queued' : 'In Warteschlange'}</span>
                                        <div className="stat-card-icon" style={{ color: 'var(--color-data-purple)', background: 'rgba(139,92,246,0.1)' }}><Clock size={20} /></div>
                                    </div>
                                    <div className="stat-card-value">{approvedCount}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {t ? 'approved & scheduled' : 'freigegeben & geplant'}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-header">
                                        <span className="stat-card-label">{t ? 'Drafts' : 'Entwürfe'}</span>
                                        <div className="stat-card-icon" style={{ color: 'var(--color-neutral)', background: 'rgba(107,114,128,0.1)' }}><Sparkles size={20} /></div>
                                    </div>
                                    <div className="stat-card-value">{draftCount}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {t ? 'awaiting review' : 'warten auf Review'}
                                    </div>
                                </div>
                            </div>

                            {/* Readiness + Accounts */}
                            <div className="content-grid-2">
                                {/* Readiness Card */}
                                <div className="card">
                                    <div className="card-header">
                                        <div>
                                            <div className="card-title">{t ? 'Go-Live Readiness' : 'Go-Live Bereitschaft'}</div>
                                            <div className="card-subtitle">{t ? 'System checks for publishing' : 'Systemprüfungen für die Veröffentlichung'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {readiness?.items?.map((item, i) => {
                                            const Icon = STATE_ICON[item.state] || AlertTriangle;
                                            const color = STATE_COLOR[item.state] || 'var(--text-tertiary)';
                                            return (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)',
                                                }}>
                                                    <Icon size={18} style={{ color, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{item.label}</div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{item.detail}</div>
                                                    </div>
                                                </div>
                                            );
                                        }) || (
                                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                                {t ? 'Could not load readiness data' : 'Readiness-Daten konnten nicht geladen werden'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Accounts Summary + Recent Drafts */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Accounts Summary */}
                                    <div className="card">
                                        <div className="card-header">
                                            <div>
                                                <div className="card-title">{t ? 'Connected Accounts' : 'Verbundene Accounts'}</div>
                                                <div className="card-subtitle">{accounts.length} {t ? 'active' : 'aktiv'}</div>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('accounts')}>
                                                {t ? 'Details' : 'Details'} →
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {accounts.length === 0 ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                                    <Link2 size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
                                                    <div>{t ? 'No accounts connected yet' : 'Noch keine Accounts verbunden'}</div>
                                                    <a
                                                        href={`${SOCIAL_HUB_URL}/project/${encodeURIComponent(companyId)}/settings`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-primary btn-sm"
                                                        style={{ marginTop: '12px' }}
                                                    >
                                                        <Link2 size={14} /> {t ? 'Connect Account' : 'Account verbinden'}
                                                    </a>
                                                </div>
                                            ) : accounts.map(acc => {
                                                const PIcon = PLATFORM_ICON[acc.platform] || Radio;
                                                const ts = TOKEN_STATUS_MAP[acc.token_status] || TOKEN_STATUS_MAP.ok;
                                                return (
                                                    <div key={acc.id} style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)',
                                                    }}>
                                                        <PIcon size={18} style={{ color: acc.platform === 'linkedin' ? '#0077B5' : '#E4405F', flexShrink: 0 }} />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {acc.account_name || acc.platform}
                                                            </div>
                                                        </div>
                                                        <span style={{ fontSize: '11px', fontWeight: 600, color: ts.color }}>{ts.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Recent Drafts Needing Review */}
                                    {draftCount > 0 && (
                                        <div className="card" style={{ borderLeft: '3px solid #6b7280' }}>
                                            <div className="card-header">
                                                <div>
                                                    <div className="card-title">{t ? 'Needs Review' : 'Review erforderlich'}</div>
                                                    <div className="card-subtitle">{draftCount} {t ? 'drafts awaiting approval' : 'Entwürfe warten auf Freigabe'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {posts.filter(p => p.status === 'draft').slice(0, 3).map(post => (
                                                    <div key={post.id}
                                                        onClick={() => openPostDetail(post.id)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '10px',
                                                            padding: '10px', borderRadius: 'var(--radius-sm)',
                                                            background: 'var(--bg-elevated)', cursor: 'pointer',
                                                            transition: 'background 0.15s ease',
                                                        }}
                                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                                                    >
                                                        <Sparkles size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                                        <span style={{ fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                            {post.topic || post.post_text?.slice(0, 60) || 'Ohne Titel'}
                                                        </span>
                                                        <Eye size={14} style={{ color: 'var(--text-tertiary)' }} />
                                                    </div>
                                                ))}
                                                {draftCount > 3 && (
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setActiveTab('posts'); setStatusFilter('draft'); }}>
                                                        +{draftCount - 3} {t ? 'more' : 'weitere'} →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ POSTS TAB ═══ */}
                    {activeTab === 'posts' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Toolbar */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                    <input
                                        className="form-input"
                                        placeholder={t ? 'Search posts...' : 'Posts durchsuchen...'}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{ paddingLeft: '36px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
                                    {['all', 'draft', 'approved', 'published', 'rejected'].map(s => (
                                        <button
                                            key={s}
                                            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setStatusFilter(s)}
                                            style={{ fontSize: '12px' }}
                                        >
                                            {s === 'all' ? (t ? 'All' : 'Alle') : (STATUS_BADGE[s]?.label || s)}
                                        </button>
                                    ))}
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('generate')}>
                                    <Sparkles size={14} /> {t ? 'Generate New' : 'Neu generieren'}
                                </button>
                            </div>

                            {/* Post Cards */}
                            {filteredPosts.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                                    <Send size={40} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--text-tertiary)' }} />
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                                        {searchQuery || statusFilter !== 'all'
                                            ? (t ? 'No posts match your filter.' : 'Keine Posts entsprechen deinem Filter.')
                                            : (t ? 'No posts yet. Generate your first AI post!' : 'Noch keine Posts. Generiere deinen ersten KI-Post!')}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredPosts.map(post => {
                                        const badge = STATUS_BADGE[post.status] || STATUS_BADGE.draft;
                                        return (
                                            <div key={post.id} className="card" style={{
                                                padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease',
                                                borderLeft: `3px solid ${badge.color}`,
                                            }}
                                                onClick={() => openPostDetail(post.id)}
                                            >
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    {/* Image Preview */}
                                                    {post.post_image_url ? (
                                                        <div style={{
                                                            width: 80, height: 80, borderRadius: 'var(--radius-md)',
                                                            background: 'var(--bg-hover)', flexShrink: 0, overflow: 'hidden',
                                                        }}>
                                                            <img
                                                                src={post.post_image_url}
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            width: 80, height: 80, borderRadius: 'var(--radius-md)',
                                                            background: 'var(--bg-hover)', flexShrink: 0,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <ImageIcon size={24} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
                                                        </div>
                                                    )}

                                                    {/* Content */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                                                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {post.topic || 'Ohne Titel'}
                                                            </div>
                                                            <span style={{
                                                                fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                                                                borderRadius: 'var(--radius-full)', color: badge.color, background: badge.bg,
                                                                whiteSpace: 'nowrap', flexShrink: 0,
                                                            }}>
                                                                {badge.label}
                                                            </span>
                                                        </div>

                                                        <p style={{
                                                            fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)',
                                                            margin: 0, lineHeight: 1.5,
                                                            overflow: 'hidden', display: '-webkit-box',
                                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                        }}>
                                                            {post.post_text || ''}
                                                        </p>

                                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', alignItems: 'center' }}>
                                                            {post.hashtags && post.hashtags.length > 0 && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    <Hash size={12} /> {post.hashtags.length}
                                                                </span>
                                                            )}
                                                            {post.scheduled_at && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    <Clock size={12} />
                                                                    {new Date(post.scheduled_at).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                            {post.published_at && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)' }}>
                                                                    <CheckCircle2 size={12} />
                                                                    {new Date(post.published_at).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions Row (for drafts) */}
                                                {post.status === 'draft' && (
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                                                            disabled={actionLoading === post.id}
                                                            onClick={() => handleApprove(post.id)}
                                                        >
                                                            {actionLoading === post.id ? <Loader2 size={12} className="spin" /> : <ThumbsUp size={12} />}
                                                            {t ? 'Approve' : 'Freigeben'}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                                            disabled={actionLoading === post.id}
                                                            onClick={() => handleReject(post.id)}
                                                        >
                                                            <ThumbsDown size={12} />
                                                            {t ? 'Reject' : 'Ablehnen'}
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ marginLeft: 'auto' }}
                                                            onClick={() => openPostDetail(post.id)}
                                                        >
                                                            <Eye size={12} /> {t ? 'Preview' : 'Vorschau'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Quick Action: Publish for approved */}
                                                {post.status === 'approved' && (
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            disabled={actionLoading === post.id}
                                                            onClick={() => handlePublish(post.id)}
                                                        >
                                                            {actionLoading === post.id ? <Loader2 size={12} className="spin" /> : <PlayCircle size={12} />}
                                                            {t ? 'Publish Now' : 'Jetzt veröffentlichen'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ GENERATE TAB ═══ */}
                    {activeTab === 'generate' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px' }}>
                            <div className="card">
                                <div className="card-header">
                                    <div>
                                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                                            {t ? 'Generate AI Post' : 'KI-Post generieren'}
                                        </div>
                                        <div className="card-subtitle">
                                            {t
                                                ? 'Enter a topic and select a platform. AI will generate text, image and hashtags.'
                                                : 'Gib ein Thema ein und wähle eine Plattform. Die KI generiert Text, Bild und Hashtags.'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {/* Topic Input */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {t ? 'Topic' : 'Thema'}
                                        </label>
                                        <textarea
                                            className="form-textarea"
                                            value={genTopic}
                                            onChange={e => setGenTopic(e.target.value)}
                                            placeholder={t
                                                ? 'e.g. "5 tips for better team communication in remote work"'
                                                : 'z.B. „5 Tipps für bessere Team-Kommunikation im Homeoffice"'}
                                            style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}
                                            disabled={generating}
                                        />
                                    </div>

                                    {/* Platform Select */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {t ? 'Platform' : 'Plattform'}
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(['linkedin', 'instagram'] as const).map(p => (
                                                <button
                                                    key={p}
                                                    className={`btn btn-sm ${genPlatform === p ? 'btn-primary' : 'btn-ghost'}`}
                                                    onClick={() => setGenPlatform(p)}
                                                    disabled={generating}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                                                >
                                                    {p === 'linkedin' ? <Linkedin size={16} /> : <Instagram size={16} />}
                                                    {p === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleGenerate}
                                        disabled={generating || !genTopic.trim()}
                                        style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
                                    >
                                        {generating ? (
                                            <><Loader2 size={16} className="spin" /> {t ? 'Generating...' : 'Wird generiert...'}</>
                                        ) : (
                                            <><Sparkles size={16} /> {t ? 'Generate Post' : 'Post generieren'}</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Generation Result */}
                            {genResult && (
                                <div className="card" style={{ borderLeft: '3px solid #10b981' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                                                {t ? 'Post Generated Successfully!' : 'Post erfolgreich generiert!'}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                {t ? 'The post is now a draft' : 'Der Post ist jetzt ein Entwurf'} · {genResult.platform}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => openPostDetail(genResult.post_id)}>
                                            <Eye size={14} /> {t ? 'View Post' : 'Post ansehen'}
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setActiveTab('posts'); setStatusFilter('draft'); }}>
                                            {t ? 'Go to Posts' : 'Zu den Posts'} →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ ACCOUNTS TAB ═══ */}
                    {activeTab === 'accounts' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="card">
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">{t ? 'Connected Social Accounts' : 'Verbundene Social-Accounts'}</div>
                                        <div className="card-subtitle">
                                            {t ? 'Manage your LinkedIn and Instagram connections' : 'Verwalte deine LinkedIn- und Instagram-Verbindungen'}
                                        </div>
                                    </div>
                                    <a
                                        href={`${SOCIAL_HUB_URL}/project/${encodeURIComponent(companyId)}/settings`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                    >
                                        <Link2 size={14} /> {t ? 'Connect New' : 'Neu verbinden'}
                                    </a>
                                </div>

                                {accounts.length === 0 ? (
                                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        <Link2 size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                        <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: '16px' }}>
                                            {t
                                                ? 'No social accounts connected yet. Connect your LinkedIn or Instagram account to start publishing.'
                                                : 'Noch keine Social-Accounts verbunden. Verbinde deinen LinkedIn- oder Instagram-Account, um mit der Veröffentlichung zu beginnen.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {accounts.map(acc => {
                                            const PIcon = PLATFORM_ICON[acc.platform] || Radio;
                                            const ts = TOKEN_STATUS_MAP[acc.token_status] || TOKEN_STATUS_MAP.ok;
                                            const platformColor = acc.platform === 'linkedin' ? '#0077B5' : '#E4405F';
                                            return (
                                                <div key={acc.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: '16px',
                                                    padding: '16px', borderRadius: 'var(--radius-md)',
                                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
                                                    borderLeft: `3px solid ${platformColor}`,
                                                }}>
                                                    <div style={{
                                                        width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                                        background: `${platformColor}15`, display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                    }}>
                                                        <PIcon size={22} style={{ color: platformColor }} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '2px' }}>
                                                            {acc.account_name || acc.platform}
                                                        </div>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                            <span style={{ textTransform: 'capitalize' }}>{acc.platform}</span>
                                                            {acc.created_at && (
                                                                <span>{t ? 'Connected' : 'Verbunden'}: {new Date(acc.created_at).toLocaleDateString('de-DE')}</span>
                                                            )}
                                                            {acc.token_expires_at && (
                                                                <span>{t ? 'Token expires' : 'Token läuft ab'}: {new Date(acc.token_expires_at).toLocaleDateString('de-DE')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                        <div style={{
                                                            width: '8px', height: '8px', borderRadius: '50%',
                                                            background: ts.color,
                                                        }} />
                                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: ts.color }}>
                                                            {ts.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* OAuth Info */}
                            <div className="card" style={{ background: 'rgba(14,165,233,0.06)', borderLeft: '3px solid #0ea5e9' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <Shield size={20} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                                            {t ? 'Secure OAuth Connection' : 'Sichere OAuth-Verbindung'}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            {t
                                                ? 'Account tokens are encrypted at rest. Social Hub uses official LinkedIn and Instagram APIs with proper OAuth 2.0 flows. Tokens are automatically refreshed before expiry.'
                                                : 'Account-Tokens werden verschlüsselt gespeichert. Der Social Hub nutzt offizielle LinkedIn- und Instagram-APIs mit korrekten OAuth-2.0-Flows. Tokens werden automatisch vor Ablauf erneuert.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══ POST DETAIL MODAL ═══ */}
            {(selectedPost || detailLoading) && (
                <div className="modal-overlay" onClick={closePostDetail} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                        margin: 0, maxHeight: '90vh', width: '100%', maxWidth: '700px',
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    }}>
                        {detailLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                                <Loader2 size={32} className="spin" style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                        ) : selectedPost && (
                            <>
                                {/* Modal Header */}
                                <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Radio size={18} style={{ color: 'var(--color-primary)' }} />
                                        Post-Details
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {selectedPost.platform_post_url && (
                                            <a
                                                href={selectedPost.platform_post_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost btn-sm"
                                            >
                                                <ExternalLink size={14} /> {t ? 'View Live' : 'Live ansehen'}
                                            </a>
                                        )}
                                        <button className="btn btn-ghost btn-icon" onClick={closePostDetail}><X size={20} /></button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
                                    {/* Status & Platform */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                                            borderRadius: 'var(--radius-full)',
                                            color: (STATUS_BADGE[selectedPost.status] || STATUS_BADGE.draft).color,
                                            background: (STATUS_BADGE[selectedPost.status] || STATUS_BADGE.draft).bg,
                                        }}>
                                            {(STATUS_BADGE[selectedPost.status] || STATUS_BADGE.draft).label}
                                        </span>
                                        {selectedPost.platform && (
                                            <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {selectedPost.platform === 'linkedin' ? <Linkedin size={12} /> : <Instagram size={12} />}
                                                {selectedPost.platform}
                                            </span>
                                        )}
                                        {selectedPost.account_name && (
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                → {selectedPost.account_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Topic */}
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '16px' }}>
                                        {selectedPost.topic || 'Ohne Titel'}
                                    </h3>

                                    {/* Image Preview */}
                                    {selectedPost.post_image_url && (
                                        <div style={{
                                            marginBottom: '16px', borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden', border: '1px solid var(--border-color)',
                                            maxHeight: '300px',
                                        }}>
                                            <img
                                                src={selectedPost.post_image_url}
                                                alt="Post preview"
                                                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '300px', objectFit: 'cover' }}
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    {/* Post Text */}
                                    <div className="card" style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Post-Text
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                                            {selectedPost.post_text}
                                        </div>
                                    </div>

                                    {/* Hashtags */}
                                    {selectedPost.hashtags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                            {selectedPost.hashtags.map((tag, i) => (
                                                <span key={i} style={{
                                                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                                    background: 'rgba(14,165,233,0.1)', color: '#0ea5e9',
                                                    fontSize: '12px', fontWeight: 600,
                                                }}>
                                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Value Comment */}
                                    {selectedPost.auto_comment_text && (
                                        <div className="card" style={{ marginBottom: '16px', background: 'rgba(139,92,246,0.06)', borderLeft: '3px solid #8b5cf6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <MessageSquare size={14} style={{ color: '#8b5cf6' }} />
                                                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase' }}>
                                                    Value Comment
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                {selectedPost.auto_comment_text}
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {selectedPost.error_message && (
                                        <div style={{
                                            padding: '12px 16px', marginBottom: '16px', borderRadius: 'var(--radius-md)',
                                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                        }}>
                                            <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: '#ef4444' }}>{selectedPost.error_message}</span>
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="card" style={{ marginBottom: '0' }}>
                                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                                            {t ? 'Metadata' : 'Metadaten'}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
                                            <div style={{ color: 'var(--text-tertiary)' }}>{t ? 'Created' : 'Erstellt'}:</div>
                                            <div>{selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleString('de-DE') : '–'}</div>

                                            {selectedPost.scheduled_at && (
                                                <>
                                                    <div style={{ color: 'var(--text-tertiary)' }}>{t ? 'Scheduled' : 'Geplant'}:</div>
                                                    <div>{new Date(selectedPost.scheduled_at).toLocaleString('de-DE')}</div>
                                                </>
                                            )}
                                            {selectedPost.approved_at && (
                                                <>
                                                    <div style={{ color: 'var(--text-tertiary)' }}>{t ? 'Approved' : 'Freigegeben'}:</div>
                                                    <div>{new Date(selectedPost.approved_at).toLocaleString('de-DE')}</div>
                                                </>
                                            )}
                                            {selectedPost.published_at && (
                                                <>
                                                    <div style={{ color: 'var(--text-tertiary)' }}>{t ? 'Published' : 'Veröffentlicht'}:</div>
                                                    <div>{new Date(selectedPost.published_at).toLocaleString('de-DE')}</div>
                                                </>
                                            )}
                                            {selectedPost.notes && (
                                                <>
                                                    <div style={{ color: 'var(--text-tertiary)' }}>{t ? 'Notes' : 'Notizen'}:</div>
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedPost.notes}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer - Actions */}
                                <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    {selectedPost.status === 'draft' && (
                                        <>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                                disabled={actionLoading === selectedPost.id}
                                                onClick={() => handleReject(selectedPost.id)}
                                            >
                                                <ThumbsDown size={14} /> {t ? 'Reject' : 'Ablehnen'}
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={actionLoading === selectedPost.id}
                                                onClick={() => handleApprove(selectedPost.id)}
                                            >
                                                {actionLoading === selectedPost.id ? <Loader2 size={14} className="spin" /> : <ThumbsUp size={14} />}
                                                {t ? 'Approve' : 'Freigeben'}
                                            </button>
                                        </>
                                    )}
                                    {selectedPost.status === 'rejected' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            disabled={actionLoading === selectedPost.id}
                                            onClick={() => handleApprove(selectedPost.id)}
                                        >
                                            {actionLoading === selectedPost.id ? <Loader2 size={14} className="spin" /> : <ThumbsUp size={14} />}
                                            {t ? 'Re-approve' : 'Erneut freigeben'}
                                        </button>
                                    )}
                                    {selectedPost.status === 'approved' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            disabled={actionLoading === selectedPost.id}
                                            onClick={() => handlePublish(selectedPost.id)}
                                        >
                                            {actionLoading === selectedPost.id ? <Loader2 size={14} className="spin" /> : <PlayCircle size={14} />}
                                            {t ? 'Publish Now' : 'Jetzt veröffentlichen'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

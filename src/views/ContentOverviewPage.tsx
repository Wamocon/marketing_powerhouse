import { useState } from 'react';
import type { ContentItem } from '../types';
import { Plus, Calendar, AlertTriangle, CheckCircle, FileText, Filter, X, LayoutGrid, GripVertical } from 'lucide-react';
import { useContents, CONTENT_STATUSES, CONTENT_STATUS_ORDER } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { useData } from '../context/DataContext';
import { CONTENT_TYPE_COLORS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import ContentDetailModal from '../components/ContentDetailModal';
import NewContentModal from '../components/NewContentModal';
import PageHelp from '../components/PageHelp';

const CONTENT_TYPE_LABELS = {
    social: 'Social Media', email: 'E-Mail', ads: 'Ads / Anzeige', content: 'Blog / Content', event: 'Event'
};

export default function ContentOverviewPage() {
    const { contents } = useContents();
    const { tasks } = useTasks();
    const { can } = useAuth();
    const { campaigns, touchpoints } = useData();
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTaskStatus, setFilterTaskStatus] = useState('all');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
    const [showNewContent, setShowNewContent] = useState(false);

    const getCampaignName = (cId) => {
        if (!cId) return 'Ohne Kampagne';
        return campaigns.find(c => c.id === cId)?.name || 'Unbekannt';
    };

    const getTouchpointBadge = (tpId) => {
        if (!tpId) return null;
        const tp = touchpoints.find(t => t.id === tpId);
        if (!tp) return null;
        return (
            <span className="badge" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔗 {tp.name}
            </span>
        );
    };

    const getLinkedTasks = (content) => {
        if (!content.taskIds || content.taskIds.length === 0) return [];
        return tasks.filter(t => content.taskIds.includes(t.id));
    };

    const filteredContents = contents.filter(c => {
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (filterTaskStatus === 'with' && (!c.taskIds || c.taskIds.length === 0)) return false;
        if (filterTaskStatus === 'without' && c.taskIds && c.taskIds.length > 0) return false;
        return true;
    });

    const totalContents = contents.length;
    const noTaskCount = contents.filter(c => !c.taskIds || c.taskIds.length === 0).length;
    const publishedCount = contents.filter(c => c.status === 'published').length;
    const scheduledCount = contents.filter(c => c.status === 'scheduled').length;

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Content-Übersicht</h1>
                    <p className="page-subtitle">Alle geplanten und veröffentlichten Inhalte im Überblick</p>
                </div>
                <div className="page-header-actions">
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={14} /> Raster
                        </button>
                        <button className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('kanban')}>
                            <GripVertical size={14} /> Kanban
                        </button>
                    </div>
                    <PageHelp title="Content-Übersicht">
                        <p style={{ marginBottom: '12px' }}>Hier laufen alle Redaktionsinhalte tabellarisch zusammen, egal auf welcher Plattform sie spielen.</p>
                        <ul className="help-list">
                            <li><strong>KPI Board:</strong> Du siehst direkt, welcher Content bereits safe eingeplant ist und wie viele Posts in der Pipeline liegen.</li>
                            <li><strong>Filtern:</strong> Suche gezielt nach "ohne Aufgaben" (rot markiert), um fehlende Team-Delegation aufzudecken oder filter den Status runter auf fertig produzierte Assets.</li>
                            <li><strong>Detail-Management:</strong> Mit einem Klick auf eine Inhalts-Kachel kannst du die Meta-Daten des Posts editieren, checken zu welcher Kampagne er gehört oder direkt neue Aufgabenhülsen (zur Umsetzung des Posts) erstellen.</li>
                        </ul>
                    </PageHelp>
                    {can('canEditContent') && (
                        <button className="btn btn-primary" onClick={() => setShowNewContent(true)}>
                            <Plus size={16} /> Neuer Content
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                {[
                    { label: 'Gesamt', value: totalContents, icon: <FileText size={20} />, color: 'var(--color-primary)' },
                    { label: 'Eingeplant', value: scheduledCount, icon: <Calendar size={20} />, color: '#6366f1' },
                    { label: 'Veröffentlicht', value: publishedCount, icon: <CheckCircle size={20} />, color: '#10b981' },
                    { label: 'Ohne Aufgaben', value: noTaskCount, icon: <AlertTriangle size={20} />, color: noTaskCount > 0 ? '#ef4444' : '#10b981' },
                ].map((stat, i) => (
                    <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${stat.color}` }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '20px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                    <Filter size={14} /> Filter:
                </div>
                <select className="form-input" style={{ width: 'auto', padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}
                    value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">Alle Status</option>
                    {CONTENT_STATUS_ORDER.map(s => (
                        <option key={s} value={s}>{CONTENT_STATUSES[s].icon} {CONTENT_STATUSES[s].label}</option>
                    ))}
                </select>
                <select className="form-input" style={{ width: 'auto', padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}
                    value={filterTaskStatus} onChange={e => setFilterTaskStatus(e.target.value)}>
                    <option value="all">Alle Aufgaben-Status</option>
                    <option value="with">✅ Mit Aufgaben</option>
                    <option value="without">⚠️ Ohne Aufgaben</option>
                </select>
                {(filterStatus !== 'all' || filterTaskStatus !== 'all') && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus('all'); setFilterTaskStatus('all'); }}>
                        <X size={14} /> Zurücksetzen
                    </button>
                )}
                <div style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {filteredContents.length} von {totalContents} Einträgen
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filteredContents.map(cnt => {
                    const st = CONTENT_STATUSES[cnt.status];
                    const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                    const linkedTasks = getLinkedTasks(cnt);
                    return (
                        <div key={cnt.id} className="card" onClick={() => setSelectedContent(cnt)} style={{
                            cursor: 'pointer', transition: 'all 0.2s', padding: '18px',
                            borderLeft: hasTasks ? `3px solid ${st?.color}` : '3px solid #ef4444',
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>{cnt.title}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {getCampaignName(cnt.campaignId)}
                                    </div>
                                </div>
                                <span className="badge" style={{ background: `${st?.color}18`, color: st?.color, border: `1px solid ${st?.color}33`, flexShrink: 0 }}>
                                    {st?.icon} {st?.label}
                                </span>
                            </div>
                            {cnt.description && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                                    {cnt.description.length > 100 ? cnt.description.slice(0, 100) + '…' : cnt.description}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <span className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || 'info'}`} style={{ fontSize: '0.65rem' }}>{cnt.platform}</span>
                                <span className="badge" style={{ background: 'var(--bg-hover)', fontSize: '0.65rem' }}>{CONTENT_TYPE_LABELS[cnt.contentType] || cnt.contentType}</span>
                                {getTouchpointBadge(cnt.touchpointId)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    <Calendar size={12} />
                                    {cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString('de-DE') : 'Kein Datum'}
                                </div>
                                {hasTasks ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 500 }}>
                                        <CheckCircle size={12} /> {linkedTasks.length} Aufgabe(n)
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: '#ef4444', fontWeight: 600 }}>
                                        <AlertTriangle size={12} /> Keine Aufgaben
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>)}

            {viewMode === 'grid' && filteredContents.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <div className="empty-state-title">Keine Inhalte gefunden</div>
                        <div className="empty-state-text">Passe deine Filtereinstellungen an oder erstelle neuen Content.</div>
                    </div>
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', alignItems: 'flex-start', paddingBottom: '8px' }}>
                    {CONTENT_STATUS_ORDER.map(status => {
                        const st = CONTENT_STATUSES[status];
                        const colContents = contents.filter(c => {
                            if (c.status !== status) return false;
                            if (filterStatus !== 'all' && filterStatus !== status) return false;
                            if (filterTaskStatus === 'with' && (!c.taskIds || c.taskIds.length === 0)) return false;
                            if (filterTaskStatus === 'without' && c.taskIds && c.taskIds.length > 0) return false;
                            return true;
                        });
                        return (
                            <div key={status} style={{
                                flex: '0 0 260px', minWidth: '220px',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)',
                            }}>
                                {/* Column header */}
                                <div style={{
                                    padding: '14px 16px 12px',
                                    borderBottom: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                            {st.icon} {st.label}
                                        </span>
                                    </div>
                                    <span style={{
                                        background: `${st.color}20`, color: st.color,
                                        borderRadius: 'var(--radius-full)', padding: '2px 8px',
                                        fontSize: '0.7rem', fontWeight: 700,
                                    }}>{colContents.length}</span>
                                </div>
                                {/* Cards */}
                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '68vh', overflowY: 'auto' }}>
                                    {colContents.map(cnt => {
                                        const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                                        return (
                                            <div key={cnt.id} onClick={() => setSelectedContent(cnt)} style={{
                                                background: 'var(--bg-base)', borderRadius: 'var(--radius-md)',
                                                padding: '12px', cursor: 'pointer', transition: 'all 0.15s',
                                                border: '1px solid var(--border-color)',
                                                borderLeft: hasTasks ? `3px solid ${st.color}` : '3px solid #ef4444',
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', marginBottom: '6px', lineHeight: 1.4 }}>{cnt.title}</div>
                                                <div style={{ marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <span className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || 'info'}`} style={{ fontSize: '0.6rem' }}>{cnt.platform}</span>
                                                    <span className="badge" style={{ background: 'var(--bg-hover)', fontSize: '0.6rem' }}>{getCampaignName(cnt.campaignId)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <Calendar size={10} />
                                                        {cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : '—'}
                                                    </span>
                                                    {hasTasks ? (
                                                        <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <CheckCircle size={10} /> {cnt.taskIds!.length}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <AlertTriangle size={10} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {colContents.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', padding: '28px 8px', opacity: 0.4 }}>
                                            Keine Inhalte
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selectedContent && (
                <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
            )}

            {/* New Content Modal */}
            {showNewContent && (
                <NewContentModal onClose={() => setShowNewContent(false)} />
            )}
        </div>
    );
}

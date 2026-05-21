import { useState } from 'react';
import type { ContentItem } from '../types';
import { Plus, Calendar, AlertTriangle, CheckCircle, FileText, Filter, X, LayoutGrid, GripVertical, Wand2 } from 'lucide-react';
import { useContents, CONTENT_STATUSES, CONTENT_STATUS_ORDER } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { useData } from '../context/DataContext';
import { CONTENT_TYPE_COLORS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ContentDetailModal from '../components/ContentDetailModal';
import ContentIdeaWizard from '../components/ContentIdeaWizard';
import NewContentModal from '../components/NewContentModal';
import PageHelp from '../components/PageHelp';

const CONTENT_TYPE_LABELS: Record<string, { de: string; en: string; tr: string }> = {
    social: { de: 'Social Media', en: 'Social Media', tr: 'Sosyal Medya' },
    email: { de: 'E-Mail', en: 'E-Mail', tr: 'E-Posta' },
    ads: { de: 'Ads / Anzeige', en: 'Ads', tr: 'Reklamlar' },
    content: { de: 'Blog / Content', en: 'Blog / Content', tr: 'Blog / İçerik' },
    event: { de: 'Event', en: 'Event', tr: 'Etkinlik' },
};

const CONTENT_STATUS_MODEL = [
    {
        id: 'idea',
        title: { de: 'Idee', en: 'Idea', tr: 'Fikir' },
        description: { de: 'Thema, Ziel und Format sind als erster Entwurf angelegt.', en: 'Topic, goal and format are created as a first draft.', tr: 'Konu, hedef ve format ilk taslak olarak oluşturuldu.' },
        entry: [{ de: 'Neuer Content wurde erstellt oder aus dem Backlog aufgenommen.', en: 'New content was created or picked up from the backlog.', tr: 'Yeni içerik oluşturuldu veya birikmişlerden alındı.' }],
        exit: [
            { de: 'Kanal und Zielgruppe sind definiert.', en: 'Channel and target audience are defined.', tr: 'Kanal ve hedef kitle tanımlandı.' },
            { de: 'Ein umsetzbares Briefing liegt vor.', en: 'An actionable briefing is available.', tr: 'Uygulanabilir bir brifing mevcut.' },
        ],
    },
    {
        id: 'planning',
        title: { de: 'In Planung', en: 'Planning', tr: 'Planlamada' },
        description: { de: 'Inhaltliche Planung, Ressourcen und Timing werden konkretisiert.', en: 'Content planning, resources and timing are being refined.', tr: 'İçerik planlaması, kaynaklar ve zamanlama somutlaştırılıyor.' },
        entry: [{ de: 'Briefing ist vollständig genug für die Umsetzung.', en: 'Briefing is complete enough for implementation.', tr: 'Brifing uygulama için yeterince eksiksiz.' }],
        exit: [
            { de: 'Aufgaben sind zugeordnet.', en: 'Tasks are assigned.', tr: 'Görevler atandı.' },
            { de: 'Umsetzung kann ohne offene Kernfragen starten.', en: 'Implementation can start without open core questions.', tr: 'Uygulama açık temel sorular olmadan başlayabilir.' },
        ],
    },
    {
        id: 'production',
        title: { de: 'In Produktion', en: 'In Production', tr: 'Üretimde' },
        description: { de: 'Text, Visuals oder Assets werden erstellt und intern abgestimmt.', en: 'Text, visuals or assets are being created and internally aligned.', tr: 'Metin, görseller veya varlıklar oluşturuluyor ve dahili olarak uyumlaştırılıyor.' },
        entry: [{ de: 'Alle notwendigen Inputs aus Planung sind vorhanden.', en: 'All necessary inputs from planning are available.', tr: 'Planlamadan gerekli tüm girdiler mevcut.' }],
        exit: [
            { de: 'Finale Asset-Version liegt vor.', en: 'Final asset version is available.', tr: 'Son varlık sürümü hazır.' },
            { de: 'Qualitätscheck ist erledigt.', en: 'Quality check is completed.', tr: 'Kalite kontrolü tamamlandı.' },
        ],
    },
    {
        id: 'ready',
        title: { de: 'Bereit', en: 'Ready', tr: 'Hazır' },
        description: { de: 'Der Inhalt ist fertig produziert und freigegeben zur Terminierung.', en: 'The content is fully produced and approved for scheduling.', tr: 'İçerik tamamen üretildi ve planlamaya onaylandı.' },
        entry: [
            { de: 'Produktion ist abgeschlossen.', en: 'Production is completed.', tr: 'Üretim tamamlandı.' },
            { de: 'Keine kritischen Korrekturen mehr offen.', en: 'No critical corrections remaining.', tr: 'Kritik düzeltme kalmadı.' },
        ],
        exit: [{ de: 'Konkreter Veröffentlichungstermin ist festgelegt.', en: 'Specific publication date is set.', tr: 'Belirli yayın tarihi belirlendi.' }],
    },
    {
        id: 'scheduled',
        title: { de: 'Eingeplant', en: 'Scheduled', tr: 'Planlanmış' },
        description: { de: 'Der Content ist im Kalender eingeplant und wartet auf Go-Live.', en: 'The content is scheduled in the calendar and waiting for go-live.', tr: 'İçerik takvimde planlandı ve yayına alınmayı bekliyor.' },
        entry: [
            { de: 'Publish-Date ist gesetzt.', en: 'Publish date is set.', tr: 'Yayın tarihi belirlendi.' },
            { de: 'Plattform-Zuweisung ist final.', en: 'Platform assignment is final.', tr: 'Platform ataması kesinleşti.' },
        ],
        exit: [{ de: 'Inhalt wurde veröffentlicht.', en: 'Content has been published.', tr: 'İçerik yayınlandı.' }],
    },
    {
        id: 'published',
        title: { de: 'Veröffentlicht', en: 'Published', tr: 'Yayınlandı' },
        description: { de: 'Inhalt ist live auf dem vorgesehenen Touchpoint/Kanal.', en: 'Content is live on the designated touchpoint/channel.', tr: 'İçerik belirlenen temas noktasında/kanalda yayında.' },
        entry: [{ de: 'Content wurde ausgespielt oder manuell live gestellt.', en: 'Content was deployed or manually set live.', tr: 'İçerik dağıtıldı veya manuel olarak yayına alındı.' }],
        exit: [{ de: 'Optional: Performance-Auswertung oder Folgeaufgaben werden gestartet.', en: 'Optional: Performance evaluation or follow-up tasks are started.', tr: 'Opsiyonel: Performans değerlendirmesi veya takip görevleri başlatıldı.' }],
    },
];

export default function ContentOverviewPage() {
    const { contents } = useContents();
    const { tasks } = useTasks();
    const { can } = useAuth();
    const { language, locale, t } = useLanguage();
    const { campaigns, touchpoints } = useData();
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTaskStatus, setFilterTaskStatus] = useState('all');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
    const [showNewContent, setShowNewContent] = useState(false);
    const [showIdeaWizard, setShowIdeaWizard] = useState(false);

    const getCampaignName = (cId) => {
        if (!cId) return t({ de: 'Ohne Kampagne', en: 'No campaign', tr: 'Kampanya yok' });
        return campaigns.find(c => c.id === cId)?.name || t({ de: 'Unbekannt', en: 'Unknown', tr: 'Bilinmeyen' });
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
                    <h1 className="page-title">{t({ de: 'Content-Übersicht', en: 'Content overview', tr: 'İçerik Genel Bakışı' })}</h1>
                    <p className="page-subtitle">{t({ de: 'Alle geplanten und veröffentlichten Inhalte im Überblick', en: 'All planned and published content at a glance', tr: 'Tüm planlanan ve yayınlanan içerikler bir bakışta' })}</p>
                </div>
                <div className="page-header-actions">
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={14} /> {t({ de: 'Raster', en: 'Grid', tr: 'Izgara' })}
                        </button>
                        <button className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('kanban')}>
                            <GripVertical size={14} /> Kanban
                        </button>
                    </div>
                    <PageHelp title={t({ de: 'Content-Übersicht', en: 'Content overview', tr: 'İçerik Genel Bakışı' })}>
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Hier laufen alle Redaktionsinhalte tabellarisch zusammen, egal auf welcher Plattform sie spielen.', en: 'All editorial content is consolidated here across platforms.', tr: 'Tüm editoryal içerikler platformdan bağımsız olarak burada bir araya getirilir.' })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'KPI Board', en: 'KPI board', tr: 'KPI Panosu' })}:</strong> {t({ de: 'Du siehst direkt, welcher Content bereits safe eingeplant ist und wie viele Posts in der Pipeline liegen.', en: 'See scheduled content and pipeline volume instantly.', tr: 'Planlanan içerikleri ve pipeline hacmini anında görün.' })}</li>
                            <li><strong>{t({ de: 'Filtern', en: 'Filters', tr: 'Filtreler' })}:</strong> {t({ de: 'Suche gezielt nach ohne Aufgaben oder filter den Status auf fertige Assets.', en: 'Find content without tasks or narrow down by status.', tr: 'Görevsiz içerikleri bulun veya duruma göre daraltın.' })}</li>
                        </ul>
                    </PageHelp>
                    {can('canEditContent') && (
                        <button className="btn btn-secondary" onClick={() => setShowIdeaWizard(true)} style={{ background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', color: 'white', border: 'none' }}>
                            <Wand2 size={16} /> {t({ de: 'KI Content-Ideen', en: 'AI content ideas', tr: 'YZ İçerik Fikirleri' })}
                        </button>
                    )}
                    {can('canEditContent') && (
                        <button className="btn btn-primary" onClick={() => setShowNewContent(true)}>
                            <Plus size={16} /> {t({ de: 'Neuer Content', en: 'New content', tr: 'Yeni İçerik' })}
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                {[
                    { label: t({ de: 'Gesamt', en: 'Total', tr: 'Toplam' }), value: totalContents, icon: <FileText size={20} />, color: 'var(--color-primary)' },
                    { label: t({ de: 'Eingeplant', en: 'Scheduled', tr: 'Planlanmış' }), value: scheduledCount, icon: <Calendar size={20} />, color: '#6366f1' },
                    { label: t({ de: 'Veröffentlicht', en: 'Published', tr: 'Yayınlandı' }), value: publishedCount, icon: <CheckCircle size={20} />, color: '#10b981' },
                    { label: t({ de: 'Ohne Aufgaben', en: 'No tasks', tr: 'Görevsiz' }), value: noTaskCount, icon: <AlertTriangle size={20} />, color: noTaskCount > 0 ? '#ef4444' : '#10b981' },
                ].map((stat, i) => (
                    <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${stat.color}` }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>{t({ de: 'Statusmodell Content', en: 'Content status model', tr: 'İçerik durum modeli' })}</h3>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            {t({ de: 'Visuelle Reihenfolge mit fachlichen Ein- und Ausgangskriterien je Status.', en: 'Visual order with entry and exit criteria per status.', tr: 'Her durum için giriş ve çıkış kriterleri ile görsel sıralama.' })}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {CONTENT_STATUS_MODEL.map((status, idx) => {
                        const st = CONTENT_STATUSES[status.id];
                        const isLast = idx === CONTENT_STATUS_MODEL.length - 1;
                        return (
                            <div key={status.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                    className="badge"
                                    style={{
                                        background: `${st.color}18`,
                                        color: st.color,
                                        border: `1px solid ${st.color}33`,
                                        fontWeight: 600,
                                    }}
                                >
                                    {st.icon} {t(status.title)}
                                </span>
                                {!isLast && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>→</span>}
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                    {CONTENT_STATUS_MODEL.map(status => {
                        const st = CONTENT_STATUSES[status.id];
                        return (
                            <div key={status.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', borderLeft: `3px solid ${st.color}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                                    <span>{st.icon}</span>
                                    <span>{t(status.title)}</span>
                                </div>
                                <p style={{ marginTop: 0, marginBottom: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{t(status.description)}</p>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{t({ de: 'Eingangskriterien', en: 'Entry criteria', tr: 'Giriş kriterleri' })}</div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {status.entry.map((item, i) => <li key={i}>{t(item)}</li>)}
                                </ul>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', marginTop: '8px', marginBottom: '4px' }}>{t({ de: 'Ausgangskriterien', en: 'Exit criteria', tr: 'Çıkış kriterleri' })}</div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {status.exit.map((item, i) => <li key={i}>{t(item)}</li>)}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '20px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                    <Filter size={14} /> {t({ de: 'Filter:', en: 'Filters:', tr: 'Filtreler:' })}
                </div>
                <select className="form-input" style={{ width: 'auto', padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}
                    value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">{t({ de: 'Alle Status', en: 'All statuses', tr: 'Tüm durumlar' })}</option>
                    {CONTENT_STATUS_ORDER.map(s => (
                        <option key={s} value={s}>{CONTENT_STATUSES[s].icon} {CONTENT_STATUSES[s].label}</option>
                    ))}
                </select>
                <select className="form-input" style={{ width: 'auto', padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}
                    value={filterTaskStatus} onChange={e => setFilterTaskStatus(e.target.value)}>
                    <option value="all">{t({ de: 'Alle Aufgaben-Status', en: 'All task states', tr: 'Tüm görev durumları' })}</option>
                    <option value="with">{t({ de: '✅ Mit Aufgaben', en: '✅ With tasks', tr: '✅ Görevli' })}</option>
                    <option value="without">{t({ de: '⚠️ Ohne Aufgaben', en: '⚠️ Without tasks', tr: '⚠️ Görevsiz' })}</option>
                </select>
                {(filterStatus !== 'all' || filterTaskStatus !== 'all') && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus('all'); setFilterTaskStatus('all'); }}>
                        <X size={14} /> {t({ de: 'Zurücksetzen', en: 'Reset', tr: 'Sıfırla' })}
                    </button>
                )}
                <div style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {filteredContents.length} {t({ de: 'von', en: 'of', tr: '/' })} {totalContents} {t({ de: 'Einträgen', en: 'entries', tr: 'kayıt' })}
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filteredContents.map(cnt => {
                    const st = CONTENT_STATUSES[cnt.status];
                    const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                    const linkedTasks = getLinkedTasks(cnt);
                    const isCritical = !hasTasks;
                    return (
                        <div key={cnt.id} className="card" onClick={() => setSelectedContent(cnt)} style={{
                            cursor: 'pointer', transition: 'all 0.2s', padding: '18px',
                            borderLeft: hasTasks ? `3px solid ${st?.color}` : '3px solid #991b1b',
                            ...(isCritical && { background: '#b91c1c', color: '#ffffff' }),
                        }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px', ...(isCritical && { color: '#ffffff' }) }}>{cnt.title}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: isCritical ? 'rgba(255,255,255,0.75)' : 'var(--text-tertiary)' }}>
                                        {getCampaignName(cnt.campaignId)}
                                    </div>
                                </div>
                                <span className="badge" style={{ background: isCritical ? 'rgba(255,255,255,0.2)' : `${st?.color}18`, color: isCritical ? '#ffffff' : st?.color, border: isCritical ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${st?.color}33`, flexShrink: 0 }}>
                                    {st?.icon} {st?.label}
                                </span>
                            </div>
                            {cnt.description && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: isCritical ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                                    {cnt.description.length > 100 ? cnt.description.slice(0, 100) + '…' : cnt.description}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <span className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || 'info'}`} style={{ fontSize: '0.65rem', ...(isCritical && { background: 'rgba(255,255,255,0.2)', color: '#ffffff' }) }}>{cnt.platform}</span>
                                <span className="badge" style={{ background: isCritical ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)', color: isCritical ? '#ffffff' : undefined, fontSize: '0.65rem' }}>{CONTENT_TYPE_LABELS[cnt.contentType] ? t(CONTENT_TYPE_LABELS[cnt.contentType]) : cnt.contentType}</span>
                                {getTouchpointBadge(cnt.touchpointId)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isCritical ? 'rgba(255,255,255,0.25)' : 'var(--border-color)'}`, paddingTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: isCritical ? 'rgba(255,255,255,0.75)' : 'var(--text-tertiary)' }}>
                                    <Calendar size={12} />
                                    {cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString(locale) : t({ de: 'Kein Datum', en: 'No date', tr: 'Tarih yok' })}
                                </div>
                                {hasTasks ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 500 }}>
                                        <CheckCircle size={12} /> {linkedTasks.length} {t({ de: 'Aufgabe(n)', en: 'task(s)', tr: 'görev' })}
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: '#ffffff', fontWeight: 600 }}>
                                        <AlertTriangle size={12} /> {t({ de: 'Keine Aufgaben', en: 'No tasks', tr: 'Görev yok' })}
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
                        <div className="empty-state-title">{t({ de: 'Keine Inhalte gefunden', en: 'No content found', tr: 'İçerik bulunamadı' })}</div>
                        <div className="empty-state-text">{t({ de: 'Passe deine Filtereinstellungen an oder erstelle neuen Content.', en: 'Adjust your filter settings or create new content.', tr: 'Filtre ayarlarınızı düzenleyin veya yeni içerik oluşturun.' })}</div>
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
                                        const isCritical = !hasTasks;
                                        return (
                                            <div key={cnt.id} onClick={() => setSelectedContent(cnt)} style={{
                                                background: isCritical ? '#b91c1c' : 'var(--bg-base)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '12px', cursor: 'pointer', transition: 'all 0.15s',
                                                border: `1px solid ${isCritical ? '#991b1b' : 'var(--border-color)'}`,
                                                borderLeft: hasTasks ? `3px solid ${st.color}` : '3px solid #991b1b',
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', marginBottom: '6px', lineHeight: 1.4, color: isCritical ? '#ffffff' : undefined }}>{cnt.title}</div>
                                                <div style={{ marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <span className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || 'info'}`} style={{ fontSize: '0.6rem', ...(isCritical && { background: 'rgba(255,255,255,0.2)', color: '#ffffff' }) }}>{cnt.platform}</span>
                                                    <span className="badge" style={{ background: isCritical ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)', color: isCritical ? '#ffffff' : undefined, fontSize: '0.6rem' }}>{getCampaignName(cnt.campaignId)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: isCritical ? 'rgba(255,255,255,0.75)' : 'var(--text-tertiary)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <Calendar size={10} />
                                                        {cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }) : '—'}
                                                    </span>
                                                    {hasTasks ? (
                                                        <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <CheckCircle size={10} /> {cnt.taskIds!.length}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <AlertTriangle size={10} /> {t({ de: 'Keine Aufgaben', en: 'No tasks', tr: 'Görev yok' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {colContents.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', padding: '28px 8px', opacity: 0.4 }}>
                                            {t({ de: 'Keine Inhalte', en: 'No content', tr: 'İçerik yok' })}
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

            {/* Content Idea Wizard */}
            {showIdeaWizard && (
                <ContentIdeaWizard onClose={() => setShowIdeaWizard(false)} />
            )}
        </div>
    );
}

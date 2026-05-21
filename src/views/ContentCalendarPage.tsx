import { useState, useEffect } from 'react';
import type { ContentItem } from '../types';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Radio, Wand2 } from 'lucide-react';
import { useContents, CONTENT_STATUSES } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { CONTENT_TYPE_COLORS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useLanguage } from '../context/LanguageContext';
import ContentDetailModal from '../components/ContentDetailModal';
import ContentIdeaWizard from '../components/ContentIdeaWizard';
import NewContentModal from '../components/NewContentModal';
import PageHelp from '../components/PageHelp';
import { listPosts, type ScheduledPost } from '../lib/socialHub';

const daysOfWeekByLang = {
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
};
const monthNamesByLang = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
};

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; }
function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function ContentCalendarPage() {
    const { contents } = useContents();
    useTasks();
    const { can } = useAuth();
    const { activeCompany } = useCompany();
    const { language, locale, t } = useLanguage();
    const daysOfWeek = daysOfWeekByLang[language] || daysOfWeekByLang.en;
    const monthNames = monthNamesByLang[language] || monthNamesByLang.en;
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [view, setView] = useState('month');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [showNewContentModal, setShowNewContentModal] = useState(false);
    const [showIdeaWizard, setShowIdeaWizard] = useState(false);

    // Social Hub posts for calendar overlay
    const [socialPosts, setSocialPosts] = useState<ScheduledPost[]>([]);
    useEffect(() => {
        if (!can('canUseSocialHub') || !activeCompany?.id) return;
        let cancelled = false;
        listPosts({ companyId: activeCompany.id, limit: 500 })
            .then(posts => { if (!cancelled) setSocialPosts(posts); })
            .catch(() => { /* SH offline — calendar content still works */ });
        return () => { cancelled = true; };
    }, [activeCompany?.id, can]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = formatLocalDate(new Date());

    interface CalendarDay {
        day: number;
        isCurrentMonth: boolean;
        date: string | null;
    }

    const calendarDays: CalendarDay[] = [];
    for (let i = firstDay - 1; i >= 0; i--) calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: null });
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        calendarDays.push({ day: d, isCurrentMonth: true, date: dateStr });
    }
    const remaining = 42 - calendarDays.length;
    for (let i = 1; i <= remaining; i++) calendarDays.push({ day: i, isCurrentMonth: false, date: null });

    const getContentsForDate = (dateStr) => {
        if (!dateStr) return [];
        return contents.filter(c => c.publishDate === dateStr);
    };

    const getSocialPostsForDate = (dateStr: string | null) => {
        if (!dateStr) return [];
        return socialPosts.filter(p => {
            const d = p.scheduled_at || p.published_at || p.created_at;
            return d && d.startsWith(dateStr);
        });
    };

    const getColorClass = (content) => {
        if (!content.taskIds || content.taskIds.length === 0) return 'danger';
        return CONTENT_TYPE_COLORS[content.contentType] || 'primary';
    };

    const noTaskCount = contents.filter(c => !c.taskIds || c.taskIds.length === 0).length;

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">{t({ de: 'Content-Kalender', en: 'Content calendar', tr: 'İçerik Takvimi' })}</h1>
                    <p className="page-subtitle">{t({ de: 'Redaktionsplanung über alle Kanäle hinweg', en: 'Editorial planning across all channels', tr: 'Tüm kanallarda editoryal planlama' })} ({contents.length} {t({ de: 'Inhalte', en: 'items', tr: 'içerik' })}{socialPosts.length > 0 ? `, ${socialPosts.length} Social Hub Posts` : ''})</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={t({ de: 'Content-Kalender', en: 'Content calendar', tr: 'İçerik Takvimi' })}>
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Der Content-Kalender ist dein tägliches Navigationsinstrument für alle anstehenden Veröffentlichungen.', en: 'The content calendar is your daily navigation tool for upcoming publications.', tr: 'İçerik takvimi, yaklaşan yayınlarınız için günlük navigasyon aracınızdır.' })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'Die Ansicht', en: 'View', tr: 'Görünüm' })}:</strong> {t({ de: 'Zeigt dir alle geplanten Contents des aktuellen Monats. Mit den Buttons oben rechts kannst du auf eine chronologische Listen-Ansicht umschalten.', en: 'Shows all planned content for the current month and can switch to list view.', tr: 'Mevcut ayın tüm planlı içeriklerini gösterir. Sağ üstteki düğmelerle liste görünümüne geçebilirsiniz.' })}</li>
                            <li><strong>{t({ de: 'Rot markiert', en: 'Red markers', tr: 'Kırmızı işaretler' })}:</strong> {t({ de: 'Ein Eintrag leuchtet rot auf und zeigt ein Warndreieck? Das bedeutet, dass es sich nur um eine Content-Idee handelt und noch keine Aufgabe zur Umsetzung zugewiesen wurde.', en: 'Red cards indicate content without linked tasks yet.', tr: 'Kırmızı kartlar, henüz bağlantılı görevi olmayan içerikleri gösterir.' })}</li>
                        </ul>
                    </PageHelp>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('month')}>{t({ de: 'Monat', en: 'Month', tr: 'Ay' })}</button>
                        <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}>{t({ de: 'Liste', en: 'List', tr: 'Liste' })}</button>
                    </div>
                    {can('canEditContent') && (
                        <button className="btn btn-secondary" onClick={() => setShowIdeaWizard(true)} style={{ background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)', color: 'white', border: 'none' }}>
                            <Wand2 size={16} /> {t({ de: 'KI Content-Ideen', en: 'AI content ideas', tr: 'YZ İçerik Fikirleri' })}
                        </button>
                    )}
                    {can('canEditContent') && (
                        <button className="btn btn-primary" onClick={() => setShowNewContentModal(true)}>
                            <Plus size={16} /> {t({ de: 'Content planen', en: 'Plan content', tr: 'İçerik planla' })}
                        </button>
                    )}
                </div>
            </div>

            {noTaskCount > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '20px',
                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: 'var(--font-size-sm)'
                }}>
                    <AlertTriangle size={18} />
                    <span>{language === 'en'
                        ? <><strong>{noTaskCount} content item(s)</strong> still have no linked tasks and appear in <strong>red</strong>.</>
                        : language === 'tr'
                        ? <><strong>{noTaskCount} içerik</strong> henüz bağlantılı göreve sahip değil ve takvimde <strong>kırmızı</strong> görünüyor.</>
                        : <><strong>{noTaskCount} Content(s)</strong> haben noch keine verknüpften Aufgaben und erscheinen <strong>rot</strong> im Kalender.</>
                    }</span>
                </div>
            )}

            {/* Calendar Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-ghost btn-icon" onClick={prevMonth}><ChevronLeft size={20} /></button>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, minWidth: '200px', textAlign: 'center' }}>
                        {new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                    </h2>
                    <button className="btn btn-ghost btn-icon" onClick={nextMonth}><ChevronRight size={20} /></button>
                </div>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                        const now = new Date();
                        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
                    }}
                >
                    {t({ de: 'Heute', en: 'Today', tr: 'Bugün' })}
                </button>
            </div>

            {/* MONTH VIEW */}
            {view === 'month' && (
                <div className="calendar-grid">
                    {daysOfWeek.map(day => (
                        <div key={day} className="calendar-header-cell">{day}</div>
                    ))}
                    {calendarDays.map((cell, index) => {
                        const dayContents = getContentsForDate(cell.date);
                        const daySocialPosts = getSocialPostsForDate(cell.date);
                        const isToday = cell.date === today;
                        return (
                            <div key={index} className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                                <div className="calendar-day-number" style={isToday ? { color: 'var(--color-primary)', fontWeight: 700 } : {}}>
                                    {cell.day}
                                </div>
                                {dayContents.map(cnt => (
                                    <div key={cnt.id} className={`calendar-event ${getColorClass(cnt)}`}
                                        onClick={() => setSelectedContent(cnt)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        {(!cnt.taskIds || cnt.taskIds.length === 0) && <AlertTriangle size={9} />}
                                        {cnt.title.length > 22 ? cnt.title.slice(0, 22) + '…' : cnt.title}
                                    </div>
                                ))}
                                {daySocialPosts.map(sp => (
                                    <div key={sp.id} className="calendar-event"
                                        title={sp.post_text?.slice(0, 100)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '3px',
                                            background: 'rgba(14,165,233,0.12)', color: '#0284c7',
                                            borderLeft: '2px solid #0ea5e9', fontSize: 'var(--font-size-xs)',
                                            padding: '2px 6px', borderRadius: '4px', cursor: 'default',
                                        }}>
                                        <Radio size={9} />
                                        {(sp.topic || sp.platform || 'Post').length > 18 ? (sp.topic || sp.platform || 'Post').slice(0, 18) + '…' : (sp.topic || sp.platform || 'Post')}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>{t({ de: 'Datum', en: 'Date', tr: 'Tarih' })}</th>
                                    <th>{t({ de: 'Titel', en: 'Title', tr: 'Başlık' })}</th>
                                    <th>{t({ de: 'Plattform', en: 'Platform', tr: 'Platform' })}</th>
                                    <th>{t({ de: 'Status', en: 'Status', tr: 'Durum' })}</th>
                                    <th>{t({ de: 'Aufgaben', en: 'Tasks', tr: 'Görevler' })}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...contents].sort((a, b) => (a.publishDate || '').localeCompare(b.publishDate || '')).map(cnt => {
                                    const cst = CONTENT_STATUSES[cnt.status];
                                    const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                                    return (
                                        <tr key={cnt.id} onClick={() => setSelectedContent(cnt)} style={{ cursor: 'pointer' }}>
                                            <td style={{ fontSize: 'var(--font-size-xs)' }}>
                                                {cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' }) : '-'}
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{cnt.title}</td>
                                            <td><span className={`badge badge-${CONTENT_TYPE_COLORS[cnt.contentType] || 'info'}`}>{cnt.platform}</span></td>
                                            <td>
                                                <span className="badge" style={{ background: `${cst?.color}18`, color: cst?.color, border: `1px solid ${cst?.color}33` }}>
                                                    {cst?.icon} {cst?.label}
                                                </span>
                                            </td>
                                            <td>
                                                {hasTasks ? (
                                                    <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>✅ {cnt.taskIds.length}</span>
                                                ) : (
                                                    <span style={{ color: '#ef4444', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{t({ de: '⚠ Keine', en: '⚠ None', tr: '⚠ Yok' })}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                    { color: 'primary', label: 'Social Media' },
                    { color: 'info', label: 'E-Mail' },
                    { color: 'warning', label: 'Ads' },
                    { color: 'success', label: t({ de: 'Content / Events', en: 'Content / Events', tr: 'İçerik / Etkinlikler' }) },
                    { color: 'danger', label: t({ de: '⚠ Keine Aufgaben', en: '⚠ No tasks', tr: '⚠ Görev yok' }) },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        <div className={`calendar-event ${item.color}`} style={{ margin: 0, width: 12, height: 12, padding: 0, borderRadius: '3px' }} />
                        {item.label}
                    </div>
                ))}
                {socialPosts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '3px', background: 'rgba(14,165,233,0.2)', borderLeft: '2px solid #0ea5e9' }} />
                        Social Hub Post
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedContent && (
                <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
            )}

            {/* New Content Modal */}
            {showNewContentModal && (
                <NewContentModal onClose={() => setShowNewContentModal(false)} />
            )}

            {/* Content Idea Wizard */}
            {showIdeaWizard && (
                <ContentIdeaWizard onClose={() => setShowIdeaWizard(false)} />
            )}
        </div>
    );
}

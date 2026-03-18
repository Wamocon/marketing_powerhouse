import { useState } from 'react';
import type { ContentItem } from '../types';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import { useContents, CONTENT_STATUSES } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { CONTENT_TYPE_COLORS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import ContentDetailModal from '../components/ContentDetailModal';
import NewContentModal from '../components/NewContentModal';
import PageHelp from '../components/PageHelp';

const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; }

export default function ContentCalendarPage() {
    const { contents } = useContents();
    useTasks();
    const { can } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
    const [view, setView] = useState('month');
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [showNewContentModal, setShowNewContentModal] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = '2026-03-10';

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

    const getColorClass = (content) => {
        if (!content.taskIds || content.taskIds.length === 0) return 'danger';
        return CONTENT_TYPE_COLORS[content.contentType] || 'primary';
    };

    const noTaskCount = contents.filter(c => !c.taskIds || c.taskIds.length === 0).length;

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Content-Kalender</h1>
                    <p className="page-subtitle">Redaktionsplanung über alle Kanäle hinweg ({contents.length} Inhalte)</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Content-Kalender">
                        <p style={{ marginBottom: '12px' }}>Der Content-Kalender ist dein tägliches Navigationsinstrument für alle anstehenden Veröffentlichungen.</p>
                        <ul className="help-list">
                            <li><strong>Die Ansicht:</strong> Zeigt dir alle geplanten Contents des aktuellen Monats. Mit den Buttons oben rechts kannst du auf eine chronologische Listen-Ansicht umschalten.</li>
                            <li><strong>Rot markiert:</strong> Ein Eintrag leuchtet rot auf und zeigt ein Warndreieck? Das bedeutet, dass es sich nur um eine Content-Idee handelt und <strong>noch keine Aufgabe</strong> zur Umsetzung zugewiesen wurde!</li>
                            <li><strong>Content planen:</strong> Klicke auf den blauen Button, um direkt neue Beitrage zu terminieren.</li>
                        </ul>
                    </PageHelp>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('month')}>Monat</button>
                        <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}>Liste</button>
                    </div>
                    {can('canEditContent') && (
                        <button className="btn btn-primary" onClick={() => setShowNewContentModal(true)}>
                            <Plus size={16} /> Content planen
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
                    <span><strong>{noTaskCount} Content(s)</strong> haben noch keine verknüpften Aufgaben und erscheinen <strong>rot</strong> im Kalender.</span>
                </div>
            )}

            {/* Calendar Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-ghost btn-icon" onClick={prevMonth}><ChevronLeft size={20} /></button>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, minWidth: '200px', textAlign: 'center' }}>
                        {monthNames[month]} {year}
                    </h2>
                    <button className="btn btn-ghost btn-icon" onClick={nextMonth}><ChevronRight size={20} /></button>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date(2026, 2, 1))}>Heute</button>
            </div>

            {/* MONTH VIEW */}
            {view === 'month' && (
                <div className="calendar-grid">
                    {daysOfWeek.map(day => (
                        <div key={day} className="calendar-header-cell">{day}</div>
                    ))}
                    {calendarDays.map((cell, index) => {
                        const dayContents = getContentsForDate(cell.date);
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
                                    <th>Datum</th>
                                    <th>Titel</th>
                                    <th>Plattform</th>
                                    <th>Status</th>
                                    <th>Aufgaben</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...contents].sort((a, b) => (a.publishDate || '').localeCompare(b.publishDate || '')).map(cnt => {
                                    const cst = CONTENT_STATUSES[cnt.status];
                                    const hasTasks = cnt.taskIds && cnt.taskIds.length > 0;
                                    return (
                                        <tr key={cnt.id} onClick={() => setSelectedContent(cnt)} style={{ cursor: 'pointer' }}>
                                            <td style={{ fontSize: 'var(--font-size-xs)' }}>
                                                {cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' }) : '–'}
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
                                                    <span style={{ color: '#ef4444', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>⚠ Keine</span>
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
                    { color: 'success', label: 'Content / Events' },
                    { color: 'danger', label: '⚠ Keine Aufgaben' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        <div className={`calendar-event ${item.color}`} style={{ margin: 0, width: 12, height: 12, padding: 0, borderRadius: '3px' }} />
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedContent && (
                <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
            )}

            {/* New Content Modal */}
            {showNewContentModal && (
                <NewContentModal onClose={() => setShowNewContentModal(false)} />
            )}
        </div>
    );
}

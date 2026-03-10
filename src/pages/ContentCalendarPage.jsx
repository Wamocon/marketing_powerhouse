import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { calendarEvents } from '../data/mockData';

const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function ContentCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // März 2026
    const [view, setView] = useState('month');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Build calendar grid
    const calendarDays = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: null });
    }

    // Current month's days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        calendarDays.push({ day: d, isCurrentMonth: true, date: dateStr });
    }

    // Next month's leading days
    const remaining = 42 - calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
        calendarDays.push({ day: i, isCurrentMonth: false, date: null });
    }

    const getEventsForDate = (dateStr) => {
        if (!dateStr) return [];
        return calendarEvents.filter(e => e.date === dateStr);
    };

    const today = '2026-03-10';

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Content-Kalender</h1>
                    <p className="page-subtitle">Redaktionsplanung über alle Kanäle hinweg</p>
                </div>
                <div className="page-header-actions">
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button
                            className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setView('month')}
                        >Monat</button>
                        <button
                            className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setView('week')}
                        >Woche</button>
                        <button
                            className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setView('list')}
                        >Liste</button>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={16} /> Content planen
                    </button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, minWidth: '200px', textAlign: 'center' }}>
                        {monthNames[month]} {year}
                    </h2>
                    <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date(2026, 2, 1))}>
                    Heute
                </button>
            </div>

            {/* Calendar Grid */}
            {view === 'month' && (
                <div className="calendar-grid">
                    {daysOfWeek.map(day => (
                        <div key={day} className="calendar-header-cell">{day}</div>
                    ))}
                    {calendarDays.map((cell, index) => {
                        const events = getEventsForDate(cell.date);
                        const isToday = cell.date === today;
                        return (
                            <div
                                key={index}
                                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                            >
                                <div className="calendar-day-number" style={isToday ? { color: 'var(--color-primary)', fontWeight: 700 } : {}}>
                                    {cell.day}
                                </div>
                                {events.map(ev => (
                                    <div key={ev.id} className={`calendar-event ${ev.type}`}>
                                        {ev.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {view === 'list' && (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Titel</th>
                                    <th>Kanal</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calendarEvents.sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
                                    <tr key={ev.id}>
                                        <td>{new Date(ev.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                        <td style={{ fontWeight: 500 }}>{ev.title}</td>
                                        <td><span className={`badge badge-${ev.type === 'primary' ? 'primary' : ev.type === 'success' ? 'success' : ev.type === 'warning' ? 'warning' : 'info'}`}>{ev.channel}</span></td>
                                        <td><span className="badge badge-success">Geplant</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Week View Placeholder */}
            {view === 'week' && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <div className="empty-state-title">Wochenansicht</div>
                        <div className="empty-state-text">
                            Die Wochenansicht wird in der nächsten Iteration implementiert. Sie zeigt eine detaillierte Stunden-Ansicht für die aktuelle Woche.
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '24px', justifyContent: 'center' }}>
                {[
                    { color: 'primary', label: 'Social Media' },
                    { color: 'info', label: 'E-Mail' },
                    { color: 'warning', label: 'Ads' },
                    { color: 'success', label: 'Content' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        <div className={`calendar-event ${item.color}`} style={{ margin: 0, width: 12, height: 12, padding: 0, borderRadius: '3px' }} />
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

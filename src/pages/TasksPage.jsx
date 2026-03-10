import { useState } from 'react';
import { Plus, Filter, Calendar, User } from 'lucide-react';
import { tasks } from '../data/mockData';

const columns = [
    { id: 'todo', title: 'Offen', dotColor: 'var(--text-tertiary)' },
    { id: 'in-progress', title: 'In Arbeit', dotColor: 'var(--color-info)' },
    { id: 'in-review', title: 'In Review', dotColor: 'var(--color-warning)' },
    { id: 'done', title: 'Erledigt', dotColor: 'var(--color-success)' },
];

const priorityConfig = {
    high: { label: 'Hoch', badge: 'badge-danger' },
    medium: { label: 'Mittel', badge: 'badge-warning' },
    low: { label: 'Niedrig', badge: 'badge-info' },
};

export default function TasksPage() {
    const [view, setView] = useState('kanban');

    const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Aufgaben</h1>
                    <p className="page-subtitle">{tasks.length} Aufgaben · {tasks.filter(t => t.status === 'done').length} erledigt</p>
                </div>
                <div className="page-header-actions">
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button
                            className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setView('kanban')}
                        >Kanban</button>
                        <button
                            className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setView('list')}
                        >Liste</button>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={16} /> Neue Aufgabe
                    </button>
                </div>
            </div>

            {/* Kanban View */}
            {view === 'kanban' && (
                <div className="kanban-board">
                    {columns.map(col => {
                        const colTasks = getTasksByStatus(col.id);
                        return (
                            <div key={col.id} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div className="kanban-column-title">
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dotColor }} />
                                        {col.title}
                                    </div>
                                    <span className="kanban-column-count">{colTasks.length}</span>
                                </div>
                                {colTasks.map(task => {
                                    const priority = priorityConfig[task.priority];
                                    return (
                                        <div key={task.id} className="kanban-card">
                                            <div className="kanban-card-title">{task.title}</div>
                                            {task.campaign && (
                                                <div style={{
                                                    fontSize: '0.6875rem',
                                                    color: 'var(--color-primary-light)',
                                                    background: 'var(--color-primary-50)',
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--radius-full)',
                                                    display: 'inline-block',
                                                    marginBottom: '8px',
                                                }}>
                                                    {task.campaign}
                                                </div>
                                            )}
                                            <div className="kanban-card-meta">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.5625rem',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}>
                                                        {task.assignee.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span>{task.assignee.split(' ')[0]}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className={`badge ${priority.badge}`} style={{ fontSize: '0.625rem' }}>
                                                        {priority.label}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <Calendar size={10} />
                                                        {new Date(task.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <button className="btn btn-ghost btn-sm w-full" style={{ marginTop: '8px', justifyContent: 'center' }}>
                                    <Plus size={14} /> Aufgabe hinzufügen
                                </button>
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
                                    <th>Aufgabe</th>
                                    <th>Status</th>
                                    <th>Priorität</th>
                                    <th>Zugewiesen</th>
                                    <th>Kampagne</th>
                                    <th>Fällig</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => {
                                    const priority = priorityConfig[task.priority];
                                    const statusLabel = columns.find(c => c.id === task.status)?.title || task.status;
                                    return (
                                        <tr key={task.id}>
                                            <td style={{ fontWeight: 500 }}>{task.title}</td>
                                            <td>
                                                <span className={`badge ${task.status === 'done' ? 'badge-success' : task.status === 'in-progress' ? 'badge-info' : task.status === 'in-review' ? 'badge-warning' : 'badge-primary'}`}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td><span className={`badge ${priority.badge}`}>{priority.label}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.5625rem',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}>
                                                        {task.assignee.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    {task.assignee}
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{task.campaign || '–'}</td>
                                            <td>{new Date(task.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

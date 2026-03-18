import { useState } from 'react';
import type { Task } from '../types';
import { Plus, Calendar, CheckSquare, Clock, ArrowRight, User, ExternalLink, Globe, LayoutList, GripVertical } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useData } from '../context/DataContext';
import TaskDetailModal from '../components/TaskDetailModal';
import NewTaskModal from '../components/NewTaskModal';
import PageHelp from '../components/PageHelp';

// We map our 10-step creative status model to 5 Kanban lanes for the overview
const STATUS_GROUPS = [
    { id: 'todo', title: 'Offen / KI-Phase', statuses: ['draft', 'ai_generating', 'ai_ready'], color: 'var(--text-tertiary)' },
    { id: 'review', title: 'In Review', statuses: ['review', 'revision'], color: 'var(--color-warning)' },
    { id: 'approved', title: 'Freigegeben', statuses: ['approved'], color: 'var(--color-info)' },
    { id: 'scheduled', title: 'Eingeplant', statuses: ['scheduled'], color: 'var(--color-primary)' },
    { id: 'done', title: 'Live / Erledigt', statuses: ['posted', 'monitoring', 'analyzed'], color: 'var(--color-success)' },
];

const UI_STATE_LABELS = {
    draft: 'Entwurf', ai_generating: 'KI generiert…', ai_ready: 'KI-Vorschlag', review: 'Im Review', revision: 'Überarbeitung',
    approved: 'Freigegeben', scheduled: 'Eingeplant', posted: 'Gepostet', monitoring: 'Beobachtung', analyzed: 'Analysiert'
};

export default function TasksPage() {
    const { tasks, updateTaskStatus } = useTasks();
    const { campaigns } = useData();
    const [view, setView] = useState('kanban');

    // Modal state for Task Details & Creation
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showNewTask, setShowNewTask] = useState(false);

    // Drag & Drop state
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
        
        // Add a class to the dragging element for styling
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        setDraggedTask(null);
        e.currentTarget.classList.remove('dragging');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
    };

    const handleDragLeave = (e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.background = 'var(--bg-base)';
    };

    const handleDrop = (e, targetStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId && targetStatus) {
            updateTaskStatus(taskId, targetStatus);
        }
        setDraggedTask(null);
    };

    const getGroupTasks = (groupId) => {
        const group = STATUS_GROUPS.find(g => g.id === groupId);
        return tasks.filter(t => group?.statuses.includes(t.status));
    };

    const getCampaignName = (campaignId) => {
        if (!campaignId) return 'Allgemein';
        return campaigns.find(c => c.id === campaignId)?.name || 'Unbekannte Kampagne';
    };

    // Card Renderer for Kanban
    const TaskCard = ({ task }) => (
        <div className="kanban-card" onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
            <div className="kanban-card-title">{task.title}</div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                    {UI_STATE_LABELS[task.status] || task.status}
                </span>
                {task.platform && (
                    <span className="badge badge-info" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                        {task.platform}
                    </span>
                )}
            </div>

            <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', background: 'var(--color-primary-50)', padding: '2px 8px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: '8px' }}>
                {getCampaignName(task.campaignId)}
            </div>

            <div className="kanban-card-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 600 }}>
                        {task.assignee ? task.assignee.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                    <span>{task.assignee?.split(' ')[0] || 'Unzugewiesen'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: new Date(task.dueDate) < new Date() ? 'var(--color-danger)' : 'inherit' }}>
                        <Calendar size={10} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : 'Kein Datum'}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Globale Aufgaben & Creatives</h1>
                    <p className="page-subtitle">Alle Kampagnen-Creatives und anstehenden Tasks im Überblick ({tasks.length})</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Aufgaben-Kanban & Delegation">
                        <p style={{ marginBottom: '12px' }}>Willkommen im Ticket-Board! Hier werden alle offenen Aufträge für Creatives und Content-Elemente verwaltet.</p>
                        <ul className="help-list">
                            <li><strong>To Do / Offen:</strong> Hier landen alle frischen Aufgaben, die an das kreative Team delegiert wurden.</li>
                            <li><strong>Detailansicht:</strong> Klicke auf eine Kartekrte, um das Briefing des Managers zu lesen und den zugehörigen Content einzusehen.</li>
                            <li><strong>Ressourcen-Link (WICHTIG):</strong> Sobald du als Bearbeiter fertig bist, lade deine Dateien im Unternehmens-OneDrive hoch und speichere den Link in dieser Aufgabe.</li>
                            <li><strong>Status Updaten:</strong> Pflege den Status deiner Aufgaben gewissenhaft (auf In Progress oder Review), damit der Manager weiß, dass die Datei zur Freigabe liegt.</li>
                            <li><strong>Ansichten:</strong> Oben rechts kannst du zwischen Kanban-Board und Listen-Ansicht wechseln.</li>
                        </ul>
                    </PageHelp>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('kanban')}><GripVertical size={14} /> Kanban</button>
                        <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}><LayoutList size={14} /> Liste</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                        <Plus size={16} /> Neue Aufgabe
                    </button>
                </div>
            </div>

            {/* KANBAN VIEW */}
            {view === 'kanban' && (
                <div className="kanban-board">
                    {STATUS_GROUPS.map(group => {
                        const groupTasks = getGroupTasks(group.id);
                        return (
                            <div key={group.id} className="kanban-column" style={{ background: 'var(--bg-elevated)' }}>
                                <div className="kanban-column-header">
                                    <div className="kanban-column-title">
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color }} />
                                        {group.title}
                                    </div>
                                    <span className="kanban-column-count">{groupTasks.length}</span>
                                </div>
                                
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {/* Sub-Dropping Zones when Dragging */}
                                    {draggedTask && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                            {group.statuses.map(s => (
                                                <div 
                                                    key={s} 
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, s)}
                                                    style={{
                                                        padding: '12px 8px',
                                                        border: draggedTask.status === s ? '2px dashed var(--text-tertiary)' : `2px dashed ${group.color}`,
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: 'var(--bg-base)',
                                                        textAlign: 'center',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        color: draggedTask.status === s ? 'var(--text-tertiary)' : group.color,
                                                        transition: 'all 0.2s ease',
                                                        opacity: draggedTask.status === s ? 0.4 : 1
                                                    }}
                                                >
                                                    Hier droppen: {UI_STATE_LABELS[s] || s}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Task Cards */}
                                    {groupTasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            draggable 
                                            onDragStart={(e) => handleDragStart(e, task)} 
                                            onDragEnd={handleDragEnd}
                                            style={{ 
                                                opacity: draggedTask?.id === task.id ? 0.3 : (draggedTask ? 0.7 : 1),
                                                transform: draggedTask?.id === task.id ? 'scale(0.95)' : 'none',
                                                transition: 'all 0.2s',
                                                cursor: 'grab'
                                            }}
                                        >
                                            <TaskCard task={task} />
                                        </div>
                                    ))}
                                </div>
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
                                    <th>Titel</th>
                                    <th>Status (Detail)</th>
                                    <th>Kampagne</th>
                                    <th>Bearbeiter</th>
                                    <th>Plattform</th>
                                    <th>Fällig am</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                                        <td style={{ fontWeight: 600 }}>{task.title}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--bg-elevated)' }}>
                                                {UI_STATE_LABELS[task.status] || task.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{getCampaignName(task.campaignId)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                                                <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5rem', fontWeight: 600 }}>{task.assignee?.charAt(0) || '?'}</div>
                                                {task.assignee || '–'}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-info">{task.platform || 'Alle'}</span></td>
                                        <td style={{ fontSize: 'var(--font-size-xs)' }}>
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : '–'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL (Slide-in oder Pop-up) */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* NEUE AUFGABE MODAL */}
            {showNewTask && (
                <NewTaskModal onClose={() => setShowNewTask(false)} />
            )}
        </div>
    );
}

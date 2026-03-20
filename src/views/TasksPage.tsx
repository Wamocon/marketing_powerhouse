import React, { useState, useRef } from 'react';
import type { Task, TaskStatus } from '../types';
import { Plus, Calendar, CheckSquare, Clock, ArrowRight, User, ExternalLink, Globe, LayoutList, GripVertical } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import TaskDetailModal from '../components/TaskDetailModal';
import NewTaskModal from '../components/NewTaskModal';
import PageHelp from '../components/PageHelp';

// We map our 10-step creative status model to 5 Kanban lanes for the overview
const STATUS_GROUPS = [
    { id: 'todo', title: 'Offen / KI-Phase', statuses: ['draft', 'ai_generating', 'ai_ready'], color: 'var(--text-tertiary)', defaultStatus: 'draft' as TaskStatus },
    { id: 'review', title: 'In Review', statuses: ['review', 'revision'], color: 'var(--color-warning)', defaultStatus: 'review' as TaskStatus },
    { id: 'approved', title: 'Freigegeben', statuses: ['approved'], color: 'var(--color-info)', defaultStatus: 'approved' as TaskStatus },
    { id: 'scheduled', title: 'Eingeplant', statuses: ['scheduled'], color: 'var(--color-primary)', defaultStatus: 'scheduled' as TaskStatus },
    { id: 'done', title: 'Live / Erledigt', statuses: ['live', 'monitoring', 'analyzed'], color: 'var(--color-success)', defaultStatus: 'live' as TaskStatus },
];

const UI_STATE_LABELS = {
    draft: 'Entwurf', ai_generating: 'KI generiert…', ai_ready: 'KI-Vorschlag', review: 'Im Review', revision: 'Überarbeitung',
    approved: 'Freigegeben', scheduled: 'Eingeplant', live: 'Live', monitoring: 'Beobachtung', analyzed: 'Analysiert'
};

const TASK_STATUS_MODEL = [
    {
        id: 'draft',
        title: 'Entwurf',
        description: 'Aufgabe ist angelegt, Briefing und Zielsetzung werden initial definiert.',
        entry: ['Neue Aufgabe wurde erstellt.'],
        exit: ['KI-Generierung wurde gestartet oder Aufgabe wurde manuell weiterqualifiziert.'],
    },
    {
        id: 'ai_generating',
        title: 'KI generiert',
        description: 'Die App erstellt automatisch einen ersten Vorschlag für den Creative-Output.',
        entry: ['KI-Agent wurde ausgelöst.'],
        exit: ['Vorschlag liegt vor und Status wechselt auf KI-Vorschlag.'],
    },
    {
        id: 'ai_ready',
        title: 'KI-Vorschlag',
        description: 'Ein KI-Entwurf ist verfügbar und kann geprüft oder überarbeitet werden.',
        entry: ['Generierung ist abgeschlossen oder Revision wurde eingearbeitet.'],
        exit: ['Feedback führt zu Überarbeitung oder Aufgabe geht ins Review.'],
    },
    {
        id: 'revision',
        title: 'Überarbeitung',
        description: 'Korrekturen werden umgesetzt, meist auf Basis von Feedback.',
        entry: ['KI-Feedback wurde gesendet oder Review fordert Anpassungen.'],
        exit: ['Überarbeiteter Vorschlag ist erneut als KI-Vorschlag verfügbar.'],
    },
    {
        id: 'review',
        title: 'Im Review',
        description: 'Fachliche/qualitative Prüfung durch verantwortliche Personen.',
        entry: ['Umsetzbarer Vorschlag liegt zur Abnahme vor.'],
        exit: ['Freigabe erteilt oder Rückgabe in Überarbeitung.'],
    },
    {
        id: 'approved',
        title: 'Freigegeben',
        description: 'Task ist inhaltlich akzeptiert und bereit zur Einplanung.',
        entry: ['Review wurde positiv abgeschlossen.'],
        exit: ['Veröffentlichungstermin und Kanalplanung sind gesetzt.'],
    },
    {
        id: 'scheduled',
        title: 'Eingeplant',
        description: 'Ausspielung ist terminiert und vorbereitet.',
        entry: ['Freigegebene Aufgabe wurde zeitlich eingeplant.'],
        exit: ['Content geht live.'],
    },
    {
        id: 'live',
        title: 'Live',
        description: 'Die Maßnahme läuft produktiv auf dem Zielkanal.',
        entry: ['Geplanter Task wurde veröffentlicht.'],
        exit: ['Aktive Performance-Beobachtung startet.'],
    },
    {
        id: 'monitoring',
        title: 'Beobachtung',
        description: 'Performance wird überwacht; in der App werden KPI-Daten hinterlegt.',
        entry: ['Task wird in Monitoring überführt (setzt Performance-Daten).'],
        exit: ['Analyse wird ausgelöst und Ergebnis dokumentiert.'],
    },
    {
        id: 'analyzed',
        title: 'Analysiert',
        description: 'Leistung wurde bewertet und als Erkenntnis für Folgeaktionen festgehalten.',
        entry: ['Task-Analyse wurde ausgeführt.'],
        exit: ['Optional: neue Iteration oder Folgeaufgabe wird angelegt.'],
    },
] as const;

const DONE_STATUSES = STATUS_GROUPS.find(g => g.id === 'done')!.statuses;

function getDateUrgency(task: Task): 'overdue' | 'due-soon' | 'live' | 'normal' {
    if (task.status === 'live' || task.status === 'monitoring') return 'live';
    if (!task.dueDate || DONE_STATUSES.includes(task.status)) return 'normal';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'due-soon';
    return 'normal';
}

export default function TasksPage() {
    const { tasks, updateTaskStatus } = useTasks();
    const { campaigns } = useData();
    const { can } = useAuth();
    const [view, setView] = useState('kanban');

    // Modal state for Task Details & Creation
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showNewTask, setShowNewTask] = useState(false);

    // Drag & Drop — ref-based to avoid React re-render breaking the native drag
    const draggingTaskId = useRef<string | null>(null);
    const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        draggingTaskId.current = taskId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
        // Defer opacity update so browser captures the full card as drag image first
        requestAnimationFrame(() => {
            (e.target as HTMLElement).style.opacity = '0.35';
        });
    };

    const handleDragEnd = (e: React.DragEvent) => {
        draggingTaskId.current = null;
        setDragOverGroup(null);
        setDragOverStatus(null);
        (e.target as HTMLElement).style.opacity = '';
    };

    // Column-level handlers — keep column outline when hovering the header area
    const handleColumnDragOver = (e: React.DragEvent, groupId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverGroup(groupId);
    };

    const handleColumnDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverGroup(null);
            setDragOverStatus(null);
        }
    };

    // Fallback: drop on column header → use the group's default status
    const handleColumnDrop = (e: React.DragEvent, defaultStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId.current;
        if (taskId) updateTaskStatus(taskId, defaultStatus);
        draggingTaskId.current = null;
        setDragOverGroup(null);
        setDragOverStatus(null);
    };

    // Sub-status zone handlers — precise drop target for each individual status
    const handleSubDragOver = (e: React.DragEvent, status: string, groupId: string) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStatus(status);
        setDragOverGroup(groupId); // keep column outline active too
    };

    const handleSubDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverStatus(null);
        }
    };

    const handleSubDrop = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        e.stopPropagation();
        const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId.current;
        if (taskId) updateTaskStatus(taskId, status);
        draggingTaskId.current = null;
        setDragOverGroup(null);
        setDragOverStatus(null);
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
    const TaskCard = ({ task }) => {
        const urgency = getDateUrgency(task);
        const isOver = urgency === 'overdue';
        const isSoon = urgency === 'due-soon';

        const isLive = urgency === 'live';
        const cardBg = isOver ? '#b91c1c' : isSoon ? '#fef9c3' : isLive ? '#dcfce7' : undefined;
        const mainText = isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : undefined;
        const subText = isOver ? 'rgba(255,255,255,0.75)' : isSoon ? '#92400e' : isLive ? '#166534' : 'var(--text-secondary)';
        const badgeBg = isOver ? 'rgba(255,255,255,0.2)' : isSoon ? 'rgba(120,53,15,0.12)' : isLive ? 'rgba(20,83,45,0.12)' : 'var(--bg-hover)';
        const badgeColor = isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : 'var(--text-secondary)';
        const platformBg = isOver ? 'rgba(255,255,255,0.2)' : isSoon ? 'rgba(120,53,15,0.12)' : isLive ? 'rgba(20,83,45,0.12)' : 'rgba(6, 182, 212, 0.1)';
        const platformColor = isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : '#06b6d4';
        const campaignBg = isOver ? 'rgba(255,255,255,0.2)' : isSoon ? 'rgba(120,53,15,0.12)' : isLive ? 'rgba(20,83,45,0.12)' : 'var(--color-primary-50)';
        const campaignColor = isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : 'var(--color-primary)';
        const dateColor = isOver ? '#ffffff' : isSoon ? '#b45309' : isLive ? '#166534' : (task.dueDate && new Date(task.dueDate) < new Date() ? 'var(--color-danger)' : 'inherit');

        return (
            <div
                className="kanban-card"
                onClick={() => setSelectedTask(task)}
                style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', ...(cardBg && { background: cardBg }), ...(mainText && { color: mainText }) }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            >
                <div className="kanban-card-title" style={mainText ? { color: mainText } : undefined}>{task.title}</div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span className="badge" style={{ background: badgeBg, color: badgeColor }}>
                        {UI_STATE_LABELS[task.status] || task.status}
                    </span>
                    {task.platform && (
                        <span className="badge badge-info" style={{ background: platformBg, color: platformColor }}>
                            {task.platform}
                        </span>
                    )}
                </div>

                <div style={{ fontSize: '0.65rem', color: campaignColor, background: campaignBg, padding: '2px 8px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: '8px' }}>
                    {getCampaignName(task.campaignId)}
                </div>

                <div className="kanban-card-meta" style={{ color: subText }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 600 }}>
                            {task.assignee ? task.assignee.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                        <span style={{ color: subText }}>{task.assignee?.split(' ')[0] || 'Unzugewiesen'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: dateColor }}>
                            <Calendar size={10} />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : 'Kein Datum'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

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
                            <li><strong>Detailansicht:</strong> Klicke auf eine Karte, um das Briefing des Managers zu lesen und den zugehörigen Content einzusehen.</li>
                            <li><strong>Ressourcen-Link (WICHTIG):</strong> Sobald du als Bearbeiter fertig bist, lade deine Dateien im Unternehmens-OneDrive hoch und speichere den Link in dieser Aufgabe.</li>
                            <li><strong>Status Updaten:</strong> Pflege den Status deiner Aufgaben gewissenhaft (auf In Progress oder Review), damit der Manager weiß, dass die Datei zur Freigabe liegt.</li>
                            <li><strong>Ansichten:</strong> Oben rechts kannst du zwischen Kanban-Board und Listen-Ansicht wechseln.</li>
                        </ul>
                    </PageHelp>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                        <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('kanban')}><GripVertical size={14} /> Kanban</button>
                        <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}><LayoutList size={14} /> Liste</button>
                    </div>
                    {can('canCreateCampaignTasks') && (
                        <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                            <Plus size={16} /> Neue Aufgabe
                        </button>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>Statusmodell Aufgaben</h3>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            End-to-end Ablauf vom Entwurf bis zur Analyse mit Ein- und Ausgangskriterien.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {TASK_STATUS_MODEL.map((status, idx) => {
                        const isLast = idx === TASK_STATUS_MODEL.length - 1;
                        const label = UI_STATE_LABELS[status.id] || status.id;
                        return (
                            <React.Fragment key={status.id}>
                                <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                                    {label}
                                </span>
                                {!isLast && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>→</span>}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                    {TASK_STATUS_MODEL.map(status => {
                        const label = UI_STATE_LABELS[status.id] || status.id;
                        return (
                            <div key={status.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', borderLeft: '3px solid var(--color-primary)' }}>
                                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '6px' }}>{label}</div>
                                <p style={{ marginTop: 0, marginBottom: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{status.description}</p>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Eingangskriterien</div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {status.entry.map(item => <li key={item}>{item}</li>)}
                                </ul>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', marginTop: '8px', marginBottom: '4px' }}>Ausgangskriterien</div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {status.exit.map(item => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* KANBAN VIEW */}
            {view === 'kanban' && (
                <div className="kanban-board">
                    {STATUS_GROUPS.map(group => {
                        const groupTasks = getGroupTasks(group.id);
                        const isColumnActive = dragOverGroup === group.id;
                        return (
                            <div
                                key={group.id}
                                className="kanban-column"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    outline: isColumnActive ? `2px solid ${group.color}` : '2px solid transparent',
                                    transition: 'outline 0.15s',
                                }}
                                onDragOver={(e) => handleColumnDragOver(e, group.id)}
                                onDragLeave={handleColumnDragLeave}
                                onDrop={(e) => handleColumnDrop(e, group.defaultStatus)}
                            >
                                <div className="kanban-column-header">
                                    <div className="kanban-column-title">
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color }} />
                                        {group.title}
                                    </div>
                                    <span className="kanban-column-count">{groupTasks.length}</span>
                                </div>
                                
                                {/* Sub-status zones — one per status in this group, always visible */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {group.statuses.map((status) => {
                                        const subTasks = tasks.filter(t => t.status === status);
                                        const isSubActive = dragOverStatus === status;
                                        return (
                                            <div
                                                key={status}
                                                onDragOver={(e) => handleSubDragOver(e, status, group.id)}
                                                onDragLeave={handleSubDragLeave}
                                                onDrop={(e) => handleSubDrop(e, status as TaskStatus)}
                                                style={{
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: isSubActive
                                                        ? `2px dashed ${group.color}`
                                                        : '2px dashed transparent',
                                                    background: isSubActive ? `${group.color}12` : 'transparent',
                                                    transition: 'border-color 0.15s, background 0.15s',
                                                    padding: '6px',
                                                }}
                                            >
                                                {/* Sub-status label */}
                                                <div style={{
                                                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em',
                                                    textTransform: 'uppercase', color: group.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '2px 4px', marginBottom: subTasks.length > 0 || isSubActive ? '6px' : '2px',
                                                    opacity: isSubActive ? 1 : 0.65,
                                                }}>
                                                    <span>{UI_STATE_LABELS[status]}</span>
                                                    {subTasks.length > 0 && (
                                                        <span style={{
                                                            background: `${group.color}22`, color: group.color,
                                                            borderRadius: 'var(--radius-full)', padding: '0px 6px',
                                                            fontSize: '0.6rem',
                                                        }}>
                                                            {subTasks.length}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Drop hint when this sub-zone is active and empty */}
                                                {isSubActive && subTasks.length === 0 && (
                                                    <div style={{
                                                        padding: '10px 8px', textAlign: 'center',
                                                        fontSize: '0.75rem', color: group.color, opacity: 0.6,
                                                    }}>
                                                        Hier ablegen
                                                    </div>
                                                )}

                                                {/* Task cards for this sub-status */}
                                                {subTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                                        onDragEnd={handleDragEnd}
                                                        style={{ cursor: 'grab', marginBottom: '8px' }}
                                                    >
                                                        <TaskCard task={task} />
                                                    </div>
                                                ))}

                                                {/* Empty placeholder when not hovering */}
                                                {!isSubActive && subTasks.length === 0 && (
                                                    <div style={{
                                                        padding: '6px 4px', fontSize: '0.65rem',
                                                        color: 'var(--text-tertiary)', opacity: 0.35, fontStyle: 'italic',
                                                    }}>
                                                        Leer
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                {tasks.map(task => {
                                    const urgency = getDateUrgency(task);
                                    const isOver = urgency === 'overdue';
                                    const isSoon = urgency === 'due-soon';
                                    const isLive = urgency === 'live';
                                    const rowBg = isOver ? '#b91c1c' : isSoon ? '#fef9c3' : isLive ? '#dcfce7' : undefined;
                                    const rowText = isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : undefined;
                                    const subText = isOver ? 'rgba(255,255,255,0.75)' : isSoon ? '#92400e' : isLive ? '#166534' : 'var(--text-secondary)';
                                    const badgeBg = isOver ? 'rgba(255,255,255,0.2)' : isSoon ? 'rgba(120,53,15,0.12)' : isLive ? 'rgba(20,83,45,0.12)' : 'var(--bg-elevated)';
                                    const badgeColor = isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : undefined;
                                    return (
                                        <tr key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', ...(rowBg && { background: rowBg }), ...(rowText && { color: rowText }) }}>
                                            <td style={{ fontWeight: 600, ...(rowText && { color: rowText }) }}>{task.title}</td>
                                            <td>
                                                <span className="badge" style={{ background: badgeBg, ...(badgeColor && { color: badgeColor }) }}>
                                                    {UI_STATE_LABELS[task.status] || task.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 'var(--font-size-xs)', color: subText }}>{getCampaignName(task.campaignId)}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: subText }}>
                                                    <div style={{ width: 20, height: 20, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5rem', fontWeight: 600 }}>{task.assignee?.charAt(0) || '?'}</div>
                                                    {task.assignee || '–'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-info" style={{ background: isOver ? 'rgba(255,255,255,0.2)' : isSoon ? 'rgba(120,53,15,0.12)' : isLive ? 'rgba(20,83,45,0.12)' : undefined, color: isOver ? '#ffffff' : isSoon ? '#78350f' : isLive ? '#14532d' : undefined }}>
                                                    {task.platform || 'Alle'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 'var(--font-size-xs)', ...(rowText && { color: rowText }) }}>
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : '–'}
                                            </td>
                                        </tr>
                                    );
                                })}
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

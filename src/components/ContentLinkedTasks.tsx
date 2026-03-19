import { ListChecks, AlertTriangle, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Task } from '../types';

interface ContentLinkedTasksProps {
    linkedTasks: Task[];
    hasTasks: boolean;
    canEdit: boolean;
    showNewTask: boolean;
    setShowNewTask: (v: boolean) => void;
    newTaskTitle: string;
    setNewTaskTitle: (v: string) => void;
    newTaskPlatform: string;
    setNewTaskPlatform: (v: string) => void;
    newTaskAssignee: string;
    setNewTaskAssignee: (v: string) => void;
    handleAddTask: () => void;
}

export function ContentLinkedTasks({
    linkedTasks, hasTasks, canEdit, showNewTask, setShowNewTask,
    newTaskTitle, setNewTaskTitle, newTaskPlatform, setNewTaskPlatform,
    newTaskAssignee, setNewTaskAssignee, handleAddTask,
}: ContentLinkedTasksProps) {
    const { users: testUsers } = useData();
    return (
        <div className="card" style={{ borderLeft: hasTasks ? '4px solid var(--color-success)' : '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <ListChecks size={16} /> Verknüpfte Aufgaben ({linkedTasks.length})
                </h4>
                {canEdit && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowNewTask(!showNewTask)}>
                        <Plus size={14} /> Aufgabe hinzufügen
                    </button>
                )}
            </div>

            {showNewTask && (
                <div style={{
                    padding: '14px', marginBottom: '12px', background: 'rgba(99, 102, 241, 0.04)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.15)',
                }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '10px' }}>
                        Neue Aufgabe für diesen Content
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                        <input className="form-input" placeholder="Aufgaben-Titel *" value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)} style={{ fontSize: 'var(--font-size-sm)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <select className="form-input" value={newTaskPlatform} onChange={e => setNewTaskPlatform(e.target.value)} style={{ fontSize: 'var(--font-size-xs)' }}>
                            <option value="">Plattform</option>
                            {['Instagram', 'LinkedIn', 'Google Ads', 'Meta Ads', 'TikTok', 'E-Mail', 'Website', 'YouTube'].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <select className="form-input" value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} style={{ fontSize: 'var(--font-size-xs)' }}>
                            <option value="">Bearbeiter</option>
                            {testUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowNewTask(false)}>Abbrechen</button>
                        <button className="btn btn-primary btn-sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                            <Plus size={14} /> Erstellen
                        </button>
                    </div>
                </div>
            )}

            {!hasTasks && !showNewTask ? (
                <div style={{
                    padding: '16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <AlertTriangle size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, color: '#ef4444', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>Keine Aufgaben verknüpft</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                            Klicke auf „Aufgabe hinzufügen" um eine Aufgabe zu erstellen und mit diesem Content zu verknüpfen.
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {linkedTasks.map(t => (
                        <div key={t.id} style={{
                            padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{t.title}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', marginTop: '3px' }}>
                                    <span>{t.assignee || 'Unzugewiesen'}</span>
                                    <span>·</span>
                                    <span>{t.platform || 'Übergreifend'}</span>
                                    <span>·</span>
                                    <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('de-DE') : 'Kein Datum'}</span>
                                </div>
                            </div>
                            <span className="badge" style={{ background: 'var(--bg-elevated)', fontSize: '0.65rem' }}>{t.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

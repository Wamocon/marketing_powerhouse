import { useState } from 'react';
import Link from 'next/link';
import { Calendar, FileText, CheckCircle, Plus, Clock, User, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContents, CONTENT_STATUSES, CONTENT_STATUS_ORDER } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { campaigns, CONTENT_TYPE_COLORS, touchpoints } from '../data/mockData';
import { ContentLinkedTasks } from './ContentLinkedTasks';
import type { ContentItem, ContentStatus } from '../types';

const CONTENT_TYPE_LABELS: Record<string, string> = {
    social: 'Social Media', email: 'E-Mail', ads: 'Ads / Anzeige', content: 'Blog / Content', event: 'Event'
};

interface ContentDetailModalProps {
    content: ContentItem;
    onClose: () => void;
}

export default function ContentDetailModal({ content, onClose }: ContentDetailModalProps) {
    const { currentUser, can } = useAuth();
    const { updateContent } = useContents();
    const { tasks, addTask } = useTasks();
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState({ ...content });
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPlatform, setNewTaskPlatform] = useState(content.platform || '');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');

    const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    const canDelete = can ? can('canDeleteItems') : canEdit;

    const getCampaignName = (cId: string | null | undefined) => {
        if (!cId) return 'Ohne Kampagne';
        return campaigns.find(c => c.id === cId)?.name || 'Unbekannt';
    };

    const getTouchpointName = (tpId: string | null | undefined) => {
        if (!tpId) return 'Nicht verknüpft';
        return touchpoints.find(tp => tp.id === tpId)?.name || 'Unbekannt';
    };

    const linkedTasks = tasks.filter(t => content.taskIds && content.taskIds.includes(t.id));
    const hasTasks = linkedTasks.length > 0;
    const st = CONTENT_STATUSES[content.status];

    const handleSave = () => {
        updateContent(content.id, edited);
        setIsEditing(false);
        onClose();
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const taskId = 't' + Date.now();
        addTask({
            id: taskId,
            title: newTaskTitle,
            status: 'draft',
            assignee: newTaskAssignee || '',
            author: currentUser?.name || 'System',
            dueDate: content.publishDate || '',
            publishDate: null,
            platform: newTaskPlatform || null,
            type: 'Task',
            oneDriveLink: '',
            description: `Aufgabe für Content "${content.title}".`,
            campaignId: content.campaignId || null,
            scope: 'single',
        });
        // Link the task to this content
        updateContent(content.id, {
            taskIds: [...(content.taskIds || []), taskId]
        });
        setNewTaskTitle('');
        setNewTaskPlatform(content.platform || '');
        setNewTaskAssignee('');
        setShowNewTask(false);
    };

    if (!content) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, maxHeight: '90vh', width: '100%', maxWidth: '750px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* HEADER */}
                <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                        Content-Details
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {canEdit && !isEditing && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                                <Edit2 size={16} /> Bearbeiten
                            </button>
                        )}
                        {canDelete && !isEditing && (
                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: '#ef4444' }} onClick={() => {
                                if (window.confirm('Möchtest du diesen Content wirklich löschen?')) {
                                    onClose();
                                }
                            }} title="Löschen">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                {/* BODY */}
                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
                    {/* Title + Status + Description */}
                    <div className="card" style={{ marginBottom: '16px', borderLeft: `4px solid ${st?.color}` }}>
                        {isEditing ? (
                            <input className="form-input" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px' }}
                                value={edited.title} onChange={e => setEdited({ ...edited, title: e.target.value })} />
                        ) : (
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h3>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            {isEditing ? (
                                <select className="form-select" style={{ padding: '0px 8px', fontSize: '12px', height: '24px' }}
                                    value={edited.status} onChange={e => setEdited({ ...edited, status: e.target.value as import('../types').ContentStatus })}>
                                    {CONTENT_STATUS_ORDER.map(s => (
                                        <option key={s} value={s}>{CONTENT_STATUSES[s].icon} {CONTENT_STATUSES[s].label}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="badge" style={{ background: `${st?.color}18`, color: st?.color, border: `1px solid ${st?.color}33` }}>{st?.icon} {st?.label}</span>
                            )}
                            <span className={`badge badge-${CONTENT_TYPE_COLORS[content.contentType] || 'info'}`}>{content.platform}</span>
                            <span className="badge" style={{ background: 'var(--bg-hover)' }}>{CONTENT_TYPE_LABELS[content.contentType]}</span>
                        </div>
                        {isEditing ? (
                            <textarea className="form-textarea" style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}
                                value={edited.description || ''} onChange={e => setEdited({ ...edited, description: e.target.value })}
                                placeholder="Beschreibung eingeben..." />
                        ) : (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {content.description || 'Keine Beschreibung.'}
                            </p>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '14px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metadaten</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', fontSize: 'var(--font-size-sm)', alignItems: 'center' }}>
                            <div style={{ color: 'var(--text-tertiary)' }}>Kampagne:</div>
                            {isEditing ? (
                                <select className="form-select" value={edited.campaignId || ''} onChange={e => setEdited({ ...edited, campaignId: e.target.value || null })}>
                                    <option value="">Keine Kampagne</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            ) : (
                                <div style={{ fontWeight: 500 }}>{getCampaignName(content.campaignId)}</div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Plattform:</div>
                            {isEditing ? (
                                <select className="form-select" value={edited.platform || ''} onChange={e => setEdited({ ...edited, platform: e.target.value })}>
                                    <option value="">Bitte wählen</option>
                                    {['Instagram', 'LinkedIn', 'Google Ads', 'Meta Ads', 'TikTok', 'E-Mail', 'Website', 'YouTube', 'Zoom', 'Intern'].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            ) : (
                                <div>{content.platform}</div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Content-Typ:</div>
                            {isEditing ? (
                                <select className="form-select" value={edited.contentType || ''} onChange={e => setEdited({ ...edited, contentType: e.target.value })}>
                                    {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            ) : (
                                <div>{CONTENT_TYPE_LABELS[content.contentType]}</div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Touchpoint:</div>
                            {isEditing ? (
                                <select className="form-select" value={edited.touchpointId || ''} onChange={e => setEdited({ ...edited, touchpointId: e.target.value || null })}>
                                    <option value="">Kein Touchpoint</option>
                                    {touchpoints.map(tp => <option key={tp.id} value={tp.id}>{tp.name} ({tp.type})</option>)}
                                </select>
                            ) : (
                                <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{getTouchpointName(content.touchpointId)}</div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Autor:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {content.author}</div>

                            <div style={{ height: '1px', background: 'var(--border-color)', gridColumn: '1 / -1', margin: '4px 0' }} />

                            <div style={{ color: 'var(--text-tertiary)' }}>Veröffentlichung:</div>
                            {isEditing ? (
                                <input type="date" className="form-input" style={{ padding: '4px' }}
                                    value={edited.publishDate || ''} onChange={e => setEdited({ ...edited, publishDate: e.target.value })} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} />
                                    {content.publishDate ? new Date(content.publishDate).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                                </div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Erstellt am:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} />
                                {content.createdAt ? new Date(content.createdAt).toLocaleDateString('de-DE') : '–'}
                            </div>

                            <div style={{ color: 'var(--text-tertiary)' }}>Journey Phase:</div>
                            {isEditing ? (
                                <select className="form-select" style={{ padding: '4px' }} value={edited.journeyPhase || ''} onChange={e => setEdited({ ...edited, journeyPhase: e.target.value })}>
                                    <option value="">Keine Phase</option>
                                    <option value="Awareness">Awareness</option>
                                    <option value="Consideration">Consideration</option>
                                    <option value="Purchase">Purchase</option>
                                    <option value="Retention">Retention</option>
                                    <option value="Advocacy">Advocacy</option>
                                </select>
                            ) : (
                                <div style={{ fontWeight: 500 }}>{content.journeyPhase || 'Nicht verknüpft'}</div>
                            )}
                        </div>
                    </div>

                    {/* Linked Tasks */}
                    <ContentLinkedTasks
                        linkedTasks={linkedTasks}
                        hasTasks={hasTasks}
                        canEdit={canEdit}
                        showNewTask={showNewTask}
                        setShowNewTask={setShowNewTask}
                        newTaskTitle={newTaskTitle}
                        setNewTaskTitle={setNewTaskTitle}
                        newTaskPlatform={newTaskPlatform}
                        setNewTaskPlatform={setNewTaskPlatform}
                        newTaskAssignee={newTaskAssignee}
                        setNewTaskAssignee={setNewTaskAssignee}
                        handleAddTask={handleAddTask}
                    />
                </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer" style={{ background: 'var(--bg-surface)' }}>
                {isEditing ? (
                    <>
                        <button className="btn btn-ghost" onClick={() => { setIsEditing(false); setEdited({ ...content }); }}>Abbrechen</button>
                        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Speichern</button>
                    </>
                ) : (
                    <>
                        {content.campaignId && (
                            <Link href={`/campaigns/${content.campaignId}`} className="btn btn-primary">Zur Kampagne →</Link>
                        )}
                        <Link href="/content" className="btn btn-secondary">Zum Kalender →</Link>
                    </>
                )}
            </div>
        </div>
    );
}

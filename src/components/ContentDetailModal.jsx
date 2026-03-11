import { useState } from 'react';
import { Calendar, FileText, ListChecks, AlertTriangle, CheckCircle, Plus, Clock, User, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContents, CONTENT_STATUSES, CONTENT_STATUS_ORDER } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { campaigns, testUsers, CONTENT_TYPE_COLORS, touchpoints } from '../data/mockData';

const CONTENT_TYPE_LABELS = {
    social: 'Social Media', email: 'E-Mail', ads: 'Ads / Anzeige', content: 'Blog / Content', event: 'Event'
};

export default function ContentDetailModal({ content, onClose }) {
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

    const getCampaignName = (cId) => {
        if (!cId) return 'Ohne Kampagne';
        return campaigns.find(c => c.id === cId)?.name || 'Unbekannt';
    };

    const getTouchpointName = (tpId) => {
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
                                    value={edited.status} onChange={e => setEdited({ ...edited, status: e.target.value })}>
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
                                <select className="form-select" style={{ padding: '4px' }} value={edited.journeyPhase || ''} onChange={e => setEdited({ ...edited, journeyPhase: e.target.value || null })}>
                                    <option value="">Keine Phase</option>
                                    <optgroup label="ASIDAS">
                                        <option value="Attention">Attention</option>
                                        <option value="Search">Search</option>
                                        <option value="Interest">Interest</option>
                                        <option value="Desire">Desire</option>
                                        <option value="Action">Action</option>
                                        <option value="Share">Share</option>
                                    </optgroup>
                                    <optgroup label="Customer Journey">
                                        <option value="Awareness">Awareness</option>
                                        <option value="Consideration">Consideration</option>
                                        <option value="Purchase">Purchase</option>
                                        <option value="Retention">Retention</option>
                                        <option value="Advocacy">Advocacy</option>
                                    </optgroup>
                                </select>
                            ) : (
                                <div style={{ fontWeight: 500 }}>{content.journeyPhase || 'Nicht verknüpft'}</div>
                            )}
                        </div>
                    </div>

                    {/* Linked Tasks */}
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

                        {/* Inline new task form */}
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
                                <a href={`/campaigns/${content.campaignId}`} className="btn btn-primary">Zur Kampagne →</a>
                            )}
                            <a href="/content" className="btn btn-secondary">Zum Kalender →</a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

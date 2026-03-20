import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, CheckSquare, Clock, ArrowRight, User, ExternalLink, Globe, Edit2, Save, X, FileText, Trash2, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { TaskAiAgent } from './TaskAiAgent';
import { useContents, CONTENT_STATUSES } from '../context/ContentContext';
import { useData } from '../context/DataContext';
import type { Task } from '../types';

const UI_STATE_LABELS: Record<string, string> = {
    draft: 'Entwurf', ai_generating: 'KI generiert…', ai_ready: 'KI-Vorschlag', review: 'Im Review', revision: 'Überarbeitung',
    approved: 'Freigegeben', scheduled: 'Eingeplant', posted: 'Gepostet', monitoring: 'Beobachtung', analyzed: 'Analysiert'
};

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
    const { currentUser, can } = useAuth();
    const { updateTask, deleteTask, executeAiAgent, sendAiFeedback, setPromptContext } = useTasks();
    const { contents } = useContents();
    const { campaigns, users: testUsers, touchpoints, audiences, positioning, companyKeywords, customerJourneys } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });
    const [aiFeedbackText, setAiFeedbackText] = useState('');
    const hasUnsavedEdits = isEditing && JSON.stringify(editedTask) !== JSON.stringify(task);

    const requestClose = () => {
        if (hasUnsavedEdits && !window.confirm('Es gibt ungespeicherte Änderungen. Möchtest du das Modal wirklich schließen?')) {
            return;
        }
        onClose();
    };

    const handleCancelEditing = () => {
        if (hasUnsavedEdits && !window.confirm('Ungespeicherte Änderungen verwerfen?')) {
            return;
        }
        setEditedTask({ ...task });
        setIsEditing(false);
    };

    // Build and set prompt context for AI generation
    useEffect(() => {
        const campaign = task.campaignId ? campaigns.find(c => c.id === task.campaignId) : null;
        const audience = campaign?.targetAudiences?.[0]
            ? audiences.find(a => a.id === campaign.targetAudiences[0])
            : audiences[0] || null;
        const touchpoint = task.touchpointId ? touchpoints.find(tp => tp.id === task.touchpointId) : null;
        // Find the journey + stage that matches the task's touchpoint phase
        const touchpointPhase = touchpoint?.journeyPhase;
        let journey = null as typeof customerJourneys[0] | null;
        let journeyStage = null as (typeof customerJourneys[0])['stages'][0] | null;
        if (touchpointPhase) {
            for (const j of customerJourneys) {
                const match = j.stages?.find(s => s.phase === touchpointPhase);
                if (match) { journey = j; journeyStage = match; break; }
            }
        }
        if (!journey && customerJourneys.length > 0) {
            journey = customerJourneys[0];
            journeyStage = journey.stages?.[0] || null;
        }

        setPromptContext({
            positioning,
            companyKeywords,
            campaign: campaign ?? null,
            audience: audience ?? null,
            journey: journey ?? null,
            journeyStage: journeyStage ?? null,
            touchpoint: touchpoint ?? null,
        });
    }, [task, campaigns, audiences, touchpoints, positioning, companyKeywords, customerJourneys, setPromptContext]);

    // Permissions: Admin, Manager, or the assigned user can edit
    const canEdit = currentUser?.role === 'company_admin' || currentUser?.role === 'manager' || task?.assignee === currentUser?.name;
    const canDelete = can ? can('canDeleteItems') : (currentUser?.role === 'company_admin' || currentUser?.role === 'manager');

    // Find linked content(s) for this task
    const linkedContents = contents.filter(c => c.taskIds && c.taskIds.includes(task.id));

    const getCampaignName = (campaignId: string | null | undefined) => {
        if (!campaignId) return 'Allgemein';
        return campaigns.find(c => c.id === campaignId)?.name || 'Unbekannte Kampagne';
    };

    const getTouchpointName = (tpId: string | null | undefined) => {
        if (!tpId) return 'Nicht verknüpft';
        return touchpoints.find(tp => tp.id === tpId)?.name || 'Unbekannt';
    };

    const handleSave = () => {
        updateTask(task.id, editedTask);
        setIsEditing(false);
        onClose();
    };

    if (!task) return null;

    return (
        <div className="modal-overlay" onClick={requestClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, maxHeight: '90vh', height: '100%', width: '100%', maxWidth: '800px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckSquare size={18} style={{ color: 'var(--color-primary)' }} />
                        Aufgaben-Details
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {canEdit && !isEditing && (
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditedTask({ ...task }); setIsEditing(true); }}>
                                <Edit2 size={16} /> Bearbeiten
                            </button>
                        )}
                        {canDelete && !isEditing && (
                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: '#ef4444' }} onClick={async () => {
                                if (window.confirm('Möchtest du diese Aufgabe wirklich löschen?')) {
                                    await deleteTask(task.id);
                                    onClose();
                                }
                            }} title="Löschen">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button className="btn btn-ghost btn-icon" onClick={requestClose}><X size={20} /></button>
                    </div>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
                    <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--color-primary)' }}>
                        {isEditing ? (
                            <input
                                className="form-input"
                                style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px', padding: '4px' }}
                                value={editedTask.title}
                                onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                            />
                        ) : (
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '8px' }}>{task.title}</h3>
                        )}

                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <span className="badge badge-primary">{UI_STATE_LABELS[task.status] || task.status}</span>

                            {isEditing ? (
                                <select className="form-select" style={{ padding: '0px 8px', fontSize: '12px', height: '24px' }} value={editedTask.type || ''} onChange={e => setEditedTask({ ...editedTask, type: e.target.value })}>
                                    <option value="Post (Beschreibung)">Post (Beschreibung)</option>
                                    <option value="Post (Foto)">Post (Foto)</option>
                                    <option value="Videoskript">Videoskript</option>
                                    <option value="Video">Video</option>
                                    <option value="Karousell">Karousell</option>
                                    <option value="Landingpage">Landingpage</option>
                                    <option value="E-Mail-Newsletter">E-Mail-Newsletter</option>
                                    <option value="E-Mail-Nachricht">E-Mail-Nachricht</option>
                                    <option value="Sonstige">Sonstige</option>
                                    <option value="Task">Task</option>
                                </select>
                            ) : (
                                <span className="badge badge-info">{task.type || 'Task'}</span>
                            )}

                            {isEditing ? (
                                <select className="form-select" style={{ padding: '0px 8px', fontSize: '12px', height: '24px' }} value={editedTask.platform || ''} onChange={e => setEditedTask({ ...editedTask, platform: e.target.value || null })}>
                                    <option value="">Übergreifend</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Google Ads">Google Ads</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="TikTok">TikTok</option>
                                </select>
                            ) : (
                                task.platform && <span className="badge" style={{ background: 'var(--bg-hover)' }}>{task.platform}</span>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}
                                value={editedTask.description || ''}
                                onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                                placeholder="Beschreibung eingeben..."
                            />
                        ) : (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {task.description || 'Keine Beschreibung vorhanden.'}
                            </p>
                        )}
                    </div>

                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '16px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metadaten</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: 'var(--font-size-sm)', alignItems: 'center' }}>
                            <div style={{ color: 'var(--text-tertiary)' }}>Kampagne:</div>
                            <div style={{ fontWeight: 500 }}>{getCampaignName(task.campaignId)}</div>

                            <div style={{ color: 'var(--text-tertiary)' }}>Autor:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {task.author || 'System'}</div>

                            <div style={{ color: 'var(--text-tertiary)' }}>Bearbeiter:</div>
                            {isEditing ? (
                                <select className="form-select" value={editedTask.assignee || ''} onChange={e => setEditedTask({ ...editedTask, assignee: e.target.value })}>
                                    <option value="">Unzugewiesen</option>
                                    {testUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                </select>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><User size={14} style={{ color: 'var(--color-primary)' }} /> {task.assignee || 'Unzugewiesen'}</div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Touchpoint:</div>
                            {isEditing ? (
                                <select className="form-select" value={editedTask.touchpointId || ''} onChange={e => setEditedTask({ ...editedTask, touchpointId: e.target.value || null })}>
                                    <option value="">Kein Touchpoint</option>
                                    {touchpoints.map(tp => <option key={tp.id} value={tp.id}>{tp.name} ({tp.type})</option>)}
                                </select>
                            ) : (
                                <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{getTouchpointName(task.touchpointId)}</div>
                            )}

                            <div style={{ height: '1px', background: 'var(--border-color)', gridColumn: '1 / -1', margin: '4px 0' }} />

                            <div style={{ color: 'var(--text-tertiary)' }}>Zieldatum:</div>
                            {isEditing ? (
                                <input type="date" className="form-input" style={{ padding: '4px' }} value={editedTask.dueDate || ''} onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value })} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} />
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                                </div>
                            )}

                            <div style={{ color: 'var(--text-tertiary)' }}>Veröffentlichung:</div>
                            {isEditing ? (
                                <input type="datetime-local" className="form-input" style={{ padding: '4px' }} value={editedTask.publishDate || ''} onChange={e => setEditedTask({ ...editedTask, publishDate: e.target.value })} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} />
                                    {task.publishDate ? new Date(task.publishDate).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'Noch nicht gesetzt'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── KI-Agent Pipeline ─── */}
                    <TaskAiAgent
                        task={task}
                        aiFeedbackText={aiFeedbackText}
                        setAiFeedbackText={setAiFeedbackText}
                        updateTask={updateTask}
                        executeAiAgent={executeAiAgent}
                        sendAiFeedback={sendAiFeedback}
                        getCampaignName={getCampaignName}
                    />

                    {/* ─── Linked Content Reference ─── */}
                    {linkedContents.length > 0 && (
                        <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #8b5cf6' }}>
                            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={16} style={{ color: '#8b5cf6' }} /> Zugehöriger Content
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {linkedContents.map(cnt => {
                                    const cst = CONTENT_STATUSES[cnt.status];
                                    return (
                                        <div key={cnt.id} style={{
                                            padding: '12px 14px', background: 'rgba(139, 92, 246, 0.04)', borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(139, 92, 246, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{cnt.title}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', marginTop: '3px' }}>
                                                    <span>{cnt.platform}</span>
                                                    <span>·</span>
                                                    <span>{cnt.publishDate ? new Date(cnt.publishDate).toLocaleDateString('de-DE') : 'Kein Datum'}</span>
                                                </div>
                                            </div>
                                            <span className="badge" style={{ background: `${cst?.color}18`, color: cst?.color, border: `1px solid ${cst?.color}33`, fontSize: '0.65rem' }}>
                                                {cst?.icon} {cst?.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ressourcen</h4>

                        <div style={{ padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', color: '#0078d4' }}>OneDrive Ablage</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Dateien, Grafiken & Assets</div>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="url"
                                        className="form-input"
                                        style={{ width: '150px', padding: '4px' }}
                                        placeholder="URL..."
                                        value={editedTask.oneDriveLink || ''}
                                        onChange={e => setEditedTask({ ...editedTask, oneDriveLink: e.target.value })}
                                    />
                                ) : (
                                    task.oneDriveLink ? (
                                        <a href={task.oneDriveLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                                            <ExternalLink size={14} /> Öffnen
                                        </a>
                                    ) : (
                                        <button className="btn btn-ghost btn-sm" disabled>Kein Link hinterlegt</button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                </div>
                <div className="modal-footer" style={{ background: 'var(--bg-surface)' }}>
                    {isEditing ? (
                        <>
                            <button className="btn btn-ghost" onClick={handleCancelEditing}>Abbrechen</button>
                            <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Speichern</button>
                        </>
                    ) : (
                        <Link href={`/campaigns/${task.campaignId}`} className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                            Zur Kampagne navigieren <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}


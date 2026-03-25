import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProjectPath } from '../hooks/useProjectRouter';
import { Calendar, CheckSquare, Clock, ArrowRight, User, ExternalLink, Globe, Edit2, Save, X, FileText, Trash2, Play, Share2, Sparkles, Loader2, CheckCircle2, Eye, Radio, AlertCircle } from 'lucide-react';
import { generateFromTask, listPosts, type ScheduledPost } from '../lib/socialHub';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useTasks } from '../context/TaskContext';
import { TaskAiAgent } from './TaskAiAgent';
import FeatureGate from './FeatureGate';
import { useContents, CONTENT_STATUSES } from '../context/ContentContext';
import { useData } from '../context/DataContext';
import { usePublishing } from '../context/PublishingContext';
import { useLanguage } from '../context/LanguageContext';
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
    const { activeCompany } = useCompany();
    const { updateTask, deleteTask, executeAiAgent, sendAiFeedback, setPromptContext } = useTasks();
    const { contents } = useContents();
    const { campaigns, users: testUsers, touchpoints, audiences, positioning, companyKeywords, customerJourneys } = useData();
    const { knowledgeDocuments } = usePublishing();
    const { language } = useLanguage();
    const companyPath = useProjectPath();
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
            knowledgeDocs: knowledgeDocuments.filter(d => d.isActive !== false),
            language: language === 'en' ? 'en' : 'de',
        });
    }, [task, campaigns, audiences, touchpoints, positioning, companyKeywords, customerJourneys, knowledgeDocuments, language, setPromptContext]);

    // Permissions: Admin, Manager, or the assigned user can edit
    const canEdit = currentUser?.role === 'company_admin' || currentUser?.role === 'manager' || task?.assignee === currentUser?.name;
    const canDelete = can ? can('canDeleteItems') : (currentUser?.role === 'company_admin' || currentUser?.role === 'manager');
    const canSocialHub = can('canUseSocialHub');
    const [socialGenerating, setSocialGenerating] = useState(false);
    const [socialGenResult, setSocialGenResult] = useState<{ post_id: string; platform: string } | null>(null);
    const [socialGenError, setSocialGenError] = useState<string | null>(null);
    const [linkedSocialPosts, setLinkedSocialPosts] = useState<ScheduledPost[]>([]);
    const isGerman = language === 'de';
    const linkedContents = contents.filter(c => c.taskIds && c.taskIds.includes(task.id));

    // Fetch social posts linked to this task (bidirectional sync)
    useEffect(() => {
        if (!canSocialHub || !activeCompany?.id) return;
        let cancelled = false;
        listPosts({ companyId: activeCompany.id, limit: 500 })
            .then(posts => {
                if (!cancelled) setLinkedSocialPosts(posts.filter(p => p.task_id === task.id));
            })
            .catch(() => { /* SH offline — task modal still works */ });
        return () => { cancelled = true; };
    }, [canSocialHub, activeCompany?.id, task.id, socialGenResult]);

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
                    <FeatureGate feature="ai_pro" dimmed>
                        <TaskAiAgent
                            task={task}
                            aiFeedbackText={aiFeedbackText}
                            setAiFeedbackText={setAiFeedbackText}
                            updateTask={updateTask}
                            executeAiAgent={executeAiAgent}
                            sendAiFeedback={sendAiFeedback}
                            getCampaignName={getCampaignName}
                        />
                    </FeatureGate>

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

                    {/* ─── Social Hub Publishing CTA ─── */}
                    {canSocialHub && !isEditing && (task.platform === 'LinkedIn' || task.platform === 'Instagram') &&
                     ['Post (Beschreibung)', 'Post (Foto)', 'Videoskript', 'Video', 'Karousell'].includes(task.type) && (
                        <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #0ea5e9', background: 'rgba(14, 165, 233, 0.03)' }}>
                            {/* Workflow indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '0.6rem' }}>
                                    {isGerman ? 'Aufgabe' : 'Task'}
                                </span>
                                <span>→</span>
                                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', fontWeight: 600, fontSize: '0.6rem' }}>
                                    Social Hub
                                </span>
                                <span>→</span>
                                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.6rem' }}>
                                    {task.platform}
                                </span>
                            </div>

                            {socialGenResult ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle2 size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                            {isGerman ? 'Post erfolgreich generiert!' : 'Post generated successfully!'}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                            {isGerman
                                                ? `Entwurf für ${socialGenResult.platform} erstellt – bearbeite und veröffentliche ihn im Social Hub.`
                                                : `Draft for ${socialGenResult.platform} created – edit and publish it in Social Hub.`}
                                        </div>
                                    </div>
                                    <Link href={companyPath('/social-hub')} className="btn btn-primary btn-sm" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <Eye size={14} /> {isGerman ? 'Im Social Hub ansehen' : 'View in Social Hub'}
                                    </Link>
                                </div>
                            ) : socialGenError ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: '#ef4444' }}>
                                            {isGerman ? 'Generierung fehlgeschlagen' : 'Generation failed'}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                            {socialGenError}
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setSocialGenError(null)}>
                                        {isGerman ? 'Erneut versuchen' : 'Try again'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Share2 size={16} style={{ color: '#0ea5e9' }} />
                                            Social Hub
                                        </h4>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                            {isGerman
                                                ? (task.status === 'approved' || task.status === 'scheduled'
                                                    ? `Diesen ${task.type} jetzt über den Social Hub auf ${task.platform} veröffentlichen.`
                                                    : `Erstelle einen KI-generierten ${task.platform}-Post basierend auf dieser Aufgabe.`)
                                                : (task.status === 'approved' || task.status === 'scheduled'
                                                    ? `Publish this ${task.type} on ${task.platform} via Social Hub.`
                                                    : `Generate an AI-powered ${task.platform} post based on this task.`)}
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        disabled={socialGenerating}
                                        onClick={async () => {
                                            setSocialGenerating(true);
                                            setSocialGenError(null);
                                            try {
                                                const campaign = task.campaignId ? campaigns.find(c => c.id === task.campaignId) : null;
                                                const result = await generateFromTask({
                                                    companyId: activeCompany?.id || '',
                                                    taskTitle: task.title,
                                                    taskDescription: task.description || '',
                                                    platform: task.platform?.toLowerCase() as 'linkedin' | 'instagram',
                                                    campaignName: campaign?.name || '',
                                                });
                                                setSocialGenResult({ post_id: result.post_id, platform: result.platform });
                                            } catch (e) {
                                                const msg = e instanceof Error ? e.message : 'Unknown error';
                                                setSocialGenError(isGerman
                                                    ? `Social Hub ist nicht erreichbar oder die Generierung ist fehlgeschlagen. (${msg})`
                                                    : `Social Hub is unreachable or generation failed. (${msg})`);
                                            } finally {
                                                setSocialGenerating(false);
                                            }
                                        }}
                                    >
                                        {socialGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                        {socialGenerating
                                            ? (isGerman ? 'Wird generiert…' : 'Generating…')
                                            : (isGerman ? 'Post generieren' : 'Generate post')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Linked Social Hub Posts (bidirectional sync) */}
                    {canSocialHub && (task.platform === 'LinkedIn' || task.platform === 'Instagram') && (
                        <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #8b5cf6', background: 'rgba(139,92,246,0.03)' }}>
                            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Radio size={14} style={{ color: '#8b5cf6' }} />
                                {isGerman ? 'Verknüpfte Social Hub Posts' : 'Linked Social Hub Posts'} ({linkedSocialPosts.length})
                            </h4>
                            {linkedSocialPosts.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {linkedSocialPosts.map(sp => (
                                        <div key={sp.id} style={{
                                            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                                            background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.15)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{sp.topic || 'Social Post'}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', marginTop: '3px' }}>
                                                    <span>{sp.platform}</span>
                                                    <span>·</span>
                                                    <span style={{
                                                        color: sp.status === 'published' ? 'var(--color-success)' : sp.status === 'approved' ? '#8b5cf6' : 'var(--text-tertiary)',
                                                        fontWeight: sp.status === 'published' ? 600 : 400,
                                                    }}>
                                                        {sp.status === 'published'
                                                            ? (isGerman ? 'Veröffentlicht' : 'Published')
                                                            : sp.status === 'approved'
                                                            ? (isGerman ? 'Freigegeben' : 'Approved')
                                                            : sp.status === 'draft' || sp.status === 'generated'
                                                            ? (isGerman ? 'Entwurf' : 'Draft')
                                                            : sp.status}
                                                    </span>
                                                    {sp.published_at && <><span>·</span><span>{new Date(sp.published_at).toLocaleDateString(isGerman ? 'de-DE' : 'en-US')}</span></>}
                                                </div>
                                            </div>
                                            <Link href={companyPath('/social-hub')} className="btn btn-ghost btn-sm" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <Eye size={12} /> {isGerman ? 'Ansehen' : 'View'}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '12px', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-elevated)', border: '1px dashed rgba(139,92,246,0.25)',
                                    color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)',
                                }}>
                                    {isGerman
                                        ? 'Noch keine Social Hub Posts mit dieser Aufgabe verknüpft. Nutze "Post generieren" oben, um einen Entwurf zu erstellen.'
                                        : 'No Social Hub posts linked to this task yet. Use "Generate post" above to create a draft.'}
                                </div>
                            )}
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
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <Link href={companyPath(`/campaigns/${task.campaignId}`)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                Zur Kampagne navigieren <ArrowRight size={16} />
                            </Link>
                            {canSocialHub && (task.platform === 'LinkedIn' || task.platform === 'Instagram') && (
                                <Link href={companyPath('/social-hub')} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Radio size={14} /> {isGerman ? 'Social Hub öffnen' : 'Open Social Hub'}
                                    {linkedSocialPosts.length > 0 && (
                                        <span style={{
                                            background: '#8b5cf6', color: '#fff', borderRadius: 'var(--radius-full)',
                                            padding: '0 6px', fontSize: '0.6rem', fontWeight: 700, minWidth: '18px', textAlign: 'center',
                                        }}>{linkedSocialPosts.length}</span>
                                    )}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


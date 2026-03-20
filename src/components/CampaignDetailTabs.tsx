import { useState } from 'react';
import type { Campaign, Audience, PermissionKey } from '../types';
import {
    Calendar, Users, Edit, Bot, Tag, Lock, Plus, X,
    Instagram, Youtube, Linkedin, Facebook, Globe, Target, UserCheck, UsersRound, Check,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PLATFORM_ICONS, CREATIVE_TYPES, MiniCalendar } from './CampaignDetailComponents';

interface OverviewTabProps {
    campaign: Campaign;
    linkedAudiences: Audience[];
    navigate: (path: string, opts?: any) => void;
    can: (perm: PermissionKey) => boolean;
    kwList: string[];
    setKwList: (kw: string[]) => void;
    newKw: string;
    setNewKw: (v: string) => void;
    addingKw: boolean;
    setAddingKw: (v: boolean) => void;
    addKeyword: () => void;
    masterPromptExpanded: boolean;
    setMasterPromptExpanded: (v: boolean) => void;
    promptEditMode: boolean;
    setPromptEditMode: (v: boolean) => void;
    promptValue: string;
    setPromptValue: (v: string) => void;
}

export function CampaignOverviewTab({
    campaign, linkedAudiences, navigate, can,
    kwList, setKwList, newKw, setNewKw, addingKw, setAddingKw, addKeyword,
    masterPromptExpanded, setMasterPromptExpanded, promptEditMode, setPromptEditMode,
    promptValue, setPromptValue,
}: OverviewTabProps) {
    const { touchpoints, companyKeywords, users, updateCampaign } = useData();
    const responsibleManager = users.find(u => u.id === campaign.responsibleManagerId);
    const teamMembers = users.filter(u => campaign.teamMemberIds?.includes(u.id));
    const managers = users.filter(u => u.role === 'company_admin' || u.role === 'manager');

    // ─── Team Edit State ───
    const [editingTeam, setEditingTeam] = useState(false);
    const [editManagerId, setEditManagerId] = useState(campaign.responsibleManagerId ?? '');
    const [editTeamIds, setEditTeamIds] = useState<string[]>(campaign.teamMemberIds ?? []);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const startEdit = () => {
        setEditManagerId(campaign.responsibleManagerId ?? '');
        setEditTeamIds(campaign.teamMemberIds ?? []);
        setSaveError(null);
        setEditingTeam(true);
    };

    const saveTeam = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            await updateCampaign(campaign.id, {
                responsibleManagerId: editManagerId,
                teamMemberIds: editTeamIds,
                owner: users.find(u => u.id === editManagerId)?.name ?? campaign.owner,
            });
            setEditingTeam(false);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.');
        } finally {
            setSaving(false);
        }
    };

    const toggleEditMember = (uid: string) =>
        setEditTeamIds(prev => prev.includes(uid) ? prev.filter(i => i !== uid) : [...prev, uid]);
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div className="stat-card primary"><span className="stat-card-label">Budget</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>€{campaign.budget.toLocaleString('de-DE')}</span><span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>€{campaign.spent.toLocaleString('de-DE')} ausgegeben ({Math.round(campaign.spent / (campaign.budget || 1) * 100)}%)</span></div>
                        <div className="stat-card success"><span className="stat-card-label">Impressionen</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.impressions.toLocaleString('de-DE')}</span></div>
                        <div className="stat-card info"><span className="stat-card-label">Clicks</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.clicks.toLocaleString('de-DE')}</span></div>
                        <div className="stat-card warning"><span className="stat-card-label">CTR</span><span className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>{campaign.kpis.ctr}%</span></div>
                    </div>

                    <div className="card">
                        <div className="card-title" style={{ marginBottom: '12px' }}>Verknüpfte Kanäle & Touchpoints</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {(campaign.touchpointIds || []).map(tpId => {
                                const tp = touchpoints.find(t => t.id === tpId);
                                if (!tp) return null;
                                const ChIcon = PLATFORM_ICONS[tp.name] || PLATFORM_ICONS[tp.type] || Globe;
                                return (
                                    <div key={tpId} onClick={() => navigate(`/touchpoints?selectedTpId=${tpId}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                        <ChIcon size={16} style={{ color: 'var(--color-primary)' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{tp.name}</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{tp.type}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!campaign.touchpointIds || campaign.touchpointIds.length === 0) && campaign.channels.map(ch => {
                                const ChIcon = PLATFORM_ICONS[ch] || Globe;
                                return (
                                    <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <ChIcon size={16} style={{ color: 'var(--color-primary)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{ch}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '12px' }}><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />Kampagnenzeitraum</div>
                    <MiniCalendar startDate={campaign.startDate} endDate={campaign.endDate} />
                </div>
            </div>

            {/* Manager & Team */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UsersRound size={16} style={{ color: '#0ea5e9' }} />
                        <span className="card-title" style={{ margin: 0 }}>Team & Verantwortung</span>
                    </div>
                    {can('canEditCampaigns') && !editingTeam && (
                        <button className="btn btn-secondary btn-sm" onClick={startEdit}>
                            <Edit size={14} /> Bearbeiten
                        </button>
                    )}
                    {editingTeam && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditingTeam(false); setSaveError(null); }}>Abbrechen</button>
                            <button className="btn btn-primary btn-sm" onClick={saveTeam} disabled={saving}>
                                <Check size={14} /> {saving ? 'Speichern…' : 'Speichern'}
                            </button>
                        </div>
                    )}
                </div>

                {editingTeam ? (
                    <div>
                        {saveError && (
                            <div style={{
                                marginBottom: '16px', padding: '10px 14px',
                                background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                                borderRadius: 'var(--radius-sm)', color: '#ef4444',
                                fontSize: 'var(--font-size-xs)',
                            }}>
                                ⚠ {saveError}
                            </div>
                        )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Edit: Manager */}
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <UserCheck size={12} style={{ color: '#8b5cf6' }} /> Verantwortlicher Manager
                            </div>
                            <select
                                className="form-input"
                                value={editManagerId}
                                onChange={e => setEditManagerId(e.target.value)}
                            >
                                <option value="">— Kein Manager —</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.jobTitle})</option>
                                ))}
                            </select>
                        </div>
                        {/* Edit: Team Members */}
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <UsersRound size={12} style={{ color: '#0ea5e9' }} /> Team-Mitglieder
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                                {users.map(u => {
                                    const selected = editTeamIds.includes(u.id);
                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => toggleEditMember(u.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                                                background: selected ? 'rgba(14,165,233,0.1)' : 'var(--bg-elevated)',
                                                border: `1px solid ${selected ? '#0ea5e9' : 'transparent'}`,
                                                cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{
                                                width: 14, height: 14, borderRadius: '3px', flexShrink: 0,
                                                border: `2px solid ${selected ? '#0ea5e9' : 'var(--border-color)'}`,
                                                background: selected ? '#0ea5e9' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {selected && <Check size={9} color="white" />}
                                            </div>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: 'var(--color-primary)', color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                                            }}>{u.avatar}</div>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{u.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{u.jobTitle}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <UserCheck size={12} style={{ color: '#8b5cf6' }} /> Verantwortlicher Manager
                            </div>
                            {responsibleManager ? (
                                <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #8b5cf6' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{responsibleManager.avatar}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{responsibleManager.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{responsibleManager.jobTitle} · {responsibleManager.department}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Kein Manager zugewiesen</div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <UsersRound size={12} style={{ color: '#0ea5e9' }} /> Team-Mitglieder ({teamMembers.length})
                            </div>
                            {teamMembers.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {teamMembers.map(m => (
                                        <div key={m.id} style={{ display: 'flex', gap: '10px', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #0ea5e9' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{m.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{m.jobTitle}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Keine Team-Mitglieder zugewiesen</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: '24px', borderLeft: '3px solid #8b5cf6' }}>
                <div className="card-header" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bot size={18} style={{ color: '#8b5cf6' }} />
                        <div><div className="card-title">Master-Prompt</div><div className="card-subtitle">KI-Kontext für alle Creatives dieser Kampagne</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setMasterPromptExpanded(!masterPromptExpanded)}>{masterPromptExpanded ? 'Einklappen' : 'Ausklappen'}</button>
                        {can('canEditCampaigns') && <button className={`btn btn-sm ${promptEditMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { if (promptEditMode) setPromptEditMode(false); else { setPromptEditMode(true); setMasterPromptExpanded(true); } }}>{promptEditMode ? '✓ Speichern' : <><Edit size={14} /> Bearbeiten</>}</button>}
                    </div>
                </div>
                <div style={{ marginTop: '16px', maxHeight: masterPromptExpanded ? '2000px' : '80px', overflow: 'hidden', transition: 'max-height 0.4s ease', position: 'relative' }}>
                    {promptEditMode
                        ? <textarea className="form-input form-textarea" value={promptValue} onChange={e => setPromptValue(e.target.value)} style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }} />
                        : <div style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{promptValue}</div>
                    }
                    {!masterPromptExpanded && !promptEditMode && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--bg-surface))', pointerEvents: 'none' }} />}
                </div>
            </div>

            <div className="content-grid-2">
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '12px' }}><Users size={14} style={{ display: 'inline', marginRight: '6px' }} />Zielgruppen ({linkedAudiences.length})</div>
                    {linkedAudiences.map(a => (
                        <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${a.color}`, marginBottom: '8px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{a.initials}</div>
                            <div><div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{a.name}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{a.segment} · {a.age} · {a.jobTitle}</div></div>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '12px' }}><Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />Schlüsselbegriffe</div>
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}><Lock size={10} style={{ display: 'inline', marginRight: '4px' }} />Unternehmensweit</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{companyKeywords.map(k => <span key={k.id} className="keyword-tag keyword-tag--company" style={{ fontSize: '0.65rem' }}><Lock size={8} style={{ opacity: .5 }} /> {k.term}</span>)}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Kampagnenspezifisch</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {kwList.map(kw => <span key={kw} className="keyword-tag keyword-tag--campaign" style={{ fontSize: '0.65rem' }}>{kw} <button onClick={() => setKwList(kwList.filter(k => k !== kw))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={8} /></button></span>)}
                            {addingKw ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input autoFocus value={newKw} onChange={e => setNewKw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addKeyword(); if (e.key === 'Escape') setAddingKw(false); }} placeholder="Keyword…" style={{ background: 'var(--bg-hover)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: '0.65rem', color: 'var(--text-primary)', outline: 'none', width: '100px' }} />
                                    <button className="btn btn-primary btn-sm" onClick={addKeyword} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>+</button>
                                </div>
                            ) : <button onClick={() => setAddingKw(true)} className="keyword-tag keyword-tag--add" style={{ fontSize: '0.65rem' }}><Plus size={8} /> Hinzufügen</button>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

interface NewCreativeModalProps {
    campaign: Campaign;
    newCreative: { title: string; platform: string; type: string; description: string; scope: string };
    setNewCreative: (v: any) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export function NewCreativeModal({ campaign, newCreative, setNewCreative, onClose, onSubmit }: NewCreativeModalProps) {
    const hasUnsavedChanges = Boolean(
        newCreative.title.trim() ||
        newCreative.description.trim() ||
        newCreative.platform ||
        newCreative.type !== 'Post' ||
        newCreative.scope !== 'single'
    );

    const requestClose = () => {
        if (hasUnsavedChanges && !window.confirm('Es gibt ungespeicherte Eingaben. Möchtest du das Modal wirklich schließen?')) {
            return;
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={requestClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">Neues Creative erstellen</div>
                    <button className="btn btn-ghost btn-icon" onClick={requestClose}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Titel *</label>
                        <input className="form-input" placeholder="z.B. Instagram Reel: Kursvorstellung" value={newCreative.title} onChange={e => setNewCreative({ ...newCreative, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Umfang</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={`btn btn-sm ${newCreative.scope === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNewCreative({ ...newCreative, scope: 'all', platform: '' })}><Globe size={14} /> Übergreifend</button>
                            <button className={`btn btn-sm ${newCreative.scope === 'single' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNewCreative({ ...newCreative, scope: 'single' })}><Target size={14} /> Einzelne Plattform</button>
                        </div>
                    </div>
                    {newCreative.scope === 'single' && (
                        <div className="form-group">
                            <label className="form-label">Plattform</label>
                            <select className="form-input" value={newCreative.platform} onChange={e => setNewCreative({ ...newCreative, platform: e.target.value })}>
                                <option value="">Bitte wählen…</option>
                                {campaign.channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Typ</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {CREATIVE_TYPES.map(t => (
                                <button key={t.value} className={`btn btn-sm ${newCreative.type === t.label ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNewCreative({ ...newCreative, type: t.label })}>
                                    <t.icon size={14} /> {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Beschreibung / Briefing</label>
                        <textarea className="form-input form-textarea" placeholder="Beschreibe das gewünschte Creative..." value={newCreative.description} onChange={e => setNewCreative({ ...newCreative, description: e.target.value })} style={{ minHeight: '100px' }} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={requestClose}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={onSubmit} disabled={!newCreative.title.trim()}>
                        <Plus size={16} /> Creative erstellen
                    </button>
                </div>
            </div>
        </div>
    );
}

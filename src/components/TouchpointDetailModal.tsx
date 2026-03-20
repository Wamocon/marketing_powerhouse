import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, ExternalLink, ListTodo, Edit2, Trash2, X, BarChart3, Eye, MousePointerClick, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useContents } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import type { Touchpoint } from '../types';

const TYPE_COLORS: Record<string, string> = {
    'Paid Search': 'badge-warning',
    'Paid Social': 'badge-warning',
    'Owned Website': 'badge-primary',
    'Owned CRM': 'badge-primary',
    'Direct Sales': 'badge-danger',
    'Organic Social': 'badge-info',
    'Earned Media': 'badge-success',
    'Product': 'badge-default'
};

interface TouchpointDetailModalProps {
    touchpoint: Touchpoint;
    onClose: () => void;
    onDelete?: (id: string) => void;
    onSave?: (tp: Touchpoint) => void;
}

const JOURNEY_PHASES = ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'];

export default function TouchpointDetailModal({ touchpoint, onClose, onDelete, onSave }: TouchpointDetailModalProps) {
    const { can } = useAuth();
    const { campaigns } = useData();
    const { contents } = useContents();
    const router = useRouter();
    const canManage = can('canManageTouchpoints');
    const canDelete = can('canDeleteItems');
    const baseEditedTp = {
        ...touchpoint,
        journeyPhases: touchpoint.journeyPhases ?? (touchpoint.journeyPhase ? [touchpoint.journeyPhase] : []),
    };
    const [isEditing, setIsEditing] = useState(false);
    const [editedTp, setEditedTp] = useState(baseEditedTp);
    const hasUnsavedEdits = isEditing && JSON.stringify(editedTp) !== JSON.stringify(baseEditedTp);

    const requestClose = () => {
        if (hasUnsavedEdits && !window.confirm('Es gibt ungespeicherte Änderungen. Möchtest du das Modal wirklich schließen?')) {
            return false;
        }
        onClose();
        return true;
    };

    const handleCancelEdit = () => {
        if (hasUnsavedEdits && !window.confirm('Ungespeicherte Änderungen verwerfen?')) {
            return;
        }
        setEditedTp(baseEditedTp);
        setIsEditing(false);
    };

    if (!touchpoint) return null;

    const getLinkedCampaigns = (tpId: string) => {
        return campaigns.filter(c => c.touchpointIds && c.touchpointIds.includes(tpId));
    };

    const getLinkedContent = (tpId: string) => {
        return contents.filter(c => c.touchpointId === tpId);
    };

    return (
        <div className="modal-overlay" onClick={() => { requestClose(); }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, maxHeight: '90vh', height: '100%', width: '100%', maxWidth: '600px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Megaphone size={18} style={{ color: 'var(--color-primary)' }} />
                        Touchpoint-Details
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {canManage && !isEditing && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                                <Edit2 size={16} /> Bearbeiten
                            </button>
                        )}
                        {canDelete && !isEditing && (
                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: '#ef4444' }} onClick={() => {
                                if (window.confirm('Möchtest du diesen Kanal/Touchpoint wirklich löschen?')) {
                                    if (onDelete) onDelete(touchpoint.id);
                                    onClose();
                                }
                            }} title="Löschen">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button className="btn btn-ghost btn-icon" onClick={() => { requestClose(); }}><X size={20} /></button>
                    </div>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
                    <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--color-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            {isEditing ? (
                                <input
                                    className="form-input"
                                    style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, padding: '4px' }}
                                    value={editedTp.name}
                                    onChange={e => setEditedTp({ ...editedTp, name: e.target.value })}
                                />
                            ) : (
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>{touchpoint.name}</h2>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)', marginBottom: '16px' }}
                                value={editedTp.description || ''}
                                onChange={e => setEditedTp({ ...editedTp, description: e.target.value })}
                            />
                        ) : (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0, marginBottom: '16px' }}>
                                {touchpoint.description}
                            </p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px', fontSize: 'var(--font-size-sm)', alignItems: 'center' }}>
                            <div style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>Typ</div>
                            <div>
                                {isEditing ? (
                                    <select className="form-select" value={editedTp.type} onChange={e => setEditedTp({ ...editedTp, type: e.target.value })}>
                                        <option value="Paid Search">Paid Search</option>
                                        <option value="Paid Social">Paid Social</option>
                                        <option value="Owned Website">Owned Website</option>
                                        <option value="Owned CRM">Owned CRM</option>
                                        <option value="Direct Sales">Direct Sales</option>
                                        <option value="Organic Social">Organic Social</option>
                                        <option value="Earned Media">Earned Media</option>
                                        <option value="Product">Product</option>
                                    </select>
                                ) : (
                                    <span className={`badge ${TYPE_COLORS[touchpoint.type] || 'badge-default'}`}>{touchpoint.type}</span>
                                )}
                            </div>

                            <div style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>URL</div>
                            <div>
                                {isEditing ? (
                                    <input className="form-input" value={editedTp.url} onChange={e => setEditedTp({ ...editedTp, url: e.target.value })} />
                                ) : (
                                    <span style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>{touchpoint.url}</span>
                                )}
                            </div>

                            <div style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>Status</div>
                            <div>
                                {isEditing ? (
                                    <select className="form-select" value={editedTp.status} onChange={e => setEditedTp({ ...editedTp, status: e.target.value as Touchpoint['status'] })}>
                                        <option value="active">Aktiv</option>
                                        <option value="planned">Geplant</option>
                                    </select>
                                ) : (
                                    <span className={`badge ${touchpoint.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                                        {touchpoint.status === 'active' ? 'Aktiv' : 'Geplant'}
                                    </span>
                                )}
                            </div>

                            <div style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>Journey Phase</div>
                            <div>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {JOURNEY_PHASES.map(phase => {
                                            const checked = editedTp.journeyPhases.includes(phase);
                                            return (
                                                <label key={phase} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={event => {
                                                            setEditedTp(prev => {
                                                                const phases = event.target.checked
                                                                    ? [...prev.journeyPhases, phase]
                                                                    : prev.journeyPhases.filter(item => item !== phase);
                                                                return {
                                                                    ...prev,
                                                                    journeyPhases: phases,
                                                                    journeyPhase: phases[0] ?? '',
                                                                };
                                                            });
                                                        }}
                                                    />
                                                    {phase}
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        {touchpoint.journeyPhases?.length
                                            ? touchpoint.journeyPhases.join(', ')
                                            : (touchpoint.journeyPhase || 'Nicht verknüpft')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Megaphone size={14} /> Zugeordnete Kampagnen
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {getLinkedCampaigns(touchpoint.id).map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => { if (requestClose()) router.push(`/campaigns/${c.id}`); }}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.name}</span>
                                    <ExternalLink size={12} style={{ color: 'var(--color-primary)' }} />
                                </div>
                            ))}
                            {getLinkedCampaigns(touchpoint.id).length === 0 && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', padding: '10px', background: 'var(--bg-hover)', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>Keine Kampagnen verknüpft.</div>
                            )}
                        </div>
                    </div>

                    {/* ─── Kanal-KPIs ─── */}
                    {touchpoint.kpis && (
                        <div className="card" style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BarChart3 size={14} /> Kanal-Performance (gesamt)
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                                {[
                                    { icon: Eye, label: 'Impressions', value: touchpoint.kpis.impressions.toLocaleString('de-DE') },
                                    { icon: MousePointerClick, label: 'Clicks', value: touchpoint.kpis.clicks.toLocaleString('de-DE') },
                                    { icon: Target, label: 'Conversions', value: touchpoint.kpis.conversions.toLocaleString('de-DE') },
                                    { icon: TrendingUp, label: 'CTR', value: touchpoint.kpis.ctr.toFixed(2) + '%' },
                                ].map(m => (
                                    <div key={m.label} style={{ padding: '10px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '4px' }}>
                                            <m.icon size={10} /> {m.label}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{m.value}</div>
                                    </div>
                                ))}
                            </div>
                            {touchpoint.kpis.spend > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {[
                                        { icon: DollarSign, label: 'Spend', value: '€' + touchpoint.kpis.spend.toLocaleString('de-DE', { minimumFractionDigits: 2 }) },
                                        { icon: DollarSign, label: 'CPC', value: '€' + touchpoint.kpis.cpc.toFixed(2) },
                                        { icon: DollarSign, label: 'CPA', value: '€' + touchpoint.kpis.cpa.toFixed(2) },
                                    ].map(m => (
                                        <div key={m.label} style={{ padding: '10px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '4px' }}>
                                                <m.icon size={10} /> {m.label}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{m.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Per-campaign breakdown for this touchpoint */}
                            {(() => {
                                const campaignBreakdown = getLinkedCampaigns(touchpoint.id)
                                    .filter(c => c.channelKpis && c.channelKpis[touchpoint.id])
                                    .map(c => ({ campaign: c, kpi: c.channelKpis![touchpoint.id] }));
                                if (campaignBreakdown.length === 0) return null;
                                return (
                                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>Aufschlüsselung nach Kampagne</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {campaignBreakdown.map(({ campaign: c, kpi }) => (
                                                <div key={c.id}
                                                    onClick={() => { if (requestClose()) router.push(`/campaigns/${c.id}`); }}
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                                                >
                                                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                                                    <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)' }}>
                                                        <span>{kpi.impressions.toLocaleString('de-DE')} Impr.</span>
                                                        <span>{kpi.ctr.toFixed(1)}% CTR</span>
                                                        {kpi.spend > 0 && <span>€{kpi.spend.toLocaleString('de-DE')}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div className="card">
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ListTodo size={14} /> Content & Assets
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {getLinkedContent(touchpoint.id).map(c => (
                                <div
                                    key={c.id}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.title}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{c.platform}</span>
                                    </div>
                                    <span className="badge badge-primary" style={{ fontSize: '0.55rem' }}>{c.status}</span>
                                </div>
                            ))}
                            {getLinkedContent(touchpoint.id).length === 0 && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', padding: '10px', background: 'var(--bg-hover)', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>Kein Content hinterlegt.</div>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="modal-footer" style={{ background: 'var(--bg-surface)' }}>
                        <button className="btn btn-ghost" onClick={handleCancelEdit}>Abbrechen</button>
                        <button className="btn btn-primary" onClick={() => {
                            if (onSave) {
                                const normalizedPhases = Array.from(new Set(editedTp.journeyPhases));
                                onSave({
                                    ...editedTp,
                                    journeyPhases: normalizedPhases,
                                    journeyPhase: normalizedPhases[0] ?? '',
                                });
                            }
                            setIsEditing(false);
                        }}>Speichern</button>
                    </div>
                )}
            </div>
        </div>
    );
}

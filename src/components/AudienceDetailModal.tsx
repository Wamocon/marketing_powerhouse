import { useState } from 'react';
import { Megaphone, X, Edit, Check, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Audience } from '../types';

const segmentConfig: Record<string, { badge: string; label: string }> = {
    'B2C': { badge: 'badge-info', label: 'B2C' },
    'B2B': { badge: 'badge-primary', label: 'B2B' },
};

const typeConfig = {
    'buyer': { label: 'Buyer Persona', icon: '🎯' },
    'user': { label: 'User Persona', icon: '🧑‍💻' },
};

interface AudienceDetailModalProps {
    audience: Audience;
    onClose: () => void;
}

export default function AudienceDetailModal({ audience, onClose }: AudienceDetailModalProps) {
    const { can } = useAuth();
    const { campaigns, updateAudience, deleteAudience } = useData();
    const canEdit = can('canEditAudiences');
    const canDelete = can('canDeleteItems');

    const [editMode, setEditMode] = useState(false);
    const [editedAudience, setEditedAudience] = useState<Audience>({ ...audience });

    const getLinkedCampaigns = (audienceId: string) =>
        campaigns.filter(c => c.targetAudiences?.includes(audienceId));

    const handleSave = async () => {
        await updateAudience(audience.id, editedAudience);
        setEditMode(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
            }}>
                <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                        <div className="persona-avatar persona-avatar--lg" style={{ background: editedAudience.color, flexShrink: 0 }}>
                            {editedAudience.initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            {editMode ? (
                                <input type="text" className="form-input" value={editedAudience.name} onChange={e => setEditedAudience({ ...editedAudience, name: e.target.value })} style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)', marginBottom: '4px', padding: '2px 8px' }} />
                            ) : (
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>{editedAudience.name}</h2>
                            )}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                <span className={`badge ${segmentConfig[editedAudience.segment].badge}`}>{editedAudience.segment}</span>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    {typeConfig[editedAudience.type].icon} {typeConfig[editedAudience.type].label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {canEdit && (
                            editMode ? (
                                <button className="btn btn-primary btn-sm" onClick={handleSave}><Check size={14} /> Speichern</button>
                            ) : (
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}><Edit size={14} /> Bearbeiten</button>
                            )
                        )}
                        {canDelete && (
                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: '#ef4444' }} onClick={async () => {
                                if (window.confirm('Möchtest du diese Persona wirklich löschen?')) {
                                    await deleteAudience(audience.id);
                                    onClose();
                                }
                            }} title="Löschen">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                    </div>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Beschreibung */}
                    <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Beschreibung</div>
                        {editMode ? (
                            <textarea className="form-input form-textarea" value={editedAudience.description} onChange={e => setEditedAudience({ ...editedAudience, description: e.target.value })} style={{ minHeight: '60px' }} />
                        ) : (
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{editedAudience.description}</div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Demografie */}
                        <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                            <div className="detail-section-title">Demografie</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { key: 'age', label: 'Alter', suffix: ' J.' },
                                    { key: 'gender', label: 'Geschlecht' },
                                    { key: 'location', label: 'Standort' },
                                    { key: 'income', label: 'Einkommen' },
                                    { key: 'education', label: 'Bildung' },
                                    { key: 'jobTitle', label: 'Berufsfeld' },
                                ].map(item => (
                                    <div key={item.key} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{item.label}</div>
                                        {editMode ? (
                                            <input type="text" className="form-input" style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px' }} value={editedAudience[item.key]} onChange={e => setEditedAudience({ ...editedAudience, [item.key]: e.target.value })} />
                                        ) : (
                                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{editedAudience[item.key]}{item.suffix || ''}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Pain Points */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div className="detail-section-title">😤 Pain Points</div>
                                {editMode ? (
                                    <textarea className="form-input form-textarea" value={editedAudience.painPoints.join('\n')} onChange={e => setEditedAudience({ ...editedAudience, painPoints: e.target.value.split('\n') })} style={{ minHeight: '80px', fontSize: 'var(--font-size-xs)' }} placeholder="Ein Point pro Zeile" />
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {editedAudience.painPoints.map(p => (
                                            <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: '#ef4444', marginTop: '1px' }}>●</span> {p}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Goals */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div className="detail-section-title">🎯 Ziele & Motivationen</div>
                                {editMode ? (
                                    <textarea className="form-input form-textarea" value={editedAudience.goals.join('\n')} onChange={e => setEditedAudience({ ...editedAudience, goals: e.target.value.split('\n') })} style={{ minHeight: '80px', fontSize: 'var(--font-size-xs)' }} placeholder="Ein Ziel pro Zeile" />
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {editedAudience.goals.map(g => (
                                            <li key={g} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                <span style={{ color: '#10b981', marginTop: '1px' }}>●</span> {g}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Entscheidungsprozess */}
                        <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                            <div className="detail-section-title">🧠 Entscheidungsprozess</div>
                            {editMode ? (
                                <textarea className="form-input form-textarea" value={editedAudience.decisionProcess} onChange={e => setEditedAudience({ ...editedAudience, decisionProcess: e.target.value })} style={{ minHeight: '60px', fontSize: 'var(--font-size-xs)' }} />
                            ) : (
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                    {editedAudience.decisionProcess}
                                </p>
                            )}
                        </div>

                        <div>
                            {/* Customer Journey */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0, marginBottom: '20px' }}>
                                <div className="detail-section-title">🗺️ Customer Journey Phase</div>
                                {editMode ? (
                                    <input type="text" className="form-input" value={editedAudience.journeyPhase} onChange={e => setEditedAudience({ ...editedAudience, journeyPhase: e.target.value })} style={{ fontSize: 'var(--font-size-xs)' }} />
                                ) : (
                                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        {editedAudience.journeyPhase}
                                    </div>
                                )}
                            </div>

                            {/* Kanäle */}
                            <div className="detail-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                <div className="detail-section-title">📡 Bevorzugte Kanäle</div>
                                {editMode ? (
                                    <input type="text" className="form-input" value={editedAudience.preferredChannels.join(', ')} onChange={e => setEditedAudience({ ...editedAudience, preferredChannels: e.target.value.split(',').map(s => s.trim()) })} style={{ fontSize: 'var(--font-size-xs)' }} placeholder="Kommagetrennt" />
                                ) : (
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {editedAudience.preferredChannels.map(ch => (
                                            <span key={ch} className="keyword-tag keyword-tag--read">{ch}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Verknüpfte Kampagnen */}
                    <div className="detail-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', paddingBottom: 0, margin: 0 }}>
                        <div className="detail-section-title">
                            <Megaphone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Verknüpfte Kampagnen
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {getLinkedCampaigns(editedAudience.id).map(c => (
                                <div key={c.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                                }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{c.name}</span>
                                    <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'planned' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                                        {c.status === 'active' ? 'Aktiv' : c.status === 'planned' ? 'Geplant' : c.status}
                                    </span>
                                </div>
                            ))}
                            {getLinkedCampaigns(editedAudience.id).length === 0 && (
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                    Keine Kampagnen verknüpft
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

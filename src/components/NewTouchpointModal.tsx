import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Touchpoint } from '../types';

interface NewTouchpointModalProps {
    onClose: () => void;
    onCreate: (tp: Partial<Touchpoint>) => void;
}

export default function NewTouchpointModal({ onClose, onCreate }: NewTouchpointModalProps) {
    const [newTp, setNewTp] = useState({
        name: '',
        description: '',
        type: 'Owned Website',
        url: '',
        status: 'active' as 'active' | 'planned' | 'inactive',
        journeyPhase: ''
    });

    const handleCreate = () => {
        if (!newTp.name.trim()) return;
        
        const newId = 'tp' + Date.now();
        onCreate({
            id: newId,
            ...newTp
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, maxHeight: '90vh', width: '100%', maxWidth: '600px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                        Neuen Kanal anlegen
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
                    <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--color-primary)' }}>
                        <div className="form-group">
                            <label className="form-label">Name des Kanals *</label>
                            <input
                                className="form-input"
                                placeholder="z.B. Instagram Main Channel"
                                value={newTp.name}
                                onChange={e => setNewTp({ ...newTp, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Beschreibung</label>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '80px' }}
                                placeholder="Wofür wird dieser Kanal genutzt?"
                                value={newTp.description || ''}
                                onChange={e => setNewTp({ ...newTp, description: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Kanaltyp</label>
                                <select className="form-select" value={newTp.type} onChange={e => setNewTp({ ...newTp, type: e.target.value })}>
                                    <option value="Paid Search">Paid Search</option>
                                    <option value="Paid Social">Paid Social</option>
                                    <option value="Owned Website">Owned Website</option>
                                    <option value="Owned CRM">Owned CRM</option>
                                    <option value="Direct Sales">Direct Sales</option>
                                    <option value="Organic Social">Organic Social</option>
                                    <option value="Earned Media">Earned Media</option>
                                    <option value="Product">Product</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL (optional)</label>
                                <input className="form-input" placeholder="https://..." value={newTp.url} onChange={e => setNewTp({ ...newTp, url: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={newTp.status} onChange={e => setNewTp({ ...newTp, status: e.target.value as 'active' | 'planned' | 'inactive' })}>
                                    <option value="active">Aktiv</option>
                                    <option value="planned">Geplant</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Journey Phase</label>
                                <select className="form-select" value={newTp.journeyPhase || ''} onChange={e => setNewTp({ ...newTp, journeyPhase: e.target.value })}>
                                    <option value="">Keine Phase</option>
                                    <option value="Awareness">Awareness</option>
                                    <option value="Consideration">Consideration</option>
                                    <option value="Purchase">Purchase</option>
                                    <option value="Retention">Retention</option>
                                    <option value="Advocacy">Advocacy</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ background: 'var(--bg-surface)' }}>
                    <button className="btn btn-ghost" onClick={onClose}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleCreate} disabled={!newTp.name.trim()}>
                        Kanal anlegen
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Touchpoint } from '../types';

interface NewTouchpointModalProps {
    onClose: () => void;
    onCreate: (tp: Omit<Touchpoint, 'id'>) => Promise<void>;
}

const JOURNEY_PHASES = ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'];

export default function NewTouchpointModal({ onClose, onCreate }: NewTouchpointModalProps) {
    const [newTp, setNewTp] = useState({
        name: '',
        description: '',
        type: 'Owned Website',
        url: '',
        status: 'active' as 'active' | 'planned' | 'inactive',
        journeyPhases: [] as string[],
        journeyPhase: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const hasUnsavedChanges = Boolean(
        newTp.name.trim() ||
        newTp.description.trim() ||
        newTp.url.trim() ||
        newTp.journeyPhases.length ||
        newTp.type !== 'Owned Website' ||
        newTp.status !== 'active'
    );

    const requestClose = () => {
        if (isLoading) return;
        if (hasUnsavedChanges && !window.confirm('Es gibt ungespeicherte Eingaben. Möchtest du das Modal wirklich schließen?')) {
            return;
        }
        onClose();
    };

    const handleCreate = async () => {
        if (!newTp.name.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const normalizedPhases = Array.from(new Set(newTp.journeyPhases));
            await onCreate({
                ...newTp,
                journeyPhases: normalizedPhases,
                journeyPhase: normalizedPhases[0] ?? '',
            });
            // parent's onCreate calls setShowNewModal(false) on success
        } catch {
            setError('Fehler beim Speichern. Bitte versuche es erneut.');
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={requestClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
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
                    <button className="btn btn-ghost btn-icon" onClick={requestClose} disabled={isLoading}><X size={20} /></button>
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

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Journey Phasen</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {JOURNEY_PHASES.map(phase => {
                                        const checked = newTp.journeyPhases.includes(phase);
                                        return (
                                            <label key={phase} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={event => {
                                                        setNewTp(prev => {
                                                            const phases = event.target.checked
                                                                ? [...prev.journeyPhases, phase]
                                                                : prev.journeyPhases.filter(item => item !== phase);
                                                            return { ...prev, journeyPhases: phases, journeyPhase: phases[0] ?? '' };
                                                        });
                                                    }}
                                                />
                                                {phase}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ background: 'var(--bg-surface)', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 'var(--radius-sm)', padding: '8px 12px',
                            fontSize: 'var(--font-size-xs)', color: '#ef4444',
                        }}>
                            {error}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={requestClose} disabled={isLoading}>Abbrechen</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={!newTp.name.trim() || isLoading}>
                            {isLoading ? 'Wird gespeichert...' : 'Kanal anlegen'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Task } from '../types';

interface NewTaskModalProps {
    onClose: () => void;
}

export default function NewTaskModal({ onClose }: NewTaskModalProps) {
    const { addTask } = useTasks();
    const { currentUser } = useAuth();
    const { campaigns, users: testUsers, touchpoints } = useData();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Task');
    const [platform, setPlatform] = useState('');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [publishDate, setPublishDate] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [touchpointId, setTouchpointId] = useState('');
    const [status, setStatus] = useState('draft');
    const [oneDriveLink, setOneDriveLink] = useState('');

    const hasUnsavedChanges = Boolean(
        title.trim() ||
        description.trim() ||
        platform ||
        assignee ||
        dueDate ||
        publishDate ||
        campaignId ||
        touchpointId ||
        oneDriveLink.trim() ||
        type !== 'Task' ||
        status !== 'draft'
    );

    const requestClose = () => {
        if (hasUnsavedChanges && !window.confirm('Es gibt ungespeicherte Eingaben. Möchtest du das Modal wirklich schließen?')) {
            return;
        }
        onClose();
    };

    const handleSave = () => {
        if (!title.trim()) return;
        
        addTask({
            title,
            description,
            type,
            platform: platform || null,
            assignee: assignee || '',
            author: currentUser?.name || 'System',
            dueDate: dueDate || '',
            campaignId: campaignId || null,
            touchpointId: touchpointId || null,
            status: status as import('../types').TaskStatus,
            publishDate: publishDate || null,
            oneDriveLink: oneDriveLink,
            scope: 'single'
        });
        
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={requestClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, maxHeight: '90vh', width: '100%', maxWidth: '600px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
                    <div className="modal-title">Neue Aufgabe erstellen</div>
                    <button className="btn btn-ghost btn-icon" onClick={requestClose}><X size={20} /></button>
                </div>
                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Aufgabentitel *</label>
                        <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Z.B. Landingpage Copy erstellen" autoFocus />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Aufgabentyp</label>
                            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                                <option value="Post (Beschreibung)">Post (Beschreibung)</option>
                                <option value="Post (Foto)">Post (Foto)</option>
                                <option value="Videoskript">Videoskript</option>
                                <option value="Video">Video</option>
                                <option value="Karousell">Karousell</option>
                                <option value="Landingpage">Landingpage</option>
                                <option value="E-Mail-Newsletter">E-Mail-Newsletter</option>
                                <option value="E-Mail-Nachricht">E-Mail-Nachricht</option>
                                <option value="Sonstige">Sonstige</option>
                                <option value="Task">Einfache Aufgabe</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Plattform</label>
                            <select className="form-select" value={platform} onChange={e => setPlatform(e.target.value)}>
                                <option value="">Übergreifend</option>
                                <option value="Instagram">Instagram</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Google Ads">Google Ads</option>
                                <option value="Facebook">Facebook</option>
                                <option value="TikTok">TikTok</option>
                                <option value="E-Mail">E-Mail</option>
                                <option value="Website">Website</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Bearbeiter</label>
                            <select className="form-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
                                <option value="">Unzugewiesen</option>
                                {testUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fälligkeitsdatum</label>
                            <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Kampagne</label>
                            <select className="form-select" value={campaignId} onChange={e => setCampaignId(e.target.value)}>
                                <option value="">Keine Kampagne (Allgemein)</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Touchpoint</label>
                            <select className="form-select" value={touchpointId} onChange={e => setTouchpointId(e.target.value)}>
                                <option value="">Kein Touchpoint</option>
                                {touchpoints.map(tp => <option key={tp.id} value={tp.id}>{tp.name} ({tp.type})</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Veröffentlichungsdatum</label>
                            <input type="date" className="form-input" value={publishDate} onChange={e => setPublishDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="draft">Entwurf / Offen</option>
                                <option value="ai_generating">KI generiert...</option>
                                <option value="ai_ready">KI-Vorschlag</option>
                                <option value="review">In Review</option>
                                <option value="revision">Überarbeitung</option>
                                <option value="approved">Freigegeben</option>
                                <option value="scheduled">Eingeplant</option>
                                <option value="posted">Live / Gepostet</option>
                                <option value="monitoring">Beobachtung</option>
                                <option value="analyzed">Analysiert</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">OneDrive / Datei Link</label>
                        <input className="form-input" value={oneDriveLink} onChange={e => setOneDriveLink(e.target.value)} placeholder="https://onedrive.live.com/..." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Beschreibung</label>
                        <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Details zur Aufgabe..." rows={4} />
                    </div>
                </div>
                <div className="modal-footer" style={{ background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="btn btn-ghost" onClick={requestClose}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}><Save size={16} /> Aufgabe erstellen</button>
                </div>
            </div>
        </div>
    );
}

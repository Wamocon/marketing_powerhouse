import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useContents } from '../context/ContentContext';
import { useTasks } from '../context/TaskContext';
import { campaigns, touchpoints } from '../data/mockData';

interface NewContentModalProps {
    onClose: () => void;
    defaultCampaignId?: string;
}

export default function NewContentModal({ onClose, defaultCampaignId }: NewContentModalProps) {
    const { addContent, updateContent } = useContents();
    const { addTask } = useTasks();

    const [newContent, setNewContent] = useState({
        title: '', description: '', publishDate: '', platform: '',
        campaignId: defaultCampaignId || '', contentType: 'social', createTasks: false,
        touchpointId: '', journeyPhase: 'Awareness'
    });

    const handleCreate = () => {
        if (!newContent.title.trim()) return;

        const contentId = addContent({
            title: newContent.title,
            description: newContent.description,
            publishDate: newContent.publishDate || null,
            platform: newContent.platform || '',
            campaignId: newContent.campaignId || null,
            contentType: newContent.contentType,
            touchpointId: newContent.touchpointId || null,
            journeyPhase: newContent.journeyPhase || 'Awareness',
            taskIds: [],
            author: 'Aktueller Nutzer',
            status: 'idea' as import('../types').ContentStatus,
        });

        if (newContent.createTasks && contentId) {
            const taskId = 't' + Date.now();
            addTask({
                id: taskId,
                title: `Aufgabe für: ${newContent.title}`,
                status: 'draft' as import('../types').TaskStatus,
                assignee: '',
                author: 'Aktueller Nutzer',
                dueDate: newContent.publishDate || '',
                publishDate: null,
                platform: newContent.platform || null,
                type: 'Task',
                oneDriveLink: '',
                description: `Aufgabenhülle für Content "${newContent.title}".`,
                campaignId: newContent.campaignId || null,
                touchpointId: newContent.touchpointId || null,
                scope: 'single',
            });
            updateContent(contentId, { taskIds: [taskId] });
        }

        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{
                margin: 0, maxHeight: '90vh', width: '100%', maxWidth: '600px',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <div className="modal-header">
                    <div className="modal-title"><Plus size={18} style={{ color: 'var(--color-primary)' }} /> Neuen Content planen</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Titel *</label>
                        <input className="form-input" placeholder="z. B. Instagram Post: ISTQB Tipps"
                            value={newContent.title} onChange={e => setNewContent({ ...newContent, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Beschreibung</label>
                        <textarea className="form-input form-textarea" placeholder="Worum geht es im Content?"
                            value={newContent.description} onChange={e => setNewContent({ ...newContent, description: e.target.value })}
                            style={{ minHeight: '80px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Veröffentlichungsdatum</label>
                            <input type="date" className="form-input" value={newContent.publishDate}
                                onChange={e => setNewContent({ ...newContent, publishDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Plattform</label>
                            <select className="form-input" value={newContent.platform}
                                onChange={e => setNewContent({ ...newContent, platform: e.target.value })}>
                                <option value="">Bitte wählen…</option>
                                {['Instagram', 'LinkedIn', 'Google Ads', 'Meta Ads', 'TikTok', 'E-Mail', 'Website', 'YouTube'].map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Content-Typ</label>
                            <select className="form-input" value={newContent.contentType}
                                onChange={e => setNewContent({ ...newContent, contentType: e.target.value })}>
                                <option value="social">Social Media</option>
                                <option value="email">E-Mail</option>
                                <option value="ads">Ads / Anzeige</option>
                                <option value="content">Blog / Content</option>
                                <option value="event">Event</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Kampagne</label>
                            <select className="form-input" value={newContent.campaignId}
                                onChange={e => setNewContent({ ...newContent, campaignId: e.target.value })}>
                                <option value="">Keine Kampagne</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Touchpoint</label>
                            <select className="form-input" value={newContent.touchpointId}
                                onChange={e => setNewContent({ ...newContent, touchpointId: e.target.value })}>
                                <option value="">Kein Touchpoint</option>
                                {touchpoints.map(tp => <option key={tp.id} value={tp.id}>{tp.name} ({tp.type})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Customer Journey Phase</label>
                            <select className="form-input" value={newContent.journeyPhase}
                                onChange={e => setNewContent({ ...newContent, journeyPhase: e.target.value })}>
                                <option value="Awareness">Awareness</option>
                                <option value="Consideration">Consideration</option>
                                <option value="Purchase">Purchase</option>
                                <option value="Retention">Retention</option>
                                <option value="Advocacy">Advocacy</option>
                            </select>
                        </div>
                    </div>

                    {/* Auto-task creation checkbox */}
                    <div style={{
                        padding: '16px', marginTop: '8px',
                        background: newContent.createTasks ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${newContent.createTasks ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-color)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }} onClick={() => setNewContent({ ...newContent, createTasks: !newContent.createTasks })}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: newContent.createTasks ? 'var(--color-primary)' : 'var(--bg-surface)',
                                border: newContent.createTasks ? 'none' : '2px solid var(--border-color-strong)',
                                color: 'white', fontSize: '12px', transition: 'all 0.2s',
                            }}>
                                {newContent.createTasks && '✓'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Aufgabenhülle erstellen</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    Erstellt automatisch eine Entwurfs-Aufgabe, damit das Team sofort mit der Umsetzung beginnen kann.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleCreate} disabled={!newContent.title.trim()}>
                        <Plus size={16} /> Content erstellen
                    </button>
                </div>
            </div>
        </div>
    );
}

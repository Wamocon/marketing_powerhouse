import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Share2, Plus, Edit, MoreVertical, TrendingUp, Users, Map, Target, Heart, Megaphone, CheckCircle2, Link as LinkIcon, ListTodo, ExternalLink, Edit2, Trash2, Eye, MousePointerClick, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PageHelp from '../components/PageHelp';
import TouchpointDetailModal from '../components/TouchpointDetailModal';
import NewTouchpointModal from '../components/NewTouchpointModal';

const TYPE_COLORS = {
    'Paid Search': 'badge-warning',
    'Paid Social': 'badge-warning',
    'Owned Website': 'badge-primary',
    'Owned CRM': 'badge-primary',
    'Direct Sales': 'badge-danger',
    'Organic Social': 'badge-info',
    'Earned Media': 'badge-success',
    'Product': 'badge-default'
};

export default function TouchpointsPage() {
    const { can } = useAuth();
    const searchParams = useSearchParams();
    const { touchpoints, addTouchpoint, updateTouchpoint, deleteTouchpoint } = useData();
    const canManage = can('canManageTouchpoints');

    const [selectedTpId, setSelectedTpId] = useState<string | null>(
        () => searchParams.get('selectedTpId') ?? null
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [showNewModal, setShowNewModal] = useState(false);

    const filtered = touchpoints.filter(tp => {
        const matchSearch = tp.name.toLowerCase().includes(searchTerm.toLowerCase()) || tp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'All' || tp.type === filterType;
        return matchSearch && matchType;
    });

    const selectedTp = touchpoints.find(tp => tp.id === selectedTpId);

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">🔗 Kanäle & Touchpoints</h1>
                    <p className="page-subtitle">Die zentrale Bibliothek aller Berührungspunkte mit den Zielgruppen</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Touchpoints">
                        <p style={{ marginBottom: '12px' }}>Hier verwaltest du alle Kanäle (Paid, Owned, Earned), auf denen ihr mit potenziellen Kunden interagiert.</p>
                        <ul className="help-list">
                            <li><strong>Touchpoint-Architektur:</strong> Anstatt Kanäle als Freitext in jede Kampagne zu schreiben, pflegen wir eine Single-Source-of-Truth.</li>
                            <li><strong>Dynamische Verknüpfung:</strong> Du siehst in Echtzeit, welche Kampagnen und welcher Content über diesen spezifischen Kanal ausgespielt werden.</li>
                            <li><strong>Kanal-KPIs:</strong> Jeder aktive Touchpoint zeigt aggregierte Performance-Daten (Impressions, Clicks, CTR, Spend), sowohl in der Kartenansicht als auch im Detail-Modal mit Aufschlüsselung nach Kampagne.</li>
                        </ul>
                    </PageHelp>

                    {canManage && (
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={16} /> Neuer Kanal
                        </button>
                    )}
                </div>
            </div>

            {/* Filter-Leiste */}
            <div className="filters-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Touchpoint suchen..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <select
                    className="form-input"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    style={{ maxWidth: '200px' }}
                >
                    <option value="All">Alle Typen</option>
                    {Array.from(new Set(touchpoints.map(tp => tp.type))).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {filtered.map(tp => {
                    const isSelected = selectedTpId === tp.id;
                    return (
                        <div
                            key={tp.id}
                            className="card"
                            onClick={() => setSelectedTpId(isSelected ? null : tp.id)}
                            style={{
                                padding: '20px',
                                cursor: 'pointer',
                                borderColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, margin: 0 }}>{tp.name}</h3>
                                <span className={`badge ${tp.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                                    {tp.status === 'active' ? 'Aktiv' : 'Geplant'}
                                </span>
                            </div>

                            <span className={`badge ${TYPE_COLORS[tp.type] || 'badge-default'}`} style={{ alignSelf: 'flex-start' }}>
                                {tp.type}
                            </span>

                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                {tp.description}
                            </p>

                            {tp.kpis && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '8px 0' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Eye size={10} /> {tp.kpis.impressions >= 1000 ? (tp.kpis.impressions / 1000).toFixed(1) + 'K' : tp.kpis.impressions}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <MousePointerClick size={10} /> {tp.kpis.clicks >= 1000 ? (tp.kpis.clicks / 1000).toFixed(1) + 'K' : tp.kpis.clicks}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <TrendingUp size={10} /> {tp.kpis.ctr.toFixed(1)}%
                                    </span>
                                    {tp.kpis.spend > 0 && (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <DollarSign size={10} /> €{tp.kpis.spend.toLocaleString('de-DE')}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                <LinkIcon size={12} /> {tp.url}
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedTp && (
                <TouchpointDetailModal
                    touchpoint={selectedTp}
                    onClose={() => setSelectedTpId(null)}
                    onDelete={async (id) => {
                        await deleteTouchpoint(id);
                        setSelectedTpId(null);
                    }}
                    onSave={async (updatedTp) => {
                        await updateTouchpoint(updatedTp.id, updatedTp);
                    }}
                />
            )}
            
            {showNewModal && (
                <NewTouchpointModal
                    onClose={() => setShowNewModal(false)}
                    onCreate={async (newTp) => {
                        await addTouchpoint(newTp as Omit<import('../types').Touchpoint, 'id'>);
                        setShowNewModal(false);
                    }}
                />
            )}
        </div>
    );
}

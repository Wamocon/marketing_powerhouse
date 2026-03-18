import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Calendar, Users, Bot, Tag, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import PageHelp from '../components/PageHelp';
import NewCampaignModal from '../components/NewCampaignModal';

const statusConfig = {
    active: { label: 'Aktiv', badge: 'badge-success' },
    planned: { label: 'Geplant', badge: 'badge-info' },
    draft: { label: 'Entwurf', badge: 'badge-warning' },
    completed: { label: 'Abgeschlossen', badge: 'badge-primary' },
    paused: { label: 'Pausiert', badge: 'badge-danger' },
};

export default function CampaignsPage() {
    const router = useRouter();
    const { can } = useAuth();
    const { campaigns } = useData();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

    const filteredCampaigns = campaigns
        .filter(c => filter === 'all' || c.status === filter)
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Kampagnen</h1>
                    <p className="page-subtitle">{campaigns.length} Kampagnen insgesamt Â· {campaigns.filter(c => c.status === 'active').length} aktiv</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title="Kampagnen-Management">
                        <p style={{ marginBottom: '12px' }}>Die Kommandozentrale fÃ¼r all deine groÃŸen Initiativen. Alles ordnet sich bestimmten Kampagnen unter.</p>
                        <ul className="help-list">
                            <li><strong>Dashboard-Sicht:</strong> Sehe sofort den Fortschritt und die Budget-Auslastung laufender Kampagnen in Kachelansicht.</li>
                            <li><strong>Neue Kampagnen erstellen:</strong> Vergib Budgets, eine Laufzeit (Start/Ende), Keywords und setze verbindlich Zielgruppen, die du zuvor mit dem Team erarbeitet hast.</li>
                            <li><strong>Deep-Dive:</strong> Mit einem Klick auf "Details" oder die Kachel gelangst du ins Herz (die Detailseite) der Kampagne. Dort planst du den Content, Creatives und checkst die Performance tiefergehend.</li>
                        </ul>
                    </PageHelp>
                    {can('canCreateCampaigns') && (
                        <button className="btn btn-primary" onClick={() => setShowNewCampaignModal(true)}>
                            <Plus size={16} />
                            Neue Kampagne
                        </button>
                    )}
                </div>
            </div>


            {/* Filter & Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Kampagnen durchsuchenâ€¦"
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                    {[
                        { key: 'all', label: 'Alle' },
                        { key: 'active', label: 'Aktiv' },
                        { key: 'planned', label: 'Geplant' },
                        { key: 'draft', label: 'Entwurf' },
                        { key: 'completed', label: 'Abgeschlossen' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab ${filter === tab.key ? 'active' : ''}`}
                            onClick={() => setFilter(tab.key)}
                            style={{
                                borderBottom: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 16px',
                                background: filter === tab.key ? 'var(--bg-hover)' : 'transparent',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                {filteredCampaigns.map((campaign) => {
                    const status = statusConfig[campaign.status];
                    const linkedAudienceCount = campaign.targetAudiences?.length || 0;
                    const keywordCount = campaign.campaignKeywords?.length || 0;
                    return (
                        <div
                            key={campaign.id}
                            className="card"
                            style={{ cursor: 'pointer', padding: '20px' }}
                            onClick={() => router.push(`/campaigns/${campaign.id}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>
                                        {campaign.name}
                                    </h3>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {campaign.description}
                                    </p>
                                </div>
                                <span className={`badge ${status.badge}`}>{status.label}</span>
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    <span>Fortschritt</span>
                                    <span>{campaign.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`progress-bar-fill ${campaign.progress >= 80 ? 'success' : campaign.progress >= 50 ? 'primary' : 'warning'}`}
                                        style={{ width: `${campaign.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Quick badges: Master Prompt + Audiences + Keywords */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                {campaign.masterPrompt && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.6875rem', padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(220,38,38,0.15)',
                                        color: 'var(--color-primary)',
                                    }}>
                                        <Bot size={10} /> Master-Prompt
                                    </span>
                                )}
                                {linkedAudienceCount > 0 && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.6875rem', padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(16,185,129,0.15)',
                                        color: '#10b981',
                                    }}>
                                        <Users size={10} /> {linkedAudienceCount} Persona{linkedAudienceCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {keywordCount > 0 && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.6875rem', padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'rgba(245,158,11,0.15)',
                                        color: '#f59e0b',
                                    }}>
                                        <Tag size={10} /> {keywordCount} Keywords
                                    </span>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div style={{ display: 'flex', gap: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} />
                                    <span>{new Date(campaign.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} â€“ {new Date(campaign.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={12} />
                                    <span>{campaign.owner}</span>
                                </div>
                            </div>

                            {/* Channels */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                                {campaign.channels.map(ch => (
                                    <span key={ch} style={{
                                        fontSize: '0.6875rem',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--bg-hover)',
                                        color: 'var(--text-secondary)',
                                    }}>
                                        {ch}
                                    </span>
                                ))}
                            </div>

                            {/* Budget */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '16px',
                                paddingTop: '12px',
                                borderTop: '1px solid var(--border-color)',
                                fontSize: 'var(--font-size-sm)',
                            }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Budget</span>
                                <span style={{ fontWeight: 600 }}>
                                    â‚¬{campaign.spent.toLocaleString('de-DE')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ â‚¬{campaign.budget.toLocaleString('de-DE')}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showNewCampaignModal && (
                <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
            )}
        </div>
    );
}


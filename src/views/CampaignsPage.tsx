import { useState } from 'react';
import { useProjectRouter } from '../hooks/useProjectRouter';
import { Plus, Search, Calendar, Users, Bot, Tag, MapPin, UserCheck, UsersRound } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PageHelp from '../components/PageHelp';
import NewCampaignModal from '../components/NewCampaignModal';
import ImportExportPanel from '../components/ImportExportPanel';
import { downloadCampaignExport } from '../lib/importExport';
import type { CampaignExportData } from '../types/importExport';

const statusConfig: Record<string, { label: { de: string; en: string; tr: string }; badge: string }> = {
    active: { label: { de: 'Aktiv', en: 'Active', tr: 'Aktif' }, badge: 'badge-success' },
    planned: { label: { de: 'Geplant', en: 'Planned', tr: 'Planlanmış' }, badge: 'badge-info' },
    draft: { label: { de: 'Entwurf', en: 'Draft', tr: 'Taslak' }, badge: 'badge-warning' },
    completed: { label: { de: 'Abgeschlossen', en: 'Completed', tr: 'Tamamlandı' }, badge: 'badge-primary' },
    paused: { label: { de: 'Pausiert', en: 'Paused', tr: 'Duraklatıldı' }, badge: 'badge-danger' },
};

export default function CampaignsPage() {
    const router = useProjectRouter();
    const { can, isSuperAdmin, activeCompanyRole } = useAuth();
    const { language, locale } = useLanguage();
    const t = (translations: { de: string; en: string; tr: string }) => translations[language];
    const { campaigns, users, addCampaign } = useData();
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
                    <h1 className="page-title">{t({ de: 'Kampagnen', en: 'Campaigns', tr: 'Kampanyalar' })}</h1>
                    <p className="page-subtitle">{campaigns.length} {t({ de: 'Kampagnen insgesamt', en: 'campaigns total', tr: 'toplam kampanya' })} - {campaigns.filter(c => c.status === 'active').length} {t({ de: 'aktiv', en: 'active', tr: 'aktif' })}</p>
                </div>
                <div className="page-header-actions">
                    <PageHelp title={t({ de: 'Kampagnen-Management', en: 'Campaign management', tr: 'Kampanya yönetimi' })}>
                        <p style={{ marginBottom: '12px' }}>{t({ de: 'Die Kommandozentrale für all deine gro\u00dfen Initiativen. Alles ordnet sich bestimmten Kampagnen unter.', en: 'The command center for your key initiatives. Everything is organized by campaign.', tr: 'Temel girişimleriniz için komuta merkezi. Her şey kampanyalara göre düzenlenir.' })}</p>
                        <ul className="help-list">
                            <li><strong>{t({ de: 'Dashboard-Sicht', en: 'Dashboard view', tr: 'Pano görünümü' })}:</strong> {t({ de: 'Sehe sofort den Fortschritt und die Budget-Auslastung laufender Kampagnen in Kachelansicht.', en: 'Instant progress and budget utilization for running campaigns in card view.', tr: 'Kart görünümünde devam eden kampanyaların ilerleme ve bütçe kullanımını anında görün.' })}</li>
                            <li><strong>{t({ de: 'Neue Kampagnen erstellen', en: 'Create campaigns', tr: 'Kampanya olu\u015ftur' })}:</strong> {t({ de: 'Vergib Budgets, eine Laufzeit (Start/Ende), Keywords und setze verbindlich Zielgruppen.', en: 'Define budget, timeline, keywords and target audiences.', tr: 'Bütçe, zaman çizelgesi, anahtar kelimeler ve hedef kitleleri belirleyin.' })}</li>
                        </ul>
                    </PageHelp>
                    {can('canCreateCampaigns') && (
                        <button className="btn btn-primary" onClick={() => setShowNewCampaignModal(true)}>
                            <Plus size={16} />
                            {t({ de: 'Neue Kampagne', en: 'New campaign', tr: 'Yeni kampanya' })}
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
                        placeholder={t({ de: 'Kampagnen durchsuchen...', en: 'Search campaigns...', tr: 'Kampanyalarda ara...' })}
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                    {[
                        { key: 'all', label: t({ de: 'Alle', en: 'All', tr: 'Tümü' }) },
                        { key: 'active', label: t({ de: 'Aktiv', en: 'Active', tr: 'Aktif' }) },
                        { key: 'planned', label: t({ de: 'Geplant', en: 'Planned', tr: 'Planlanmı\u015f' }) },
                        { key: 'draft', label: t({ de: 'Entwurf', en: 'Draft', tr: 'Taslak' }) },
                        { key: 'completed', label: t({ de: 'Abgeschlossen', en: 'Completed', tr: 'Tamamlandı' }) },
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
                    const manager = users.find(u => u.id === campaign.responsibleManagerId);
                    const teamCount = campaign.teamMemberIds?.length || 0;
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
                                <span className={`badge ${status.badge}`}>{status.label[language]}</span>
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    <span>{t({ de: 'Fortschritt', en: 'Progress', tr: 'İlerleme' })}</span>
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
                                        <Users size={10} /> {linkedAudienceCount} {t({ de: `Persona${linkedAudienceCount !== 1 ? 's' : ''}`, en: `persona${linkedAudienceCount !== 1 ? 's' : ''}`, tr: `ki\u015fi` })}
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
                            <div style={{ display: 'flex', gap: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} />
                                    <span>{new Date(campaign.startDate).toLocaleDateString(locale, { day: '2-digit', month: 'short' })} - {new Date(campaign.endDate).toLocaleDateString(locale, { day: '2-digit', month: 'short' })}</span>
                                </div>
                                {manager && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <UserCheck size={12} style={{ color: '#8b5cf6' }} />
                                        <span>{manager.name}</span>
                                    </div>
                                )}
                                {teamCount > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <UsersRound size={12} style={{ color: '#0ea5e9' }} />
                                        <span>{teamCount} {t({ de: `Mitglied${teamCount !== 1 ? 'er' : ''}`, en: `member${teamCount !== 1 ? 's' : ''}`, tr: `üye` })}</span>
                                    </div>
                                )}
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
                                <span style={{ color: 'var(--text-secondary)' }}>{t({ de: 'Budget', en: 'Budget', tr: 'Bütçe' })}</span>
                                <span style={{ fontWeight: 600 }}>
                                    €{campaign.spent.toLocaleString(locale)} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ €{campaign.budget.toLocaleString(locale)}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Import / Export – Campaign Level */}
            {(isSuperAdmin || activeCompanyRole === 'company_admin') && (
                <ImportExportPanel
                    level="campaign"
                    onImport={async (raw) => {
                        const data = raw as CampaignExportData;
                        const c = data.campaign;
                        await addCampaign({
                            name: c.name,
                            status: c.status || 'planned',
                            startDate: c.startDate || new Date().toISOString().split('T')[0],
                            endDate: c.endDate || new Date().toISOString().split('T')[0],
                            budget: c.budget || 0,
                            spent: c.spent || 0,
                            channels: c.channels || [],
                            touchpointIds: [],
                            description: c.description || '',
                            masterPrompt: c.masterPrompt || '',
                            targetAudiences: c.targetAudiences || [],
                            campaignKeywords: c.campaignKeywords || [],
                            kpis: c.kpis || { impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
                            channelKpis: c.channelKpis,
                            owner: '',
                            progress: c.progress || 0,
                            responsibleManagerId: '',
                            teamMemberIds: [],
                        });
                    }}
                    onExport={() => {
                        if (campaigns.length > 0) downloadCampaignExport(campaigns[0]);
                    }}
                    exportDisabled={campaigns.length === 0}
                />
            )}

            {showNewCampaignModal && (
                <NewCampaignModal onClose={() => setShowNewCampaignModal(false)} />
            )}
        </div>
    );
}


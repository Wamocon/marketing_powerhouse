import {
    TrendingUp,
    TrendingDown,
    Eye,
    MousePointerClick,
    Target,
    Wallet,
    Megaphone,
    ArrowUpRight,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { campaigns, activityFeed, dashboardChartData, channelPerformance, budgetData } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const stats = [
    { label: 'Impressionen', value: '1.38M', change: '+12.5%', positive: true, icon: Eye, color: 'primary' },
    { label: 'Klicks', value: '62.5K', change: '+8.3%', positive: true, icon: MousePointerClick, color: 'accent' },
    { label: 'Conversions', value: '2.4K', change: '+15.2%', positive: true, icon: Target, color: 'success' },
    { label: 'Ausgaben', value: '€39.3K', change: '-3.1%', positive: false, icon: Wallet, color: 'warning' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: 'var(--font-size-xs)',
            }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
                        <span style={{ fontWeight: 600 }}>{entry.value.toLocaleString('de-DE')}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const navigate = useNavigate();

    const activeCampaigns = campaigns.filter(c => c.status === 'active');

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Dein Marketing auf einen Blick — Stand: 10. März 2026</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary">Report erstellen</button>
                    <button className="btn btn-primary" onClick={() => navigate('/campaigns')}>
                        <Megaphone size={16} />
                        Neue Kampagne
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className={`stat-card ${stat.color}`}>
                            <div className="stat-card-header">
                                <span className="stat-card-label">{stat.label}</span>
                                <div className={`stat-card-icon ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <div className="stat-card-value">{stat.value}</div>
                            <div className={`stat-card-change ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stat.change} vs. Vormonat
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="content-grid-2">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Performance-Trend</div>
                            <div className="card-subtitle">Letzte 7 Wochen</div>
                        </div>
                        <div className="flex gap-sm">
                            <button className="btn btn-ghost btn-sm">Impressionen</button>
                            <button className="btn btn-ghost btn-sm">Klicks</button>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardChartData}>
                                <defs>
                                    <linearGradient id="gradientImpressions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="impressions"
                                    name="Impressionen"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#gradientImpressions)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="clicks"
                                    name="Klicks"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fill="url(#gradientClicks)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Kanal-Performance</div>
                            <div className="card-subtitle">Anteil am Gesamtergebnis</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ width: 200, height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={channelPerformance}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {channelPerformance.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1 }}>
                            {channelPerformance.map((channel) => (
                                <div key={channel.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: channel.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 'var(--font-size-sm)', flex: 1 }}>{channel.name}</span>
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{channel.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Campaigns & Activity */}
            <div className="content-grid-2">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Aktive Kampagnen</div>
                            <div className="card-subtitle">{activeCampaigns.length} Kampagnen laufen</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/campaigns')}>
                            Alle anzeigen <ArrowUpRight size={14} />
                        </button>
                    </div>
                    {activeCampaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            style={{
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-elevated)',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                            }}
                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{campaign.name}</span>
                                <span className="badge badge-success">Aktiv</span>
                            </div>
                            <div className="progress-bar" style={{ marginBottom: '8px' }}>
                                <div className="progress-bar-fill primary" style={{ width: `${campaign.progress}%` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                <span>{campaign.progress}% abgeschlossen</span>
                                <span>€{campaign.spent.toLocaleString('de-DE')} / €{campaign.budget.toLocaleString('de-DE')}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Aktivitäts-Feed</div>
                            <div className="card-subtitle">Neueste Aktivitäten im Team</div>
                        </div>
                    </div>
                    <div>
                        {activityFeed.map((activity) => (
                            <div
                                key={activity.id}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '12px 0',
                                    borderBottom: '1px solid var(--border-color)',
                                }}
                            >
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-elevated)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    flexShrink: 0,
                                }}>
                                    {activity.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <strong>{activity.user}</strong> {activity.action}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                        {activity.target} · {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Budget Quick View */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Budget-Übersicht Q1 2026</div>
                        <div className="card-subtitle">
                            €{budgetData.spent.toLocaleString('de-DE')} von €{budgetData.total.toLocaleString('de-DE')} ausgegeben ({Math.round(budgetData.spent / budgetData.total * 100)}%)
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/budget')}>
                        Details <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="progress-bar" style={{ height: '10px', marginBottom: '20px' }}>
                    <div
                        className="progress-bar-fill primary"
                        style={{ width: `${Math.round(budgetData.spent / budgetData.total * 100)}%` }}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {budgetData.categories.slice(0, 5).map((cat) => (
                        <div key={cat.name} style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-elevated)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{cat.name}</span>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                €{cat.spent.toLocaleString('de-DE')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ €{cat.planned.toLocaleString('de-DE')}</span>
                            </div>
                            <div className="progress-bar" style={{ marginTop: '8px' }}>
                                <div
                                    className="progress-bar-fill primary"
                                    style={{
                                        width: `${Math.round(cat.spent / cat.planned * 100)}%`,
                                        background: cat.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

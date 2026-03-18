import type { Task, ContentItem } from '../types';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { campaigns, activityFeed, dashboardChartData, channelPerformance } from '../data/mockData';
import { dashboardStats as stats, CustomTooltip, getTaskColorLogic, BudgetOverview } from './DashboardComponents';

interface DashboardViewProps {
    navigate: (path: string) => void;
    tasks: Task[];
    contents: ContentItem[];
    setSelectedTask: (t: Task) => void;
    setSelectedContent: (c: ContentItem) => void;
    currentUser?: { name: string; role: string } | null;
}

const activeCampaigns = campaigns.filter(c => c.status === 'active');

export function AdminDashboard({ navigate, setSelectedTask: _st, setSelectedContent: _sc }: DashboardViewProps) {
    return (
        <>
            <div className="stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className={`stat-card ${stat.color}`}>
                            <div className="stat-card-header">
                                <span className="stat-card-label">{stat.label}</span>
                                <div className={`stat-card-icon ${stat.color}`}><Icon size={20} /></div>
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
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="impressions" name="Impressionen" stroke="#6366f1" strokeWidth={2} fill="url(#gradientImpressions)" />
                                <Area type="monotone" dataKey="clicks" name="Klicks" stroke="#06b6d4" strokeWidth={2} fill="url(#gradientClicks)" />
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
                                    <Pie data={channelPerformance} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
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
                        <div key={campaign.id} style={{
                            padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                            marginBottom: '8px', cursor: 'pointer', transition: 'all var(--transition-fast)',
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
                            <div key={activity.id} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
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

            <BudgetOverview navigate={navigate} />
        </>
    );
}

export function ManagerDashboard({ navigate, tasks, contents, setSelectedTask, setSelectedContent }: DashboardViewProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Kampagnen & Aufgaben-Übersicht</div>
                        <div className="card-subtitle">Verfolgung des Content- und Aufgabenstatus für aktive Kampagnen.</div>
                    </div>
                </div>

                {activeCampaigns.map(camp => {
                    const campContents = contents.filter(c => c.campaignId === camp.id);
                    return (
                        <div key={camp.id} style={{
                            marginBottom: '24px', padding: '20px', border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
                        }}>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                                {camp.name}
                            </h3>
                            {campContents.length === 0 ? (
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>Kein Content zugeordnet.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                                    {campContents.map(cnt => {
                                        const cntTasks = tasks.filter(t => cnt.taskIds && cnt.taskIds.includes(t.id));
                                        return (
                                            <div key={cnt.id} style={{ background: 'var(--bg-hover)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                                                <h4
                                                    style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                                                    onClick={() => setSelectedContent(cnt)}
                                                >
                                                    {cnt.title}
                                                </h4>
                                                {cntTasks.length === 0 ? (
                                                    <div style={{ padding: '10px', borderLeft: '4px solid var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: '4px', fontSize: 'var(--font-size-xs)' }}>
                                                        Keine Aufgaben verknüpft! (Kritisch)
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {cntTasks.map(t => {
                                                            const { color, label } = getTaskColorLogic(t.dueDate);
                                                            return (
                                                                <div key={t.id} style={{ padding: '12px', borderLeft: `4px solid ${color}`, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }} onClick={() => setSelectedTask(t)}>{t.title}</span>
                                                                        <span style={{ fontSize: '10px', color: color, fontWeight: 700 }}>{label}</span>
                                                                    </div>
                                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                                        {t.assignee} | Fällig: {t.dueDate ? new Date(t.dueDate).toLocaleDateString('de-DE') : 'Kein Datum'}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <BudgetOverview navigate={navigate} />
        </div>
    );
}

export function MemberDashboard({ tasks, currentUser, setSelectedTask }: DashboardViewProps) {
    const myTasks = tasks.filter(t => t.assignee === currentUser?.name);
    const sortedTasks = [...myTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
        <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
                <div>
                    <div className="card-title">Meine zugewiesenen Aufgaben</div>
                    <div className="card-subtitle">Alle To-Dos priorisiert nach Fälligkeit</div>
                </div>
            </div>
            {sortedTasks.length === 0 ? (
                <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>Aktuell stehen keine Aufgaben an.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sortedTasks.map(task => {
                        const { color, bgColor, label } = getTaskColorLogic(task.dueDate);
                        return (
                            <div key={task.id} style={{
                                padding: '16px', borderLeft: `6px solid ${color}`, background: bgColor || 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                            }} onClick={() => setSelectedTask(task)}>
                                <div>
                                    <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>{task.title}</h4>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                        Fällig am: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : 'Kein Datum'}
                                        &nbsp;—&nbsp; Status: <span style={{ textTransform: 'uppercase', fontSize: '10px' }}>{task.status}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: color, background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '4px', border: `1px solid ${color}` }}>
                                        {label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

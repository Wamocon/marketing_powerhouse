import {
    Eye,
    MousePointerClick,
    Target,
    Wallet,
    ArrowUpRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Campaign } from '../types';

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString('de-DE');
}

export function computeDashboardStats(campaigns: Campaign[], totalBudgetSpent: number) {
    const totals = campaigns.reduce(
        (acc, c) => {
            if (c.kpis) {
                acc.impressions += c.kpis.impressions ?? 0;
                acc.clicks += c.kpis.clicks ?? 0;
                acc.conversions += c.kpis.conversions ?? 0;
            }
            return acc;
        },
        { impressions: 0, clicks: 0, conversions: 0 },
    );

    return [
        { label: 'Impressionen', value: formatNumber(totals.impressions), change: campaigns.length > 0 ? `${campaigns.filter(c => c.status === 'active').length} aktive` : '0', positive: true, icon: Eye, color: 'primary' },
        { label: 'Klicks', value: formatNumber(totals.clicks), change: totals.impressions > 0 ? `CTR ${(totals.clicks / totals.impressions * 100).toFixed(1)}%` : '—', positive: totals.clicks > 0, icon: MousePointerClick, color: 'accent' },
        { label: 'Conversions', value: formatNumber(totals.conversions), change: totals.clicks > 0 ? `CR ${(totals.conversions / totals.clicks * 100).toFixed(1)}%` : '—', positive: totals.conversions > 0, icon: Target, color: 'success' },
        { label: 'Ausgaben', value: `€${formatNumber(totalBudgetSpent)}`, change: `${campaigns.length} Kampagnen`, positive: false, icon: Wallet, color: 'warning' },
    ];
}

export const CustomTooltip = ({ active, payload, label }: any) => {
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
                {payload.map((entry: any, index: number) => (
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

export const getTaskColorLogic = (dueDateStr: string) => {
    if (!dueDateStr) return { color: 'var(--border-color)', bgColor: 'transparent', label: 'Kein Datum' };
    const due = new Date(dueDateStr);
    const today = new Date();

    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'var(--color-danger)', bgColor: 'var(--color-danger-bg)', label: 'Abgelaufen' };
    if (diffDays <= 1) return { color: 'var(--color-danger)', bgColor: 'var(--color-danger-bg)', label: 'Kritisch (Innerhalb 1 Tag)' };
    if (diffDays <= 3) return { color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)', label: 'Bald (Innerhalb 3 Tage)' };
    return { color: 'var(--color-success)', bgColor: 'var(--color-success-bg)', label: 'Im Plan' };
};

export function BudgetOverview({ navigate }: { navigate: (path: string) => void }) {
    const { budgetData } = useData();
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">Budget-Übersicht {new Date().getFullYear()}</div>
                    <div className="card-subtitle">
                        €{budgetData.spent.toLocaleString('de-DE')} von €{budgetData.total.toLocaleString('de-DE')} ausgegeben ({budgetData.total > 0 ? Math.round(budgetData.spent / budgetData.total * 100) : 0}%)
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/budget')}>
                    Details <ArrowUpRight size={14} />
                </button>
            </div>
            <div className="progress-bar" style={{ height: '10px', marginBottom: '20px' }}>
                <div className="progress-bar-fill primary" style={{ width: `${budgetData.total > 0 ? Math.round(budgetData.spent / budgetData.total * 100) : 0}%` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {budgetData.categories.slice(0, 5).map((cat) => (
                    <div key={cat.name} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{cat.name}</span>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                            €{cat.spent.toLocaleString('de-DE')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ €{cat.planned.toLocaleString('de-DE')}</span>
                        </div>
                        <div className="progress-bar" style={{ marginTop: '8px' }}>
                            <div className="progress-bar-fill primary" style={{ width: `${Math.round(cat.spent / cat.planned * 100)}%`, background: cat.color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

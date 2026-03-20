import {
    Eye,
    MousePointerClick,
    Target,
    Wallet,
    ArrowUpRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { BudgetData } from '../types/dashboard';
import type { ChartDataPoint } from '../types/dashboard';

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('de-DE', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

function formatPercentDelta(current: number, previous: number): { label: string; positive: boolean } {
    if (previous === 0) {
        if (current === 0) return { label: '0,0%', positive: true };
        return { label: '+100,0%', positive: true };
    }
    const delta = ((current - previous) / previous) * 100;
    const rounded = `${delta >= 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')}%`;
    return { label: rounded, positive: delta >= 0 };
}

export function buildDashboardStats(chartData: ChartDataPoint[], budgetData: BudgetData) {
    const totalImpressions = chartData.reduce((sum, point) => sum + point.impressions, 0);
    const totalClicks = chartData.reduce((sum, point) => sum + point.clicks, 0);
    const totalConversions = chartData.reduce((sum, point) => sum + point.conversions, 0);

    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const impressionsDelta = formatPercentDelta(latest?.impressions ?? 0, previous?.impressions ?? 0);
    const clicksDelta = formatPercentDelta(latest?.clicks ?? 0, previous?.clicks ?? 0);
    const conversionsDelta = formatPercentDelta(latest?.conversions ?? 0, previous?.conversions ?? 0);

    const trendLength = budgetData.monthlyTrend.length;
    const latestSpend = trendLength > 0 ? budgetData.monthlyTrend[trendLength - 1].actual : 0;
    const previousSpend = trendLength > 1 ? budgetData.monthlyTrend[trendLength - 2].actual : 0;
    const spendDelta = formatPercentDelta(latestSpend, previousSpend);

    return [
        { label: 'Impressionen', value: formatCompactNumber(totalImpressions), change: impressionsDelta.label, positive: impressionsDelta.positive, icon: Eye, color: 'primary' },
        { label: 'Klicks', value: formatCompactNumber(totalClicks), change: clicksDelta.label, positive: clicksDelta.positive, icon: MousePointerClick, color: 'accent' },
        { label: 'Conversions', value: formatCompactNumber(totalConversions), change: conversionsDelta.label, positive: conversionsDelta.positive, icon: Target, color: 'success' },
        { label: 'Ausgaben', value: `€${formatCompactNumber(budgetData.spent)}`, change: spendDelta.label, positive: !spendDelta.positive, icon: Wallet, color: 'warning' },
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
    const today = new Date('2026-03-10');

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
                    <div className="card-title">Budget-Übersicht Q1 2026</div>
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

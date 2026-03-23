import { useProjectRouter } from '../hooks/useProjectRouter';
import { BarChart3, TrendingUp, MousePointerClick, Eye, DollarSign, Target } from 'lucide-react';
import type { ElementType } from 'react';
import type { ChannelKpi, Touchpoint } from '../types';

interface ChannelKpiSectionProps {
    channelKpis: Record<string, ChannelKpi>;
    touchpoints: Touchpoint[];
    title?: string;
}

function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('de-DE');
}

function formatCurrency(n: number): string {
    if (n === 0) return '–';
    return '€' + n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ChannelKpiSection({ channelKpis, touchpoints, title = 'Performance nach Kanal' }: ChannelKpiSectionProps) {
    const router = useProjectRouter();

    const totalImpressions = Object.values(channelKpis).reduce((s, k) => s + k.impressions, 0);

    return (
        <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
                {title}
            </h3>

            <div style={{ display: 'grid', gap: '12px' }}>
                {Object.entries(channelKpis).map(([tpId, kpi]) => {
                    const tp = touchpoints.find(t => t.id === tpId);
                    if (!tp) return null;
                    const sharePercent = totalImpressions > 0 ? Math.round(kpi.impressions / totalImpressions * 100) : 0;
                    const phases = tp.journeyPhases?.length ? tp.journeyPhases : (tp.journeyPhase ? [tp.journeyPhase] : []);

                    return (
                        <div
                            key={tpId}
                            className="card"
                            onClick={() => router.push(`/touchpoints?selectedTpId=${tpId}`)}
                            style={{ padding: '16px', cursor: 'pointer', borderLeft: '3px solid var(--color-primary)', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{tp.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                        {tp.type} · {phases.join(', ') || 'Nicht verknüpft'}
                                    </div>
                                </div>
                                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{sharePercent}% Anteil</span>
                            </div>

                            {/* Impression share bar */}
                            <div style={{ height: '4px', background: 'var(--bg-active)', borderRadius: '2px', marginBottom: '12px' }}>
                                <div style={{ height: '100%', width: `${sharePercent}%`, background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                                <KpiMiniCard icon={Eye} label="Impressions" value={formatNumber(kpi.impressions)} />
                                <KpiMiniCard icon={MousePointerClick} label="Clicks" value={formatNumber(kpi.clicks)} />
                                <KpiMiniCard icon={Target} label="Conversions" value={formatNumber(kpi.conversions)} />
                                <KpiMiniCard icon={TrendingUp} label="CTR" value={kpi.ctr.toFixed(2) + '%'} />
                                {kpi.spend > 0 && <KpiMiniCard icon={DollarSign} label="Spend" value={formatCurrency(kpi.spend)} />}
                                {kpi.cpc > 0 && <KpiMiniCard icon={DollarSign} label="CPC" value={formatCurrency(kpi.cpc)} />}
                                {kpi.cpa > 0 && <KpiMiniCard icon={DollarSign} label="CPA" value={formatCurrency(kpi.cpa)} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function KpiMiniCard({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
    return (
        <div style={{ padding: '8px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '2px' }}>
                <Icon size={10} /> {label}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{value}</div>
        </div>
    );
}

// Reusable KPI summary row for touchpoint cards
export function TouchpointKpiSummary({ kpis }: { kpis: { impressions: number; clicks: number; conversions: number; ctr: number; spend: number } }) {
    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Eye size={10} /> {formatNumber(kpis.impressions)}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MousePointerClick size={10} /> {formatNumber(kpis.clicks)}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <TrendingUp size={10} /> {kpis.ctr.toFixed(1)}%
            </span>
            {kpis.spend > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <DollarSign size={10} /> {formatCurrency(kpis.spend)}
                </span>
            )}
        </div>
    );
}

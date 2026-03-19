import type { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    variant?: 'primary' | 'success' | 'warning' | 'info' | 'accent';
}

export default function StatCard({
    label, value, icon, change, changeType = 'neutral', variant = 'primary',
}: StatCardProps) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
                {icon && (
                    <div className={`stat-card-icon ${variant}`}>{icon}</div>
                )}
            </div>
            <div className="stat-card-value">{value}</div>
            {change && (
                <div className={`stat-card-change ${changeType}`}>{change}</div>
            )}
        </div>
    );
}

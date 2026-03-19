interface StatusBadgeProps {
    label: string;
    color?: string;
    bgColor?: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export default function StatusBadge({ label, color, bgColor, variant }: StatusBadgeProps) {
    if (color && bgColor) {
        return (
            <span className="badge" style={{ color, background: bgColor }}>
                {label}
            </span>
        );
    }
    return <span className={`badge badge-${variant ?? 'primary'}`}>{label}</span>;
}

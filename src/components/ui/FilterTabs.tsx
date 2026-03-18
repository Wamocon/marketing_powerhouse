interface FilterTab {
    key: string;
    label: string;
    count?: number;
}

interface FilterTabsProps {
    tabs: FilterTab[];
    activeTab: string;
    onTabChange: (key: string) => void;
}

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
    return (
        <div className="tabs">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`tab${activeTab === tab.key ? ' active' : ''}`}
                    onClick={() => onTabChange(tab.key)}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span style={{
                            marginLeft: '6px',
                            fontSize: 'var(--font-size-xs)',
                            opacity: 0.6,
                        }}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

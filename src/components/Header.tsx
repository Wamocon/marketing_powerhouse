import { usePathname } from 'next/navigation';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import type { Role } from '../types';

const routeTitles: Record<string, { breadcrumb: string; title: string }> = {
    '/': { breadcrumb: 'Dashboard', title: 'Übersicht' },
    '/campaigns': { breadcrumb: 'Kampagnen', title: 'Kampagnen-Management' },
    '/audiences': { breadcrumb: 'Zielgruppen', title: 'Zielgruppen & Personas' },
    '/content': { breadcrumb: 'Content-Kalender', title: 'Redaktionsplanung' },
    '/budget': { breadcrumb: 'Budget', title: 'Budget & Controlling' },
    '/tasks': { breadcrumb: 'Aufgaben', title: 'Aufgabenverwaltung' },
    '/positioning': { breadcrumb: 'Positionierung', title: 'Digitale Positionierung' },
    '/settings': { breadcrumb: 'Einstellungen', title: 'Workspace-Einstellungen' },
};

export default function Header() {
    const pathname = usePathname();
    const { currentUser } = useAuth();
    const currentRoute = routeTitles[pathname] || { breadcrumb: 'Seite', title: '' };
    const isCampaignDetail = pathname.startsWith('/campaigns/') && pathname !== '/campaigns';
    const roleConfig = currentUser ? ROLE_CONFIG[currentUser.role as Role] : null;

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-breadcrumb">
                    <span>Momentum</span>
                    <span className="header-breadcrumb-separator">/</span>
                    {isCampaignDetail ? (
                        <>
                            <span>Kampagnen</span>
                            <span className="header-breadcrumb-separator">/</span>
                            <span className="header-breadcrumb-current">Detail</span>
                        </>
                    ) : (
                        <span className="header-breadcrumb-current">{currentRoute.breadcrumb}</span>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-search">
                    <Search size={16} />
                    <span>Suche…</span>
                    <span className="header-search-shortcut">⌘K</span>
                </div>

                {/* Rollen-Badge */}
                {roleConfig && currentUser && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                        background: roleConfig.bgColor, border: `1px solid ${roleConfig.color}30`,
                    }}>
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: roleConfig.color + '20', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 700, color: roleConfig.color,
                        }}>
                            {currentUser.avatar}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
                                {currentUser.name.split(' ')[0]}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: roleConfig.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {roleConfig.shortLabel}
                            </div>
                        </div>
                    </div>
                )}

                <button className="header-icon-btn" title="Benachrichtigungen">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <button className="header-icon-btn" title="Hilfe">
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>
    );
}

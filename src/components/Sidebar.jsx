import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Megaphone, Calendar, Wallet,
    CheckSquare, Settings, LogOut, Users2, BarChart3,
    Building2, Target, Tag, ShieldAlert, FileText, HelpCircle, Map, Radio
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';

// Navigation-Struktur mit Rollenfilter
// requiredPermission: wenn gesetzt, wird der Eintrag verborgen falls die Berechtigung fehlt
const NAV = [
    {
        section: 'Übersicht',
        items: [
            { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        section: 'Marketing',
        items: [
            { path: '/campaigns', icon: Megaphone, label: 'Kampagnen', badge: '4', requiredPermission: null },
            { path: '/audiences', icon: Users2, label: 'Zielgruppen', badge: '3' },
            { path: '/journeys', icon: Map, label: 'Customer Journey', badge: '1' },
            { path: '/touchpoints', icon: Radio, label: 'Kanäle & Touchpoints', badge: '6' },
            { path: '/content-overview', icon: FileText, label: 'Content-Übersicht' },
            { path: '/content', icon: Calendar, label: 'Content-Kalender' },
            { path: '/budget', icon: Wallet, label: 'Budget & Controlling', requiredPermission: 'canSeeBudget' },
        ],
    },
    {
        section: 'Team',
        items: [
            { path: '/tasks', icon: CheckSquare, label: 'Aufgaben' },
            { path: '/analytics', icon: BarChart3, label: 'Berichte', comingSoon: true },
        ],
    },
    {
        section: 'Unternehmen',
        items: [
            { path: '/positioning', icon: Target, label: 'Digitale Positionierung' },
        ],
    },
    {
        section: 'System',
        items: [
            { path: '/manual', icon: HelpCircle, label: 'Anleitung' },
            { path: '/settings', icon: Settings, label: 'Einstellungen', requiredPermission: 'canManageSettings' },
        ],
    },
];

export default function Sidebar({ onLogout }) {
    const { currentUser, can } = useAuth();
    const roleConfig = currentUser ? ROLE_CONFIG[currentUser.role] : null;

    // Filtert Einträge nach Rolle
    const getVisibleItems = (items) =>
        items.filter(item => {
            if (!item.requiredPermission) return true;
            return can(item.requiredPermission);
        });

    return (
        <aside className="sidebar">
            {/* Logo — The Nexus */}
            <div className="sidebar-header">
                <div className="sidebar-logo" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    fontFamily: 'monospace',
                    letterSpacing: '-2px',
                }}>●</div>
                <div>
                    <div className="sidebar-brand-name">Momentum</div>
                    <div className="sidebar-brand-sub">Marketing OS</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {NAV.map(({ section, items }) => {
                    const visible = getVisibleItems(items);
                    if (visible.length === 0) return null;
                    return (
                        <div key={section} className="sidebar-section">
                            <div className="sidebar-section-label">{section}</div>
                            {visible.map(item => {
                                const Icon = item.icon;
                                if (item.comingSoon) {
                                    return (
                                        <div key={item.path} className="sidebar-link" style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}>
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                            <span style={{
                                                marginLeft: 'auto', fontSize: '0.6rem', padding: '1px 5px',
                                                borderRadius: 'var(--radius-full)', background: 'var(--bg-hover)',
                                                color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase',
                                            }}>bald</span>
                                        </div>
                                    );
                                }
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span style={{
                                                marginLeft: 'auto', fontSize: 'var(--font-size-xs)',
                                                background: 'var(--bg-hover)', padding: '1px 7px',
                                                borderRadius: 'var(--radius-full)', color: 'var(--text-tertiary)',
                                                fontWeight: 600,
                                            }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* User-Footer */}
            <div className="sidebar-footer">
                {currentUser && roleConfig && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: 'var(--radius-md)',
                        background: roleConfig.bgColor, marginBottom: '8px',
                        border: `1px solid ${roleConfig.color}20`,
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            background: roleConfig.color, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'white',
                        }}>
                            {currentUser.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentUser.name}
                            </div>
                            <div style={{
                                fontSize: '0.6rem', color: roleConfig.color, fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.07em',
                            }}>
                                {roleConfig.shortLabel}
                            </div>
                        </div>
                    </div>
                )}
                <button className="sidebar-link" style={{ color: 'var(--color-danger)', width: '100%' }} onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Abmelden</span>
                </button>
            </div>
        </aside>
    );
}

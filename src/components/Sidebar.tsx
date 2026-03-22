import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Megaphone, Calendar, Wallet,
    CheckSquare, Settings, LogOut, Users2, BarChart3,
    Target, FileText, HelpCircle, Map, Radio,
    Building2, Shield, ArrowLeftRight, Compass,
    type LucideIcon,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import { useTasks } from '../context/TaskContext';
import { useContents } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';
import type { PermissionKey, CompanyRole } from '../types';

type BadgeKey = 'campaigns' | 'audiences' | 'journeys' | 'touchpoints' | 'tasks' | 'contents';

interface NavItem {
    path: string;
    icon: LucideIcon;
    label: { de: string; en: string };
    badge?: string | number;
    badgeKey?: BadgeKey;
    requiredPermission?: PermissionKey | null;
    comingSoon?: boolean;
}

interface NavSection {
    section: { de: string; en: string };
    items: NavItem[];
}

const NAV: NavSection[] = [
    {
        section: { de: 'Uebersicht', en: 'Overview' },
        items: [
            { path: '/', icon: LayoutDashboard, label: { de: 'Dashboard', en: 'Dashboard' } },
        ],
    },
    {
        section: { de: 'Marketing', en: 'Marketing' },
        items: [
            { path: '/campaigns', icon: Megaphone, label: { de: 'Kampagnen', en: 'Campaigns' }, badgeKey: 'campaigns' as const, requiredPermission: null },
            { path: '/audiences', icon: Users2, label: { de: 'Zielgruppen', en: 'Audiences' }, badgeKey: 'audiences' as const },
            { path: '/journeys', icon: Map, label: { de: 'Customer Journey', en: 'Customer journey' }, badgeKey: 'journeys' as const },
            { path: '/touchpoints', icon: Radio, label: { de: 'Kanaele & Touchpoints', en: 'Channels & touchpoints' }, badgeKey: 'touchpoints' as const },
            { path: '/content-overview', icon: FileText, label: { de: 'Content-Uebersicht', en: 'Content overview' }, badgeKey: 'contents' as const },
            { path: '/content', icon: Calendar, label: { de: 'Content-Kalender', en: 'Content calendar' } },
            { path: '/budget', icon: Wallet, label: { de: 'Budget & Controlling', en: 'Budget & controlling' }, requiredPermission: 'canSeeBudget' },
        ],
    },
    {
        section: { de: 'Team', en: 'Team' },
        items: [
            { path: '/tasks', icon: CheckSquare, label: { de: 'Aufgaben', en: 'Tasks' }, badgeKey: 'tasks' as const },
            { path: '/analytics', icon: BarChart3, label: { de: 'Berichte', en: 'Reports' }, comingSoon: true },
        ],
    },
    {
        section: { de: 'Unternehmen', en: 'Company' },
        items: [
            { path: '/positioning', icon: Target, label: { de: 'Digitale Positionierung', en: 'Digital positioning' } },
        ],
    },
    {
        section: { de: 'System', en: 'System' },
        items: [
            { path: '/setup', icon: Compass, label: { de: 'Projekt-Setup', en: 'Project setup' } },
            { path: '/manual', icon: HelpCircle, label: { de: 'Anleitung', en: 'Manual' } },
            { path: '/settings', icon: Settings, label: { de: 'Einstellungen', en: 'Settings' } },
        ],
    },
];

interface SidebarProps {
    onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
    const { currentUser, can, isSuperAdmin, activeCompanyRole } = useAuth();
    const { activeCompany, deselectCompany } = useCompany();
    const { campaigns, audiences, touchpoints, customerJourneys } = useData();
    const { tasks } = useTasks();
    const { contents } = useContents();
    const { language } = useLanguage();
    const pathname = usePathname();

    const badgeCounts: Record<BadgeKey, number> = {
        campaigns: campaigns.length,
        audiences: audiences.length,
        journeys: customerJourneys.length,
        touchpoints: touchpoints.length,
        tasks: tasks.length,
        contents: contents.length,
    };
    const roleConfig = activeCompanyRole ? ROLE_CONFIG[activeCompanyRole as CompanyRole] : null;

    const isActivePath = (itemPath: string) => {
        if (itemPath === '/') return pathname === '/';
        return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
    };

    // Filtert Einträge nach Rolle
    const getVisibleItems = (items: NavItem[]) =>
        items.filter(item => {
            if (!item.requiredPermission) return true;
            return can(item.requiredPermission);
        });

    return (
        <aside className="sidebar">
            {/* Company Header */}
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

            {/* Active Company Indicator */}
            {activeCompany && (
                <div style={{
                    margin: '0 12px 8px', padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Building2 size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <span style={{
                            fontSize: 'var(--font-size-xs)', fontWeight: 700,
                            color: 'var(--text-primary)', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {activeCompany.name}
                        </span>
                    </div>
                    <button
                        onClick={deselectCompany}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.6rem', color: 'var(--text-tertiary)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, fontWeight: 600,
                        }}
                    >
                        <ArrowLeftRight size={10} /> {language === 'en' ? 'Switch company' : 'Unternehmen wechseln'}
                    </button>
                </div>
            )}

            {/* Super-Admin Link */}
            {isSuperAdmin && (
                <div style={{ margin: '0 12px 8px' }}>
                    <Link
                        href="/admin"
                        className="sidebar-link"
                        style={{
                            background: 'rgba(245, 158, 11, 0.08)',
                            borderLeft: '2px solid #f59e0b',
                            color: '#f59e0b',
                        }}
                    >
                        <Shield size={16} />
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Super-Admin Panel</span>
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="sidebar-nav">
                {NAV.map(({ section, items }) => {
                    const visible = getVisibleItems(items);
                    if (visible.length === 0) return null;
                    return (
                        <div key={section.de} className="sidebar-section">
                            <div className="sidebar-section-label">{section[language]}</div>
                            {visible.map(item => {
                                const Icon = item.icon;
                                if (item.comingSoon) {
                                    return (
                                        <div key={item.path} className="sidebar-link" style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}>
                                            <Icon size={18} />
                                            <span>{item.label[language]}</span>
                                            <span style={{
                                                marginLeft: 'auto', fontSize: '0.6rem', padding: '1px 5px',
                                                borderRadius: 'var(--radius-full)', background: 'var(--bg-hover)',
                                                color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase',
                                            }}>{language === 'en' ? 'soon' : 'bald'}</span>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`sidebar-link${isActivePath(item.path) ? ' active' : ''}`}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label[language]}</span>
                                        {(item.badge !== undefined || item.badgeKey !== undefined) && (
                                            <span style={{
                                                marginLeft: 'auto', fontSize: 'var(--font-size-xs)',
                                                background: 'var(--bg-hover)', padding: '1px 7px',
                                                borderRadius: 'var(--radius-full)', color: 'var(--text-tertiary)',
                                                fontWeight: 600,
                                            }}>
                                                {item.badgeKey ? badgeCounts[item.badgeKey] : item.badge}
                                            </span>
                                        )}
                                    </Link>
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
                    <span>{language === 'en' ? 'Log out' : 'Abmelden'}</span>
                </button>
            </div>
        </aside>
    );
}

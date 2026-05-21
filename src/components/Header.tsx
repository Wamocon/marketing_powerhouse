import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, ChevronRight, ArrowUpCircle, Moon, Sun } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { useCompany } from '../context/CompanyContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTheme } from '../context/ThemeContext';
import { useProjectRouter } from '../hooks/useProjectRouter';

const sectionTitles: Record<string, { de: string; en: string; tr: string }> = {
    'campaigns': { de: 'Kampagnen', en: 'Campaigns', tr: 'Kampanyalar' },
    'audiences': { de: 'Zielgruppen', en: 'Audiences', tr: 'Hedef Kitleler' },
    'journeys': { de: 'Journey', en: 'Journey', tr: 'Yolculuk' },
    'touchpoints': { de: 'Touchpoints', en: 'Touchpoints', tr: 'Temas Noktaları' },
    'content': { de: 'Content-Kalender', en: 'Content calendar', tr: 'İçerik Takvimi' },
    'content-overview': { de: 'Content-Übersicht', en: 'Content overview', tr: 'İçerik Genel Bakış' },
    'budget': { de: 'Budget', en: 'Budget', tr: 'Bütçe' },
    'tasks': { de: 'Aufgaben', en: 'Tasks', tr: 'Görevler' },
    'positioning': { de: 'Positionierung', en: 'Positioning', tr: 'Konumlandırma' },
    'setup': { de: 'Projekt-Setup', en: 'Project setup', tr: 'Proje Kurulumu' },
    'settings': { de: 'Einstellungen', en: 'Settings', tr: 'Ayarlar' },
    'manual': { de: 'Anleitung', en: 'Manual', tr: 'Kılavuz' },
};

export default function Header() {
    const pathname = usePathname();
    const router = useProjectRouter();
    const { language, setLanguage, t } = useLanguage();
    const { activeCompany } = useCompany();
    const { needsUpgrade, currentPlan, loading: subLoading } = useSubscription();
    const { theme, toggleTheme } = useTheme();

    // Parse breadcrumb segments from /project/[id]/section/[detailId]
    const projectBase = activeCompany ? `/project/${activeCompany.id}` : '/';
    const pathAfterProject = pathname.startsWith('/project/')
        ? pathname.replace(/^\/project\/[^/]+/, '')
        : pathname;
    const segments = pathAfterProject.split('/').filter(Boolean);
    // segments e.g. [] for dashboard, ['campaigns'] for list, ['campaigns', 'abc'] for detail

    const section = segments[0] || null;
    const hasDetail = segments.length > 1;
    const sectionTitle = section ? (sectionTitles[section]?.[language] ?? section) : null;

    return (
        <header className="header">
            <div className="header-left">
                <nav className="header-breadcrumb" aria-label="Breadcrumb">
                    {/* Level 1: Project name */}
                    {activeCompany && (
                        <>
                            {section ? (
                                <Link href={projectBase} className="header-breadcrumb-link">
                                    {activeCompany.name}
                                </Link>
                            ) : (
                                <span className="header-breadcrumb-current">{activeCompany.name}</span>
                            )}
                        </>
                    )}

                    {/* Level 2: Section (Kampagnen, Aufgaben, etc.) */}
                    {sectionTitle && (
                        <>
                            <ChevronRight size={14} className="header-breadcrumb-separator" />
                            {hasDetail ? (
                                <Link href={`${projectBase}/${section}`} className="header-breadcrumb-link">
                                    {sectionTitle}
                                </Link>
                            ) : (
                                <span className="header-breadcrumb-current">{sectionTitle}</span>
                            )}
                        </>
                    )}

                    {/* Level 3: Detail */}
                    {hasDetail && (
                        <>
                            <ChevronRight size={14} className="header-breadcrumb-separator" />
                            <span className="header-breadcrumb-current">Detail</span>
                        </>
                    )}
                </nav>
            </div>

            <div className="header-right">
                {/* Upgrade prompt for Starter plan users */}
                {!subLoading && needsUpgrade && activeCompany && (
                    <button
                        className="btn btn-sm"
                        onClick={() => router.push('/settings?tab=subscription')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            color: 'white', border: 'none',
                            fontSize: 'var(--font-size-xs)', fontWeight: 600,
                            padding: '5px 14px', borderRadius: 'var(--radius-full)',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            animation: 'subtle-pulse 3s ease-in-out infinite',
                        }}
                    >
                        <ArrowUpCircle size={14} />
                        {t({ de: 'Upgraden', en: 'Upgrade', tr: 'Yükselt' })}
                        {currentPlan && (
                            <span style={{ opacity: 0.8, fontSize: '0.6rem' }}>
                                ({currentPlan.name})
                            </span>
                        )}
                    </button>
                )}

                <button
                    className="header-icon-btn"
                    onClick={toggleTheme}
                    title={theme === 'dark'
                        ? t({ de: 'Zum hellen Modus wechseln', en: 'Switch to light mode', tr: 'Açık moda geç' })
                        : t({ de: 'Zum dunklen Modus wechseln', en: 'Switch to dark mode', tr: 'Koyu moda geç' })
                    }
                    aria-label={t({ de: theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus', en: theme === 'dark' ? 'Light mode' : 'Dark mode', tr: theme === 'dark' ? 'Açık mod' : 'Koyu mod' })}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    style={{ width: '92px', minWidth: '92px', height: '34px', padding: '0 8px', fontSize: 'var(--font-size-xs)' }}
                    aria-label={t({ de: 'Sprache auswählen', en: 'Select language', tr: 'Dil seçin' })}
                >
                    <option value="de">DE</option>
                    <option value="en">EN</option>
                    <option value="tr">TR</option>
                </select>

                <NotificationBell />

                <button className="header-icon-btn" title={t({ de: 'Zur Anleitung', en: 'Open manual', tr: 'Kılavuzu aç' })} onClick={() => router.push('/manual')}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>
    );
}

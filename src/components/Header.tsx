import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, ChevronRight } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { useCompany } from '../context/CompanyContext';
import { useCompanyRouter } from '../hooks/useCompanyRouter';

const sectionTitles: Record<string, { de: string; en: string }> = {
    'campaigns': { de: 'Kampagnen', en: 'Campaigns' },
    'audiences': { de: 'Zielgruppen', en: 'Audiences' },
    'journeys': { de: 'Journey', en: 'Journey' },
    'touchpoints': { de: 'Touchpoints', en: 'Touchpoints' },
    'content': { de: 'Content-Kalender', en: 'Content calendar' },
    'content-overview': { de: 'Content-Uebersicht', en: 'Content overview' },
    'budget': { de: 'Budget', en: 'Budget' },
    'tasks': { de: 'Aufgaben', en: 'Tasks' },
    'positioning': { de: 'Positionierung', en: 'Positioning' },
    'setup': { de: 'Projekt-Setup', en: 'Project setup' },
    'settings': { de: 'Einstellungen', en: 'Settings' },
    'manual': { de: 'Anleitung', en: 'Manual' },
};

export default function Header() {
    const pathname = usePathname();
    const router = useCompanyRouter();
    const { language, setLanguage } = useLanguage();
    const { activeCompany } = useCompany();

    // Parse breadcrumb segments from /company/[id]/section/[detailId]
    const companyBase = activeCompany ? `/company/${activeCompany.id}` : '/';
    const pathAfterCompany = pathname.startsWith('/company/')
        ? pathname.replace(/^\/company\/[^/]+/, '')
        : pathname;
    const segments = pathAfterCompany.split('/').filter(Boolean);
    // segments e.g. [] for dashboard, ['campaigns'] for list, ['campaigns', 'abc'] for detail

    const section = segments[0] || null;
    const hasDetail = segments.length > 1;
    const sectionTitle = section ? (sectionTitles[section]?.[language] ?? section) : null;

    return (
        <header className="header">
            <div className="header-left">
                <nav className="header-breadcrumb" aria-label="Breadcrumb">
                    {/* Level 1: Unternehmensübersicht */}
                    <Link href="/" className="header-breadcrumb-link">
                        {language === 'en' ? 'Company overview' : 'Unternehmensübersicht'}
                    </Link>

                    {/* Level 2: Company name (= Dashboard) */}
                    {activeCompany && (
                        <>
                            <ChevronRight size={14} className="header-breadcrumb-separator" />
                            {section ? (
                                <Link href={companyBase} className="header-breadcrumb-link">
                                    {activeCompany.name}
                                </Link>
                            ) : (
                                <span className="header-breadcrumb-current">{activeCompany.name}</span>
                            )}
                        </>
                    )}

                    {/* Level 3: Section (Kampagnen, Aufgaben, etc.) */}
                    {sectionTitle && (
                        <>
                            <ChevronRight size={14} className="header-breadcrumb-separator" />
                            {hasDetail ? (
                                <Link href={`${companyBase}/${section}`} className="header-breadcrumb-link">
                                    {sectionTitle}
                                </Link>
                            ) : (
                                <span className="header-breadcrumb-current">{sectionTitle}</span>
                            )}
                        </>
                    )}

                    {/* Level 4: Detail */}
                    {hasDetail && (
                        <>
                            <ChevronRight size={14} className="header-breadcrumb-separator" />
                            <span className="header-breadcrumb-current">Detail</span>
                        </>
                    )}
                </nav>
            </div>

            <div className="header-right">
                <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    style={{ width: '92px', minWidth: '92px', height: '34px', padding: '0 8px', fontSize: 'var(--font-size-xs)' }}
                    aria-label={language === 'en' ? 'Select language' : 'Sprache auswaehlen'}
                >
                    <option value="de">DE</option>
                    <option value="en">EN</option>
                </select>

                <NotificationBell />

                <button className="header-icon-btn" title={language === 'en' ? 'Open manual' : 'Zur Anleitung'} onClick={() => router.push('/manual')}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>
    );
}

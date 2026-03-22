import { usePathname, useRouter } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';

const routeTitles: Record<string, { breadcrumb: { de: string; en: string }; title: { de: string; en: string } }> = {
    '/': { breadcrumb: { de: 'Dashboard', en: 'Dashboard' }, title: { de: 'Uebersicht', en: 'Overview' } },
    '/campaigns': { breadcrumb: { de: 'Kampagnen', en: 'Campaigns' }, title: { de: 'Kampagnen-Management', en: 'Campaign management' } },
    '/audiences': { breadcrumb: { de: 'Zielgruppen', en: 'Audiences' }, title: { de: 'Zielgruppen & Personas', en: 'Audiences & personas' } },
    '/journeys': { breadcrumb: { de: 'Journey', en: 'Journey' }, title: { de: 'Customer Journey Map', en: 'Customer journey map' } },
    '/touchpoints': { breadcrumb: { de: 'Touchpoints', en: 'Touchpoints' }, title: { de: 'Kanaele & Touchpoints', en: 'Channels & touchpoints' } },
    '/content': { breadcrumb: { de: 'Content-Kalender', en: 'Content calendar' }, title: { de: 'Redaktionsplanung', en: 'Editorial planning' } },
    '/budget': { breadcrumb: { de: 'Budget', en: 'Budget' }, title: { de: 'Budget & Controlling', en: 'Budget & controlling' } },
    '/tasks': { breadcrumb: { de: 'Aufgaben', en: 'Tasks' }, title: { de: 'Aufgabenverwaltung', en: 'Task management' } },
    '/positioning': { breadcrumb: { de: 'Positionierung', en: 'Positioning' }, title: { de: 'Digitale Positionierung', en: 'Digital positioning' } },
    '/setup': { breadcrumb: { de: 'Projekt-Setup', en: 'Project setup' }, title: { de: 'Gefuehrtes Projekt-Setup', en: 'Guided project setup' } },
    '/settings': { breadcrumb: { de: 'Einstellungen', en: 'Settings' }, title: { de: 'Workspace-Einstellungen', en: 'Workspace settings' } },
};

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { language, setLanguage } = useLanguage();
    const currentRoute = routeTitles[pathname] || {
        breadcrumb: { de: 'Seite', en: 'Page' },
        title: { de: '', en: '' },
    };
    const isCampaignDetail = pathname.startsWith('/campaigns/') && pathname !== '/campaigns';

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-breadcrumb">
                    <span>Momentum</span>
                    <span className="header-breadcrumb-separator">/</span>
                    {isCampaignDetail ? (
                        <>
                            <span>{language === 'en' ? 'Campaigns' : 'Kampagnen'}</span>
                            <span className="header-breadcrumb-separator">/</span>
                            <span className="header-breadcrumb-current">{language === 'en' ? 'Detail' : 'Detail'}</span>
                        </>
                    ) : (
                        <span className="header-breadcrumb-current">{currentRoute.breadcrumb[language]}</span>
                    )}
                </div>
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

import { usePathname, useRouter } from 'next/navigation';
import { Bell, HelpCircle } from 'lucide-react';

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
    const router = useRouter();
    const currentRoute = routeTitles[pathname] || { breadcrumb: 'Seite', title: '' };
    const isCampaignDetail = pathname.startsWith('/campaigns/') && pathname !== '/campaigns';

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
                <button className="header-icon-btn" title="Benachrichtigungen">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <button className="header-icon-btn" title="Zur Anleitung" onClick={() => router.push('/manual')}>
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>
    );
}

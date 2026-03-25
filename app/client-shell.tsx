'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import Layout from '@/components/Layout';
import LoginPage from '@/views/LoginPage';
import { usePathname, useRouter } from 'next/navigation';

/** Extract projectId from /project/[projectId]/... paths */
function extractProjectId(pathname: string): string | null {
    const match = pathname.match(/^\/project\/([^/]+)/);
    return match ? match[1] : null;
}

export default function ClientShell({ children }: { children: ReactNode }) {
    const { currentUser, sessionLoading, login, logout } = useAuth();
    const { activeCompany, userCompanies, selectCompany, loading: companyLoading } = useCompany();
    const pathname = usePathname();
    const router = useRouter();
    const isPublicLegalRoute = pathname === '/impressum' || pathname === '/datenschutz' || pathname === '/agb';
    const isProjectRoute = pathname.startsWith('/project/');
    const isLegacyCompanyRoute = pathname.startsWith('/company/');
    const isHomeRoute = pathname === '/';
    const isAdminRoute = pathname === '/admin';
    const urlProjectId = extractProjectId(pathname);

    // Sync project context with URL
    const syncRef = useRef(false);
    const syncAttemptedRef = useRef<string | null>(null);
    const companyListReady = companyLoading || !currentUser ? false : userCompanies.length > 0;

    useEffect(() => {
        if (!currentUser || companyLoading || !companyListReady || !urlProjectId) return;
        if (activeCompany?.id !== urlProjectId && !syncRef.current) {
            syncRef.current = true;
            syncAttemptedRef.current = urlProjectId;
            selectCompany(urlProjectId).finally(() => { syncRef.current = false; });
        }
    }, [currentUser, urlProjectId, activeCompany?.id, companyLoading, companyListReady, selectCompany]);

    // If sync was attempted but company didn't change → invalid company, redirect to home
    const syncFailed = isProjectRoute && !companyLoading && !syncRef.current
        && companyListReady
        && urlProjectId !== null && activeCompany?.id !== urlProjectId
        && syncAttemptedRef.current === urlProjectId;
    useEffect(() => {
        if (syncFailed) router.replace('/');
    }, [syncFailed, router]);

    // Redirect old flat routes (e.g. /campaigns) to company-scoped equivalents
    const isOldFlatRoute = !isProjectRoute && !isLegacyCompanyRoute && !isHomeRoute && !isAdminRoute && !isPublicLegalRoute;
    useEffect(() => {
        if (!currentUser || sessionLoading || companyLoading) return;
        if (isOldFlatRoute && activeCompany) {
            router.replace(`/project/${activeCompany.id}${pathname}`);
        }
    }, [isOldFlatRoute, activeCompany, pathname, router, currentUser, sessionLoading, companyLoading]);

    // Legacy /company routes redirect to /project
    useEffect(() => {
        if (!isLegacyCompanyRoute) return;
        router.replace(pathname.replace('/company/', '/project/'));
    }, [isLegacyCompanyRoute, pathname, router]);

    const shouldRedirectMissingProject = isProjectRoute
        && !sessionLoading
        && !companyLoading
        && companyListReady
        && !syncRef.current
        && !activeCompany;

    useEffect(() => {
        if (shouldRedirectMissingProject) {
            router.replace('/');
        }
    }, [shouldRedirectMissingProject, router]);

    if (sessionLoading) {
        return (
            <div suppressHydrationWarning style={{
                display: 'flex', height: '100vh', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)',
                flexDirection: 'column', gap: '16px',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'white', fontWeight: 700,
                }}>M</div>
                <div style={{
                    width: 32, height: 32, border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (isPublicLegalRoute) {
        return <>{children}</>;
    }

    if (!currentUser) {
        return <LoginPage onLogin={login} />;
    }

    // Super-Admin panel is independent of company selection
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // Home page: always show company overview (rendered by app/page.tsx)
    if (isHomeRoute) {
        return <>{children}</>;
    }

    if (isLegacyCompanyRoute) {
        return null;
    }

    // Redirect old flat routes — show spinner while redirect effect fires
    if (isOldFlatRoute) {
        return (
            <div suppressHydrationWarning style={{
                display: 'flex', height: '100vh', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)',
                flexDirection: 'column', gap: '16px',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'white', fontWeight: 700,
                }}>M</div>
                <div style={{
                    width: 32, height: 32, border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Show company loading spinner (includes sync in progress)
    if (companyLoading || (isProjectRoute && syncRef.current)) {
        return (
            <div suppressHydrationWarning style={{
                display: 'flex', height: '100vh', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-base)',
                flexDirection: 'column', gap: '16px',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'white', fontWeight: 700,
                }}>M</div>
                <div style={{
                    width: 32, height: 32, border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!activeCompany) {
        return null;
    }

    // Company selected → render the app
    return (
        <Layout onLogout={logout}>
            {children}
        </Layout>
    );
}

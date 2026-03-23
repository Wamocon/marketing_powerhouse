'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import Layout from '@/components/Layout';
import LoginPage from '@/views/LoginPage';
import { usePathname, useRouter } from 'next/navigation';

/** Extract companyId from /company/[companyId]/… paths */
function extractCompanyId(pathname: string): string | null {
    const match = pathname.match(/^\/company\/([^/]+)/);
    return match ? match[1] : null;
}

export default function ClientShell({ children }: { children: ReactNode }) {
    const { currentUser, sessionLoading, login, logout } = useAuth();
    const { activeCompany, selectCompany, loading: companyLoading } = useCompany();
    const pathname = usePathname();
    const router = useRouter();
    const isPublicLegalRoute = pathname === '/impressum' || pathname === '/datenschutz' || pathname === '/agb';
    const isCompanyRoute = pathname.startsWith('/company/');
    const isHomeRoute = pathname === '/';
    const isAdminRoute = pathname === '/admin';
    const urlCompanyId = extractCompanyId(pathname);

    // Sync company context with URL
    const syncRef = useRef(false);
    const syncAttemptedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!currentUser || companyLoading || !urlCompanyId) return;
        if (activeCompany?.id !== urlCompanyId && !syncRef.current) {
            syncRef.current = true;
            syncAttemptedRef.current = urlCompanyId;
            selectCompany(urlCompanyId).finally(() => { syncRef.current = false; });
        }
    }, [currentUser, urlCompanyId, activeCompany?.id, companyLoading, selectCompany]);

    // If sync was attempted but company didn't change → invalid company, redirect to home
    const syncFailed = isCompanyRoute && !companyLoading && !syncRef.current
        && urlCompanyId !== null && activeCompany?.id !== urlCompanyId
        && syncAttemptedRef.current === urlCompanyId;
    useEffect(() => {
        if (syncFailed) router.replace('/');
    }, [syncFailed, router]);

    // Redirect old flat routes (e.g. /campaigns) to company-scoped equivalents
    const isOldFlatRoute = !isCompanyRoute && !isHomeRoute && !isAdminRoute && !isPublicLegalRoute;
    useEffect(() => {
        if (!currentUser || sessionLoading || companyLoading) return;
        if (isOldFlatRoute && activeCompany) {
            router.replace(`/company/${activeCompany.id}${pathname}`);
        }
    }, [isOldFlatRoute, activeCompany, pathname, router, currentUser, sessionLoading, companyLoading]);

    if (sessionLoading) {
        return (
            <div style={{
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

    // Redirect old flat routes — show spinner while redirect effect fires
    if (isOldFlatRoute) {
        return (
            <div style={{
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
    if (companyLoading || (isCompanyRoute && syncRef.current)) {
        return (
            <div style={{
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

    // Company route — company must be loaded by now
    if (!activeCompany) {
        // Company ID from URL is invalid or user has no access — redirect home
        router.replace('/');
        return null;
    }

    // Company selected → render the app
    return (
        <Layout onLogout={logout}>
            {children}
        </Layout>
    );
}

'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import Layout from '@/components/Layout';
import LoginPage from '@/views/LoginPage';
import CompanySelectPage from '@/views/CompanySelectPage';
import { usePathname } from 'next/navigation';

export default function ClientShell({ children }: { children: ReactNode }) {
    const { currentUser, sessionLoading, login, logout } = useAuth();
    const { activeCompany, loading: companyLoading } = useCompany();
    const pathname = usePathname();
    const isPublicLegalRoute = pathname === '/impressum' || pathname === '/datenschutz' || pathname === '/agb';

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
    if (pathname === '/admin') {
        return <>{children}</>;
    }

    // Show company loading spinner
    if (companyLoading) {
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

    // No company selected → show company selector
    if (!activeCompany) {
        return <CompanySelectPage />;
    }

    // Company selected → render the app
    return (
        <Layout onLogout={logout}>
            {children}
        </Layout>
    );
}

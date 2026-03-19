'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/views/LoginPage';

export default function ClientShell({ children }: { children: ReactNode }) {
    const { currentUser, sessionLoading, login, logout } = useAuth();

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

    if (!currentUser) {
        return <LoginPage onLogin={login} />;
    }

    return (
        <Layout onLogout={logout}>
            {children}
        </Layout>
    );
}

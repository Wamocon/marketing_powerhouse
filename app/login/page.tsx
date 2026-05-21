'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoginPage from '@/views/LoginPage';

export default function LoginRoute() {
    const { currentUser, sessionLoading, login } = useAuth();
    const router = useRouter();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (!sessionLoading && currentUser) {
            router.replace('/dashboard');
        }
    }, [currentUser, sessionLoading, router]);

    if (sessionLoading) {
        return (
            <div suppressHydrationWarning style={{
                display: 'flex', height: '100vh', alignItems: 'center',
                justifyContent: 'center', background: '#f5f5f7',
                flexDirection: 'column', gap: '16px',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: 'linear-gradient(135deg, #c1292e, #ef4444)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'white', fontWeight: 700,
                }}>M</div>
                <div style={{
                    width: 32, height: 32, border: '3px solid #e5e5e5',
                    borderTopColor: '#c1292e', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (currentUser) {
        return null; // Will redirect via useEffect
    }

    return <LoginPage onLogin={login} />;
}

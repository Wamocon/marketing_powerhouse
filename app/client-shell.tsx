'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/views/LoginPage';

export default function ClientShell({ children }: { children: ReactNode }) {
    const { currentUser, login, logout } = useAuth();

    if (!currentUser) {
        return <LoginPage onLogin={login} />;
    }

    return (
        <Layout onLogout={logout}>
            {children}
        </Layout>
    );
}

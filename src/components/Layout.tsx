import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
    onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar onLogout={onLogout} />
            <div className="app-main">
                <Header />
                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

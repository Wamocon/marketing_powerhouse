'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

interface LegalPageShellProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function LegalPageShell({ title, subtitle, children }: LegalPageShellProps) {
    const { language } = useLanguage();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 12% 10%, rgba(14,165,233,0.12), transparent 36%), radial-gradient(circle at 85% 88%, rgba(16,185,129,0.1), transparent 32%), var(--bg-base)',
            color: 'var(--text-primary)',
            padding: '28px 16px 44px',
        }}>
            <div style={{ maxWidth: 940, margin: '0 auto' }}>
                <header style={{ marginBottom: 20 }}>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem',
                    }}>
                        <span aria-hidden="true">&larr;</span> {language === 'en' ? 'Back to app' : 'Zurueck zur App'}
                    </Link>
                    <h1 style={{ margin: '14px 0 8px', fontSize: 'clamp(1.7rem, 2.8vw, 2.3rem)', lineHeight: 1.2 }}>{title}</h1>
                    {subtitle ? (
                        <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: 820 }}>{subtitle}</p>
                    ) : null}
                </header>

                <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface)',
                    padding: '22px 18px',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    <div style={{ display: 'grid', gap: 14, lineHeight: 1.65 }}>
                        {children}
                    </div>
                </div>

                <nav aria-label={language === 'en' ? 'Legal pages' : 'Rechtliche Seiten'} style={{
                    marginTop: 16,
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    color: 'var(--text-secondary)',
                }}>
                    <Link href="/impressum">{language === 'en' ? 'Legal notice' : 'Impressum'}</Link>
                    <Link href="/datenschutz">{language === 'en' ? 'Privacy' : 'Datenschutz'}</Link>
                    <Link href="/agb">{language === 'en' ? 'Terms' : 'AGB'}</Link>
                </nav>

                <p style={{ marginTop: 14, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    {language === 'en' ? 'Developed by WAMOCON Academy GmbH in Germany.' : 'Entwickelt von WAMOCON Academy GmbH in Deutschland.'}
                </p>
            </div>
        </div>
    );
}

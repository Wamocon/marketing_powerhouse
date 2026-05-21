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
    const { t } = useLanguage();

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
                        <span aria-hidden="true">&larr;</span> {t({ de: 'Zurück zur App', en: 'Back to app', tr: 'Uygulamaya dön' })}
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

                <nav aria-label={t({ de: 'Rechtliche Seiten', en: 'Legal pages', tr: 'Yasal sayfalar' })} style={{
                    marginTop: 16,
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    color: 'var(--text-secondary)',
                }}>
                    <Link href="/impressum">{t({ de: 'Impressum', en: 'Legal notice', tr: 'Yasal Bildirim' })}</Link>
                    <Link href="/datenschutz">{t({ de: 'Datenschutz', en: 'Privacy', tr: 'Gizlilik' })}</Link>
                    <Link href="/agb">{t({ de: 'AGB', en: 'Terms', tr: 'Kullanım Koşulları' })}</Link>
                </nav>

                <p style={{ marginTop: 14, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    {t({ de: 'Entwickelt von WAMOCON Academy GmbH in Deutschland.', en: 'Developed by WAMOCON Academy GmbH in Germany.', tr: 'WAMOCON Academy GmbH tarafından Almanya\'da geliştirilmiştir.' })}
                </p>
            </div>
        </div>
    );
}

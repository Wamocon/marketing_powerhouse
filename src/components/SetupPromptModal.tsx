'use client';

import { useEffect, useState } from 'react';
import { Compass, CheckCircle2, Circle, ArrowRight, X } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useProjectRouter } from '../hooks/useProjectRouter';
import { hasMinimumPositioning, hasMinimumAudience } from '../lib/projectSetup';

const DISMISSED_KEY_PREFIX = 'momentum_setup_dismissed';

function getDismissedKey(companyId: string): string {
    return `${DISMISSED_KEY_PREFIX}:${companyId}`;
}

export default function SetupPromptModal() {
    const { activeCompany } = useCompany();
    const { positioning, audiences, customerJourneys, touchpoints } = useData();
    const { language } = useLanguage();
    const router = useProjectRouter();
    const [visible, setVisible] = useState(false);

    const positioningDone = positioning ? hasMinimumPositioning(positioning) : false;
    const audienceDone = hasMinimumAudience(audiences[0] ?? null);
    const journeyDone = customerJourneys.length > 0;
    const allDone = positioningDone && audienceDone && journeyDone;

    const steps = [
        {
            done: positioningDone,
            label: language === 'en' ? 'Project basis & positioning' : 'Projektbasis & Positionierung',
        },
        {
            done: audienceDone,
            label: language === 'en' ? 'First target audience' : 'Erste Zielgruppe',
        },
        {
            done: journeyDone,
            label: language === 'en' ? 'Customer Journey' : 'Customer Journey',
        },
    ];

    const completedCount = steps.filter(s => s.done).length;

    useEffect(() => {
        if (!activeCompany || allDone) {
            setVisible(false);
            return;
        }

        const key = getDismissedKey(activeCompany.id);
        const dismissed = sessionStorage.getItem(key);
        if (dismissed) {
            setVisible(false);
            return;
        }

        // Small delay so the page renders first
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
    }, [activeCompany, allDone]);

    const handleDismiss = () => {
        if (activeCompany) {
            sessionStorage.setItem(getDismissedKey(activeCompany.id), '1');
        }
        setVisible(false);
    };

    const handleGoToSetup = () => {
        setVisible(false);
        if (activeCompany) {
            sessionStorage.setItem(getDismissedKey(activeCompany.id), '1');
        }
        router.push('/setup');
    };

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(0,0,0,0.45)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: '24px', animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={handleDismiss}
        >
            <div
                className="card"
                style={{
                    maxWidth: '480px', width: '100%',
                    animation: 'slideUp 0.25s ease-out',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                            background: 'var(--color-primary-50)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-primary)',
                        }}>
                            <Compass size={22} />
                        </div>
                        <div>
                            <div className="card-title">
                                {language === 'en' ? 'Complete your project setup' : 'Projekt-Setup abschliessen'}
                            </div>
                            <div className="card-subtitle">
                                {completedCount}/{steps.length} {language === 'en' ? 'steps completed' : 'Schritte abgeschlossen'}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleDismiss}>
                        <X size={18} />
                    </button>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                    {language === 'en'
                        ? 'Your project is missing some key information. Complete the setup wizard to get the most out of Momentum.'
                        : 'Deinem Projekt fehlen noch wichtige Informationen. Schliesse den Setup-Assistenten ab, um das volle Potenzial von Momentum zu nutzen.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                                background: step.done ? 'var(--color-success-bg)' : 'var(--bg-hover)',
                                border: `1px solid ${step.done ? 'var(--color-success)' : 'var(--border-color)'}`,
                            }}
                        >
                            {step.done ? (
                                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                            ) : (
                                <Circle size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                            )}
                            <span style={{
                                fontSize: 'var(--font-size-sm)', fontWeight: 500,
                                color: step.done ? 'var(--color-success)' : 'var(--text-primary)',
                                textDecoration: step.done ? 'line-through' : 'none',
                            }}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={handleDismiss}>
                        {language === 'en' ? 'Later' : 'Spaeter'}
                    </button>
                    <button className="btn btn-primary" onClick={handleGoToSetup}>
                        {language === 'en' ? 'Go to setup' : 'Zum Setup'}
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

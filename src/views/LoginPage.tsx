'use client';
import { useState, type FormEvent } from 'react';
import { Megaphone, BarChart3, Calendar, Wallet, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const features = [
    { icon: Megaphone, title: 'Kampagnen-Steuerung', text: 'Alle Kampagnen zentral planen, steuern und optimieren.' },
    { icon: BarChart3, title: 'Analytics & Reporting', text: 'Cross-Channel-Dashboards mit Echtzeit-KPIs.' },
    { icon: Calendar, title: 'Content-Kalender', text: 'Redaktionsplanung über alle Kanäle hinweg.' },
    { icon: Wallet, title: 'Budget-Kontrolle', text: 'Plan vs. Ist — immer den Überblick behalten.' },
];

interface LoginPageProps {
    onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin: _onLogin }: LoginPageProps) {
    const { loginWithCredentials } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            setError('Bitte E-Mail und Passwort eingeben.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const found = await loginWithCredentials(email.trim(), password);
            if (!found) {
                setError('E-Mail oder Passwort ungültig.');
            }
            // On success, loginWithCredentials saves the session and sets currentUser,
            // which triggers ClientShell to re-render and show the app.
        } catch {
            setError('Verbindungsfehler. Bitte versuche es erneut.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-form-container animate-slide-up">
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <div className="sidebar-logo" style={{ width: 44, height: 44, fontSize: '1.25rem' }}>M</div>
                        <div>
                            <div className="sidebar-brand-name" style={{ fontSize: '1.25rem' }}>WAMOCON Academy</div>
                        </div>
                    </div>

                    <h1 className="login-title">Willkommen zurück</h1>
                    <p className="login-subtitle">Melde dich an, um dein Marketing auf das nächste Level zu bringen.</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">E-Mail-Adresse</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@unternehmen.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Passwort</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                                fontSize: 'var(--font-size-xs)', color: '#ef4444',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            style={{ marginTop: '0' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Rechte Seite */}
            <div className="login-right">
                <div className="login-feature-grid">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="login-feature" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="login-feature-icon">
                                    <Icon size={20} />
                                </div>
                                <div className="login-feature-title">{feature.title}</div>
                                <div className="login-feature-text">{feature.text}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

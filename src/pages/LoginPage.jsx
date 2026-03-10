import { useState } from 'react';
import { Megaphone, BarChart3, Calendar, Wallet, Eye, EyeOff, FlaskConical, ChevronDown } from 'lucide-react';
import { testUsers } from '../data/mockData';
import { ROLE_CONFIG } from '../context/AuthContext';

const features = [
    { icon: Megaphone, title: 'Kampagnen-Steuerung', text: 'Alle Kampagnen zentral planen, steuern und optimieren.' },
    { icon: BarChart3, title: 'Analytics & Reporting', text: 'Cross-Channel-Dashboards mit Echtzeit-KPIs.' },
    { icon: Calendar, title: 'Content-Kalender', text: 'Redaktionsplanung über alle Kanäle hinweg.' },
    { icon: Wallet, title: 'Budget-Kontrolle', text: 'Plan vs. Ist — immer den Überblick behalten.' },
];

// Dev-Schnell-Login-Konten
const devAccounts = [
    { user: testUsers[0], label: 'Admin', hint: 'Alle Rechte, User-Management' },
    { user: testUsers[1], label: 'Manager', hint: 'Kampagnen & Aufgaben erstellen' },
    { user: testUsers[3], label: 'Member', hint: 'Aufgaben bearbeiten, lesen' },
];

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showDevPanel, setShowDevPanel] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const found = testUsers.find(
            u => u.email === email.trim() && u.password === password
        );
        if (found) {
            onLogin(found);
        } else {
            setError('E-Mail oder Passwort ungültig. Nutze die Dev-Zugänge unten.');
        }
    };

    const handleDevLogin = (user) => {
        onLogin(user);
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-form-container animate-slide-up">
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <div className="sidebar-logo" style={{ width: 44, height: 44, fontSize: '1.25rem' }}>M</div>
                        <div>
                            <div className="sidebar-brand-name" style={{ fontSize: '1.25rem' }}>Marketing Powerhouse</div>
                        </div>
                    </div>

                    <h1 className="login-title">Willkommen zurück</h1>
                    <p className="login-subtitle">Melde dich an, um dein Marketing auf das nächste Level zu bringen.</p>

                    {/* Login-Formular */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">E-Mail-Adresse</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@unternehmen.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Passwort</span>
                                <a href="#" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-light)' }}>Vergessen?</a>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '0' }}>
                            Anmelden
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            Noch kein Konto?{' '}
                            <a href="#" style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>
                                Jetzt registrieren
                            </a>
                        </p>
                    </form>

                    {/* ─── DEV-PANEL ─── */}
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button
                            onClick={() => setShowDevPanel(!showDevPanel)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer',
                                color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                letterSpacing: '0.04em', textTransform: 'uppercase',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FlaskConical size={13} style={{ color: '#f59e0b' }} />
                                Dev-Schnellzugang (Testmodus)
                            </span>
                            <ChevronDown size={14} style={{ transform: showDevPanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        {showDevPanel && (
                            <div className="animate-in" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                                    Klicke auf eine Rolle, um dich direkt einzuloggen und das rollenbasierte UI zu testen.
                                </p>
                                {devAccounts.map(({ user, label, hint }) => {
                                    const cfg = ROLE_CONFIG[user.role];
                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => handleDevLogin(user)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px 14px', background: 'var(--bg-elevated)',
                                                border: `1px solid ${cfg.color}30`,
                                                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                                textAlign: 'left', transition: 'all 0.2s ease',
                                                width: '100%',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = `${cfg.color}30`}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                                background: cfg.bgColor, display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: 'var(--font-size-xs)',
                                                fontWeight: 700, color: cfg.color, flexShrink: 0,
                                            }}>
                                                {user.avatar}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                                        {user.name}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.6rem', padding: '1px 6px',
                                                        borderRadius: 'var(--radius-full)', background: cfg.bgColor,
                                                        color: cfg.color, fontWeight: 700, textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                    }}>
                                                        {label}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    {hint}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: cfg.color, fontWeight: 600 }}>Login →</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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

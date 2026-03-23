'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { Megaphone, BarChart3, Calendar, Wallet, Eye, EyeOff, Check, Zap, Crown, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../lib/api';
import { formatPrice, getPlanHighlights, PLAN_SLUGS, type PlanSlug } from '../lib/pricing';
import type { User, Plan } from '../types';

const featureMap = {
    de: [
        { icon: Megaphone, title: 'Kampagnen-Steuerung', text: 'Alle Kampagnen zentral planen, steuern und optimieren.' },
        { icon: BarChart3, title: 'Analytics & Reporting', text: 'Cross-Channel-Dashboards mit Echtzeit-KPIs.' },
        { icon: Calendar, title: 'Content-Kalender', text: 'Redaktionsplanung ueber alle Kanaele hinweg.' },
        { icon: Wallet, title: 'Budget-Kontrolle', text: 'Plan vs. Ist - immer den Ueberblick behalten.' },
    ],
    en: [
        { icon: Megaphone, title: 'Campaign Control', text: 'Plan, manage and optimize all campaigns in one place.' },
        { icon: BarChart3, title: 'Analytics & Reporting', text: 'Cross-channel dashboards with real-time KPIs.' },
        { icon: Calendar, title: 'Content Calendar', text: 'Editorial planning across all channels.' },
        { icon: Wallet, title: 'Budget Control', text: 'Planned vs. actual spend at a glance.' },
    ],
} as const;

interface LoginPageProps {
    onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin: _onLogin }: LoginPageProps) {
    const { loginWithCredentials, registerWithCredentials } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [whatsappConsent, setWhatsappConsent] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [acceptDsgvoProcessing, setAcceptDsgvoProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    // Fetch plans for registration plan picker
    useEffect(() => {
        api.fetchPlans()
            .then(p => {
                setPlans(p.sort((a, b) => a.sortOrder - b.sortOrder));
                // Default to Pro plan
                const proPlan = p.find(pl => pl.slug === PLAN_SLUGS.PRO);
                if (proPlan) setSelectedPlanId(proPlan.id);
            })
            .catch(() => {/* plans unavailable - registration proceeds without plan */});
    }, []);

    const isEn = language === 'en';
    const text = isEn
        ? {
            welcome: 'Welcome back',
            subtitleLogin: 'Sign in to bring your marketing to the next level.',
            subtitleRegister: 'Create your account and launch your first workspace right away.',
            login: 'Sign in',
            register: 'Register',
            workspaceName: 'Workspace name (optional)',
            email: 'Email address',
            phone: 'Phone number',
            password: 'Password',
            confirmPassword: 'Confirm password',
            requiredConsents: 'Required consents',
            consentTerms: 'I accept the',
            consentPrivacy: 'I have read the',
            consentDsgvo: 'I consent to GDPR-compliant processing of my data for platform usage.',
            consentWhatsapp: 'I consent to WhatsApp verification messages being sent to my phone number.',
            terms: 'Terms',
            privacy: 'Privacy policy',
            loginLoading: 'Signing in...',
            registerLoading: 'Creating account...',
            loginAction: 'Sign in',
            registerAction: 'Create account',
            registrationSuccess: 'Registration successful. Logging you in...',
            devBy: 'Built by WAMOCON Academy GmbH.',
            errorEmailPassword: 'Please enter email and password.',
            errorName: 'Please enter your name.',
            errorPasswordLength: 'Password must be at least 8 characters long.',
            errorPasswordMismatch: 'Password and confirmation do not match.',
            errorPhone: 'Please enter your phone number.',
            errorTerms: 'Please accept the terms.',
            errorPrivacy: 'Please confirm the privacy policy.',
            errorDsgvo: 'Please consent to GDPR-compliant data processing.',
            errorWhatsapp: 'Please confirm WhatsApp consent for verification.',
            errorInvalidCredentials: 'Invalid email or password.',
            errorConnection: 'Connection error. Please try again.',
            assignLanguage: 'Language',
            deutsch: 'German',
            english: 'English',
        }
        : {
            welcome: 'Willkommen zurueck',
            subtitleLogin: 'Melde dich an, um dein Marketing auf das naechste Level zu bringen.',
            subtitleRegister: 'Erstelle deinen Zugang und starte direkt mit deinem ersten Workspace.',
            login: 'Anmelden',
            register: 'Registrieren',
            workspaceName: 'Workspace-Name (optional)',
            email: 'E-Mail-Adresse',
            phone: 'Telefonnummer',
            password: 'Passwort',
            confirmPassword: 'Passwort wiederholen',
            requiredConsents: 'Pflichtzustimmungen',
            consentTerms: 'Ich akzeptiere die',
            consentPrivacy: 'Ich habe die',
            consentDsgvo: 'Ich willige in die DSGVO-konforme Verarbeitung meiner Daten fuer die Nutzung der Plattform ein.',
            consentWhatsapp: 'Ich willige ein, dass zur Verifikation WhatsApp-Nachrichten an meine angegebene Telefonnummer gesendet werden duerfen.',
            terms: 'AGB',
            privacy: 'Datenschutzerklaerung',
            loginLoading: 'Wird angemeldet...',
            registerLoading: 'Wird registriert...',
            loginAction: 'Anmelden',
            registerAction: 'Konto erstellen',
            registrationSuccess: 'Registrierung erfolgreich. Du wirst eingeloggt...',
            devBy: 'Entwickelt von WAMOCON Academy GmbH.',
            errorEmailPassword: 'Bitte E-Mail und Passwort eingeben.',
            errorName: 'Bitte Namen eingeben.',
            errorPasswordLength: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
            errorPasswordMismatch: 'Passwort und Wiederholung stimmen nicht ueberein.',
            errorPhone: 'Bitte Telefonnummer eingeben.',
            errorTerms: 'Bitte akzeptiere die AGB.',
            errorPrivacy: 'Bitte bestaetige die Datenschutzerklaerung.',
            errorDsgvo: 'Bitte stimme der DSGVO-konformen Datenverarbeitung zu.',
            errorWhatsapp: 'Bitte bestaetige die WhatsApp-Einwilligung zur Verifikation.',
            errorInvalidCredentials: 'E-Mail oder Passwort ungueltig.',
            errorConnection: 'Verbindungsfehler. Bitte versuche es erneut.',
            assignLanguage: 'Sprache',
            deutsch: 'Deutsch',
            english: 'English',
        };
    const features = featureMap[language];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (mode === 'login') {
            if (!email.trim() || !password) {
                setError(text.errorEmailPassword);
                return;
            }
        } else {
            if (!name.trim()) {
                setError(text.errorName);
                return;
            }
            if (!email.trim() || !password) {
                setError(text.errorEmailPassword);
                return;
            }
            if (password.length < 8) {
                setError(text.errorPasswordLength);
                return;
            }
            if (password !== confirmPassword) {
                setError(text.errorPasswordMismatch);
                return;
            }
            if (!phone.trim()) {
                setError(text.errorPhone);
                return;
            }
            if (!acceptTerms) {
                setError(text.errorTerms);
                return;
            }
            if (!acceptPrivacy) {
                setError(text.errorPrivacy);
                return;
            }
            if (!acceptDsgvoProcessing) {
                setError(text.errorDsgvo);
                return;
            }
            if (!whatsappConsent) {
                setError(text.errorWhatsapp);
                return;
            }
        }

        setIsLoading(true);
        try {
            if (mode === 'login') {
                const found = await loginWithCredentials(email.trim(), password);
                if (!found) {
                    setError(text.errorInvalidCredentials);
                }
            } else {
                await registerWithCredentials({
                    name: name.trim(),
                    companyName: companyName.trim() || undefined,
                    email: email.trim(),
                    password,
                    phone: phone.trim(),
                    whatsappConsent,
                    planId: selectedPlanId || undefined,
                });
                setSuccessMessage(text.registrationSuccess);
            }
        } catch (err) {
            const message = err instanceof Error && err.message
                ? err.message
                : text.errorConnection;
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (nextMode: 'login' | 'register') => {
        setMode(nextMode);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-form-container animate-slide-up">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            {text.assignLanguage}
                            <select
                                className="form-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
                                style={{ minWidth: '124px' }}
                            >
                                <option value="de">{text.deutsch}</option>
                                <option value="en">{text.english}</option>
                            </select>
                        </label>
                    </div>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <div className="sidebar-logo" style={{ width: 44, height: 44, fontSize: '1.25rem' }}>M</div>
                        <div>
                            <div className="sidebar-brand-name" style={{ fontSize: '1.25rem' }}>WAMOCON Academy</div>
                        </div>
                    </div>

                        <h1 className="login-title">{text.welcome}</h1>
                    <p className="login-subtitle" style={{ marginBottom: mode === 'register' ? 'var(--space-lg)' : 'var(--space-2xl)' }}>
                        {mode === 'login'
                            ? text.subtitleLogin
                            : text.subtitleRegister}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button
                            type="button"
                            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => switchMode('login')}
                            disabled={isLoading}
                            style={{ flex: 1 }}
                        >
                            {text.login}
                        </button>
                        <button
                            type="button"
                            className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => switchMode('register')}
                            disabled={isLoading}
                            style={{ flex: 1 }}
                        >
                            {text.register}
                        </button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Max Mustermann"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="name"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">{text.workspaceName}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Meine Marketing Unit"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        autoComplete="organization"
                                        disabled={isLoading}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{text.email}</label>
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

                        {mode === 'register' && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{text.phone}</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="+49 170 1234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    autoComplete="tel"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{text.password}</label>
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

                        {mode === 'register' && (
                            <>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">{text.confirmPassword}</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* ─── Plan Picker ─── */}
                                {plans.length > 0 && (
                                    <div style={{
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '12px',
                                        background: 'var(--bg-surface)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}>
                                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {isEn ? 'Choose your plan' : 'Wähle deinen Plan'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {plans.map(plan => {
                                                const PlanIcon = plan.slug === 'ultimate' ? Rocket : plan.slug === 'pro' ? Crown : Zap;
                                                const isSelected = selectedPlanId === plan.id;
                                                const accent = plan.slug === 'ultimate' ? 'var(--color-accent)' : plan.slug === 'pro' ? 'var(--color-primary)' : 'var(--color-neutral)';
                                                return (
                                                    <button
                                                        key={plan.id}
                                                        type="button"
                                                        onClick={() => setSelectedPlanId(plan.id)}
                                                        disabled={isLoading}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 6px',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: isSelected ? `2px solid ${accent}` : '1px solid var(--border-color)',
                                                            background: isSelected ? `${accent}08` : 'transparent',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            transition: 'border-color 0.15s',
                                                        }}
                                                    >
                                                        <PlanIcon size={14} style={{ color: accent }} />
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</span>
                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{formatPrice(plan.priceMonthly)}/{isEn ? 'mo' : 'Mo'}</span>
                                                        {isSelected && <Check size={12} style={{ color: accent }} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                            {isEn ? 'You can change your plan anytime in settings.' : 'Du kannst deinen Plan jederzeit in den Einstellungen ändern.'}
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '12px',
                                    background: 'var(--bg-surface)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {text.requiredConsents}
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                            disabled={isLoading}
                                            style={{ marginTop: '2px' }}
                                        />
                                        <span>
                                            {text.consentTerms} <Link href="/agb" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{text.terms}</Link>.
                                        </span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={acceptPrivacy}
                                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                            disabled={isLoading}
                                            style={{ marginTop: '2px' }}
                                        />
                                        <span>
                                            {text.consentPrivacy} <Link href="/datenschutz" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{text.privacy}</Link>{isEn ? '.' : ' gelesen.'}
                                        </span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={acceptDsgvoProcessing}
                                            onChange={(e) => setAcceptDsgvoProcessing(e.target.checked)}
                                            disabled={isLoading}
                                            style={{ marginTop: '2px' }}
                                        />
                                        <span>
                                            {text.consentDsgvo}
                                        </span>
                                    </label>
                                </div>

                                <label style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                                    padding: '10px 12px', fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-secondary)', background: 'var(--bg-surface)',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={whatsappConsent}
                                        onChange={(e) => setWhatsappConsent(e.target.checked)}
                                        disabled={isLoading}
                                        style={{ marginTop: '2px' }}
                                    />
                                    {text.consentWhatsapp}
                                </label>
                            </>
                        )}

                        {successMessage && (
                            <div style={{
                                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                                fontSize: 'var(--font-size-xs)', color: '#10b981',
                            }}>
                                {successMessage}
                            </div>
                        )}

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
                            {isLoading
                                ? (mode === 'login' ? text.loginLoading : text.registerLoading)
                                : (mode === 'login' ? text.loginAction : text.registerAction)}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '18px',
                        display: 'flex',
                        gap: '14px',
                        flexWrap: 'wrap',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-tertiary)',
                    }}>
                        <Link href="/impressum">{isEn ? 'Legal notice' : 'Impressum'}</Link>
                        <Link href="/datenschutz">{isEn ? 'Privacy' : 'Datenschutz'}</Link>
                        <Link href="/agb">{text.terms}</Link>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {text.devBy}
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

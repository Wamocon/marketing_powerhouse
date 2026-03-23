import { useEffect, useState } from 'react';
import {
    Settings, Users, Plug, Bell, Shield, CreditCard, FileJson,
    Plus, Check, X, Lock, Trash2,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import { useSubscription } from '../context/SubscriptionContext';
import * as api from '../lib/api';
import PageHelp from '../components/PageHelp';
import ImportExportPanel from '../components/ImportExportPanel';
import PricingCards from '../components/PricingCards';
import { downloadProjectExport } from '../lib/importExport';
import type { ProjectExportData } from '../types/importExport';
import { NOTIFICATION_SETTING_TYPE_MAP, type NotificationType } from '../types';
import { formatPrice } from '../lib/pricing';

import { AdminSettings } from '../components/SettingsAdmin';

type NotificationSettings = {
    campaignUpdates: boolean;
    budgetAlerts: boolean;
    taskReminders: boolean;
    teamActivities: boolean;
    weeklyReport: boolean;
    kpiAnomalies: boolean;
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    campaignUpdates: true,
    budgetAlerts: true,
    taskReminders: true,
    teamActivities: false,
    weeklyReport: true,
    kpiAnomalies: false,
};

const NOTIFICATION_STORAGE_PREFIX = 'momentum_notification_settings';
const NOTIFICATION_SETTINGS_CHANGED_EVENT = 'momentum_notification_settings_changed';

const getNotificationStorageKey = (companyId: string, userId: string) =>
    `${NOTIFICATION_STORAGE_PREFIX}:${companyId}:${userId}`;

const mapPreferencesToSettings = (
    preferences: Array<{ type: NotificationType; enabled: boolean }>,
): NotificationSettings => {
    if (preferences.length === 0) return { ...DEFAULT_NOTIFICATION_SETTINGS };

    const byType = new Map<NotificationType, boolean>(
        preferences.map(pref => [pref.type, pref.enabled]),
    );
    const result: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };

    for (const [settingKey, types] of Object.entries(NOTIFICATION_SETTING_TYPE_MAP)) {
        const key = settingKey as keyof NotificationSettings;
        const values = types
            .map(type => byType.has(type) ? byType.get(type) : undefined)
            .filter((value): value is boolean => typeof value === 'boolean');

        if (values.length > 0) {
            result[key] = values.every(Boolean);
        }
    }

    return result;
};

const mapSettingsToTypeFlags = (settings: NotificationSettings): Partial<Record<NotificationType, boolean>> => {
    const result: Partial<Record<NotificationType, boolean>> = {};
    for (const [settingKey, types] of Object.entries(NOTIFICATION_SETTING_TYPE_MAP)) {
        const enabled = settings[settingKey as keyof NotificationSettings];
        for (const type of types) {
            result[type] = enabled;
        }
    }
    return result;
};

const normalizeNotificationSettings = (input: unknown): NotificationSettings => {
    if (!input || typeof input !== 'object') {
        return { ...DEFAULT_NOTIFICATION_SETTINGS };
    }
    const value = input as Partial<NotificationSettings>;
    return {
        campaignUpdates: typeof value.campaignUpdates === 'boolean' ? value.campaignUpdates : DEFAULT_NOTIFICATION_SETTINGS.campaignUpdates,
        budgetAlerts: typeof value.budgetAlerts === 'boolean' ? value.budgetAlerts : DEFAULT_NOTIFICATION_SETTINGS.budgetAlerts,
        taskReminders: typeof value.taskReminders === 'boolean' ? value.taskReminders : DEFAULT_NOTIFICATION_SETTINGS.taskReminders,
        teamActivities: typeof value.teamActivities === 'boolean' ? value.teamActivities : DEFAULT_NOTIFICATION_SETTINGS.teamActivities,
        weeklyReport: typeof value.weeklyReport === 'boolean' ? value.weeklyReport : DEFAULT_NOTIFICATION_SETTINGS.weeklyReport,
        kpiAnomalies: typeof value.kpiAnomalies === 'boolean' ? value.kpiAnomalies : DEFAULT_NOTIFICATION_SETTINGS.kpiAnomalies,
    };
};

const NOTIFICATION_SETTING_META: { key: keyof NotificationSettings; title: string; desc: string }[] = [
    { key: 'campaignUpdates', title: 'Kampagnen-Updates', desc: 'Statusänderungen und neue Kampagnen im Notification-Center' },
    { key: 'budgetAlerts', title: 'Budget-Alerts', desc: 'Warnung bei Budgetüberschreitung (ab 80%) – erscheint als dringende Benachrichtigung' },
    { key: 'taskReminders', title: 'Aufgaben-Benachrichtigungen', desc: 'Zuweisung, Status-Änderungen und KI-Generierungsergebnisse' },
    { key: 'teamActivities', title: 'Team-Aktivitäten', desc: 'Neue Team-Mitglieder und Rollenwechsel' },
    { key: 'weeklyReport', title: 'Wöchentlicher Report', desc: 'Zusammenfassung im Dashboard-Hinweisbereich' },
    { key: 'kpiAnomalies', title: 'KPI-Anomalien', desc: 'Benachrichtigung bei ungewöhnlichen KPI-Werten' },
];

const integrations = [
    { name: 'Google Analytics 4', status: 'connected', icon: '📊', desc: 'Website Traffic & Conversions' },
    { name: 'Google Ads', status: 'connected', icon: '🔍', desc: 'Suchmaschinenwerbung' },
    { name: 'Meta Business Suite', status: 'disconnected', icon: '📘', desc: 'Facebook & Instagram Ads' },
    { name: 'LinkedIn Ads', status: 'disconnected', icon: '💼', desc: 'B2B Werbung' },
    { name: 'Mailchimp', status: 'connected', icon: '📧', desc: 'E-Mail Marketing' },
    { name: 'Slack', status: 'connected', icon: '💬', desc: 'Team-Benachrichtigungen' },
    { name: 'HubSpot CRM', status: 'disconnected', icon: '🏢', desc: 'Kontakt-Synchronisierung' },
    { name: 'Zapier', status: 'disconnected', icon: '⚡', desc: 'Workflow-Automatisierung' },
];

const statusDot = (s: 'online' | 'away' | 'offline' | undefined) => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    background: s === 'online' ? 'var(--color-success)' : s === 'away' ? 'var(--color-warning)' : 'var(--text-tertiary)',
});

export default function SettingsPage() {
    const { can, currentUser, isSuperAdmin, activeCompanyRole } = useAuth();
    const { language, setLanguage } = useLanguage();
    const {
        activeCompany,
        companyMembers,
        updateCompany,
        addMember,
        updateMemberRole,
        removeMember,
    } = useCompany();
    const { subscription, currentPlan, plans, changePlan, loading: subLoading, currentPlanSlug } = useSubscription();
    const [activeTab, setActiveTab] = useState(() => {
        // Check URL for ?tab=subscription
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('tab') || 'general';
        }
        return 'general';
    });
    const [wsName, setWsName] = useState('');
    const [wsDesc, setWsDesc] = useState('');
    const [savedMsg, setSavedMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ ...DEFAULT_NOTIFICATION_SETTINGS });
    const [notificationsDirty, setNotificationsDirty] = useState(false);
    const [notificationSavedMsg, setNotificationSavedMsg] = useState('');
    const [notificationErrorMsg, setNotificationErrorMsg] = useState('');
    const [generalLanguage, setGeneralLanguage] = useState<AppLanguage>(language);
    const [languageSavedMsg, setLanguageSavedMsg] = useState('');

    useEffect(() => {
        setWsName(activeCompany?.name ?? '');
        setWsDesc(activeCompany?.description ?? '');
        setSavedMsg('');
        setErrorMsg('');
    }, [activeCompany]);

    useEffect(() => {
        let cancelled = false;

        const loadNotificationSettings = async () => {
            if (!activeCompany || !currentUser) {
                if (!cancelled) {
                    setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
                    setNotificationsDirty(false);
                    setNotificationSavedMsg('');
                    setNotificationErrorMsg('');
                }
                return;
            }

            const storageKey = getNotificationStorageKey(activeCompany.id, currentUser.id);

            try {
                const preferences = await api.fetchNotificationPreferences(currentUser.id, activeCompany.id);
                if (cancelled) return;

                if (preferences.length > 0) {
                    const mapped = mapPreferencesToSettings(preferences);
                    setNotificationSettings(mapped);
                    localStorage.setItem(storageKey, JSON.stringify(mapped));
                } else {
                    const raw = localStorage.getItem(storageKey);
                    const parsed = raw ? JSON.parse(raw) : null;
                    setNotificationSettings(normalizeNotificationSettings(parsed));
                }

                setNotificationsDirty(false);
                setNotificationSavedMsg('');
                setNotificationErrorMsg('');
            } catch {
                if (cancelled) return;
                try {
                    const raw = localStorage.getItem(storageKey);
                    const parsed = raw ? JSON.parse(raw) : null;
                    setNotificationSettings(normalizeNotificationSettings(parsed));
                    setNotificationErrorMsg('Einstellungen konnten nicht aus der Cloud geladen werden. Lokale Werte aktiv.');
                } catch {
                    setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
                    setNotificationErrorMsg('Benachrichtigungs-Einstellungen konnten nicht geladen werden. Standardwerte aktiv.');
                }
                setNotificationsDirty(false);
                setNotificationSavedMsg('');
            }
        };

        void loadNotificationSettings();

        return () => {
            cancelled = true;
        };
    }, [activeCompany?.id, currentUser?.id]);

    useEffect(() => {
        setGeneralLanguage(language);
    }, [language]);

    const handleSaveSettings = async () => {
        if (!activeCompany || !can('canManageSettings')) return;
        const trimmedName = wsName.trim();
        if (!trimmedName) {
            setErrorMsg('Bitte einen gültigen Projektnamen eingeben.');
            return;
        }
        try {
            setErrorMsg('');
            await updateCompany(activeCompany.id, {
                name: trimmedName,
                description: wsDesc.trim(),
                slug: trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            });
            setSavedMsg('Projektdaten gespeichert.');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch {
            setErrorMsg('Speichern fehlgeschlagen. Bitte erneut versuchen.');
        }
    };

    const handleDiscardSettings = () => {
        setWsName(activeCompany?.name ?? '');
        setWsDesc(activeCompany?.description ?? '');
        setErrorMsg('');
    };

    const handleRoleUpdate = async (memberId: string, role: 'company_admin' | 'manager' | 'member') => {
        try {
            setErrorMsg('');
            await updateMemberRole(memberId, role);
            setSavedMsg('Rolle aktualisiert.');
            setTimeout(() => setSavedMsg(''), 2500);
        } catch {
            setErrorMsg('Rolle konnte nicht geändert werden.');
        }
    };

    const handleMemberRemove = async (memberId: string, memberName: string) => {
        if (!confirm(`${memberName} wirklich aus dem Projekt entfernen?`)) return;
        try {
            setErrorMsg('');
            await removeMember(memberId);
            setSavedMsg('Mitglied entfernt.');
            setTimeout(() => setSavedMsg(''), 2500);
        } catch {
            setErrorMsg('Mitglied konnte nicht entfernt werden.');
        }
    };

    const handleInviteByEmail = async () => {
        if (!activeCompany || !can('canManageUsers')) return;
        const normalizedEmail = inviteEmail.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            setErrorMsg('Bitte eine gültige E-Mail-Adresse eingeben.');
            return;
        }

        try {
            setInviteLoading(true);
            setErrorMsg('');

            const user = await api.fetchUserByEmail(normalizedEmail);
            if (!user) {
                setErrorMsg('Benutzer nicht gefunden. Bitte Benutzer zuerst anlegen und dann erneut zuweisen.');
                return;
            }

            const alreadyAssigned = companyMembers.some(member => member.userId === user.id);
            if (alreadyAssigned) {
                setErrorMsg('Dieser Benutzer ist dem Projekt bereits zugewiesen.');
                return;
            }

            await addMember(user.id, 'member');
            setInviteEmail('');
            setSavedMsg(`Benutzer ${user.name} wurde als Member zugewiesen.`);
            setTimeout(() => setSavedMsg(''), 3000);
        } catch {
            setErrorMsg('Benutzer konnte nicht zugewiesen werden. Bitte erneut versuchen.');
        } finally {
            setInviteLoading(false);
        }
    };

    const toggleNotificationSetting = (key: keyof NotificationSettings) => {
        if (!can('canManageSettings') || !activeCompany) return;
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
        setNotificationsDirty(true);
        setNotificationSavedMsg('');
        setNotificationErrorMsg('');
    };

    const handleSaveNotificationSettings = async () => {
        if (!can('canManageSettings') || !activeCompany || !currentUser) {
            setNotificationErrorMsg('Keine Berechtigung zum Speichern der Benachrichtigungen.');
            return;
        }
        try {
            const storageKey = getNotificationStorageKey(activeCompany.id, currentUser.id);
            localStorage.setItem(storageKey, JSON.stringify(notificationSettings));

            const enabledByType = mapSettingsToTypeFlags(notificationSettings);
            await api.upsertNotificationPreferences(currentUser.id, activeCompany.id, enabledByType);

            window.dispatchEvent(new CustomEvent(NOTIFICATION_SETTINGS_CHANGED_EVENT, {
                detail: { companyId: activeCompany.id, userId: currentUser.id },
            }));

            setNotificationsDirty(false);
            setNotificationErrorMsg('');
            setNotificationSavedMsg('Benachrichtigungs-Einstellungen gespeichert.');
            setTimeout(() => setNotificationSavedMsg(''), 2500);
        } catch {
            setNotificationErrorMsg('Speichern der Benachrichtigungen fehlgeschlagen.');
        }
    };

    const handleSaveLanguage = () => {
        setLanguage(generalLanguage);
        setLanguageSavedMsg(language === 'en' ? 'Language saved.' : 'Sprache gespeichert.');
        setTimeout(() => setLanguageSavedMsg(''), 2500);
    };

    const tabs = [
        { id: 'general', label: language === 'en' ? 'General' : 'Allgemein', icon: Settings },
        { id: 'subscription', label: language === 'en' ? 'Subscription' : 'Abonnement', icon: CreditCard },
        { id: 'team', label: language === 'en' ? 'Team overview' : 'Team-Uebersicht', icon: Users },
        { id: 'integrations', label: language === 'en' ? 'Integrations' : 'Integrationen', icon: Plug },
        { id: 'notifications', label: language === 'en' ? 'Notifications' : 'Benachrichtigungen', icon: Bell },
    ];
    const adminTabs = [
        ...((isSuperAdmin || activeCompanyRole === 'company_admin') ? [{ id: 'importexport', label: 'Import / Export', icon: FileJson }] : []),
        ...(can('canManageUsers') ? [{ id: 'admin', label: language === 'en' ? 'User management' : 'Benutzerverwaltung', icon: Shield }] : []),
    ];

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">{language === 'en' ? 'Settings' : 'Einstellungen'}</h1>
                    <p className="page-subtitle">{language === 'en' ? 'Manage workspace and account settings' : 'Workspace- und Kontoeinstellungen verwalten'}</p>
                </div>
                <PageHelp title="Einstellungen & Benutzerverwaltung">
                    <p><strong>Team-Zuweisung per E-Mail (Admin):</strong> Im Tab "Team-Übersicht" kannst du bestehende Benutzer per E-Mail dem aktiven Projekt zuweisen.</p>
                    <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
                        <li>Es werden nur bereits angelegte Benutzer akzeptiert.</li>
                        <li>Bei erfolgreicher Zuweisung wird automatisch die Rolle <strong>Member</strong> vergeben.</li>
                        <li>Existiert die E-Mail nicht, erscheint eine Fehlermeldung mit Hinweis zur Benutzeranlage.</li>
                        <li>Rollen können danach in der Teamliste angepasst werden.</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}><strong>Benachrichtigungen:</strong></p>
                    <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                        <li>Im Tab "Benachrichtigungen" steuerst du, welche Notification-Typen im <strong>Glocken-Symbol</strong> (oben rechts) angezeigt werden.</li>
                        <li>Deaktivierte Kategorien werden automatisch herausgefiltert — die Benachrichtigungen werden trotzdem gespeichert und können später wieder aktiviert werden.</li>
                        <li>Die Einstellungen gelten pro Projekt.</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}><strong>Import / Export (Admin):</strong></p>
                    <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                        <li>Im Tab "Import / Export" können SuperAdmin und Projekt-Admin Projektdaten als JSON exportieren oder importieren.</li>
                        <li>Der Import übernimmt Positionierung, Keywords und Budget-Kategorien.</li>
                        <li>Eine leere Vorlage kann über den "Vorlage (JSON)"-Button heruntergeladen werden.</li>
                    </ul>
                </PageHelp>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Settings Sidebar */}
                <div style={{ width: '240px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}

                        {adminTabs.length > 0 && (
                            <>
                                <div style={{
                                    marginTop: '10px',
                                    marginBottom: '4px',
                                    padding: '8px 12px 4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-tertiary)',
                                    borderTop: '1px solid var(--border-color)',
                                }}>
                                    Admin
                                </div>
                                {adminTabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* Settings Content */}
                <div style={{ flex: 1 }}>

                    {/* ─── Allgemein ─── */}
                    {activeTab === 'general' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div className="card-title">{language === 'en' ? 'Company settings' : 'Projekt-Einstellungen'}</div>
                                {(!can('canManageSettings') || !activeCompany) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        <Lock size={11} /> {!activeCompany ? (language === 'en' ? 'No company selected' : 'Kein Projekt ausgewaehlt') : (language === 'en' ? 'Read-only mode' : 'Nur-Lese-Modus')}
                                    </div>
                                )}
                            </div>
                            {activeCompany && (
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '12px',
                                }}>
                                    {language === 'en' ? 'Active company' : 'Aktives Projekt'}: {activeCompany.name}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">{language === 'en' ? 'Company name (workspace name)' : 'Projektname (Workspace-Name)'}</label>
                                <input type="text" className="form-input" value={wsName} onChange={e => setWsName(e.target.value)} disabled={!can('canManageSettings') || !activeCompany} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{language === 'en' ? 'Description' : 'Beschreibung'}</label>
                                <textarea className="form-input form-textarea" value={wsDesc} onChange={e => setWsDesc(e.target.value)} disabled={!can('canManageSettings') || !activeCompany} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{language === 'en' ? 'Default currency' : 'Standard-Waehrung'}</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>EUR (€)</option><option>USD ($)</option><option>CHF (CHF)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{language === 'en' ? 'Timezone' : 'Zeitzone'}</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>Europe/Berlin (UTC+1)</option>
                                    <option>Europe/Zurich (UTC+1)</option>
                                    <option>Europe/Vienna (UTC+1)</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">{language === 'en' ? 'Application language' : 'Anwendungssprache'}</label>
                                <select
                                    className="form-select"
                                    value={generalLanguage}
                                    onChange={(e) => setGeneralLanguage(e.target.value as AppLanguage)}
                                    style={{ maxWidth: '280px' }}
                                >
                                    <option value="de">Deutsch</option>
                                    <option value="en">English</option>
                                </select>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                                    {language === 'en'
                                        ? 'Saved per user and applied after login.'
                                        : 'Wird benutzerspezifisch gespeichert und nach dem Login angewendet.'}
                                </div>
                            </div>

                            {languageSavedMsg && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginTop: '8px' }}>
                                    {languageSavedMsg}
                                </div>
                            )}

                            {(savedMsg || errorMsg) && (
                                <div style={{ fontSize: 'var(--font-size-xs)', marginTop: '8px', color: errorMsg ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                    {errorMsg || savedMsg}
                                </div>
                            )}
                            {can('canManageSettings') && activeCompany && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', alignItems: 'center' }}>
                                    {savedMsg && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginRight: 'auto' }}><Check size={14} /> {savedMsg}</span>}
                                    <button className="btn btn-secondary" onClick={handleDiscardSettings}>{language === 'en' ? 'Discard' : 'Verwerfen'}</button>
                                    <button className="btn btn-secondary" onClick={handleSaveLanguage} disabled={generalLanguage === language}>{language === 'en' ? 'Save language' : 'Sprache speichern'}</button>
                                    <button className="btn btn-primary" onClick={handleSaveSettings}>{language === 'en' ? 'Save' : 'Speichern'}</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Team-Übersicht ─── */}
                    {activeTab === 'team' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Team-Mitglieder</div>
                                    <div className="card-subtitle">{companyMembers.length} Mitglieder im aktiven Projekt</div>
                                </div>
                                {can('canManageUsers') && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="E-Mail für Zuweisung"
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            style={{ minWidth: '260px' }}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={handleInviteByEmail} disabled={inviteLoading}>
                                            <Plus size={14} /> {inviteLoading ? 'Prüfung...' : 'Per E-Mail zuweisen'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {can('canManageUsers') && (
                                <div style={{
                                    marginBottom: '12px',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-hover)',
                                    color: 'var(--text-tertiary)',
                                    fontSize: 'var(--font-size-xs)',
                                }}>
                                    Nur vorhandene Benutzer können per E-Mail zugewiesen werden. Neue Zuweisungen erfolgen standardmäßig mit der Rolle Member.
                                </div>
                            )}
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Mitglied</th>
                                            <th>Rolle</th>
                                            <th>Status</th>
                                            {can('canManageUsers') && <th>Aktionen</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyMembers.map(member => {
                                            const cfg = ROLE_CONFIG[member.role];
                                            const isMe = member.userId === currentUser?.id;
                                            const isProtectedSuperAdmin = member.userIsSuperAdmin && !isSuperAdmin;
                                            return (
                                            <tr key={member.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 'var(--font-size-xs)', color: 'white', fontWeight: 600,
                                                        }}>
                                                            {member.userAvatar || member.userName?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {member.userName || 'Unbekannt'}
                                                                {isMe && (
                                                                    <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary-light)', fontWeight: 700 }}>Du</span>
                                                                )}
                                                                {member.userIsSuperAdmin && (
                                                                    <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>Super-Admin</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                                {member.userEmail || 'Keine E-Mail'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: cfg.bgColor,
                                                        color: cfg.color,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                    }}>
                                                        {cfg.shortLabel}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={statusDot(member.userStatus)} />
                                                        <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'capitalize' }}>
                                                            {member.userStatus === 'online' ? 'Online' : member.userStatus === 'away' ? 'Abwesend' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </td>
                                                {can('canManageUsers') && (
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <select
                                                                value={member.role}
                                                                onChange={e => handleRoleUpdate(member.id, e.target.value as 'company_admin' | 'manager' | 'member')}
                                                                disabled={isMe || isProtectedSuperAdmin}
                                                                className="form-select"
                                                                style={{ minWidth: '125px' }}
                                                                title={isProtectedSuperAdmin ? 'Super-Admin-Rollen dürfen nur von Super-Admins angepasst werden.' : ''}
                                                            >
                                                                <option value="company_admin">Admin</option>
                                                                <option value="manager">Manager</option>
                                                                <option value="member">Member</option>
                                                            </select>
                                                            {!isMe && (
                                                                <button
                                                                    className="btn btn-ghost btn-sm"
                                                                    style={{ color: 'var(--color-danger)' }}
                                                                    disabled={isProtectedSuperAdmin}
                                                                    onClick={() => handleMemberRemove(member.id, member.userName || 'Mitglied')}
                                                                    title={isProtectedSuperAdmin ? 'Super-Admin darf nicht von Projekt-Admins entfernt werden.' : ''}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ─── Integrationen ─── */}
                    {activeTab === 'integrations' && (
                        <div className="animate-in">
                            <div className="card" style={{ marginBottom: '16px' }}>
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">Integrationen</div>
                                        <div className="card-subtitle">Verbinde deine Marketing-Tools</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                                {integrations.map(integration => (
                                    <div key={integration.name} className="card" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                                background: 'var(--bg-elevated)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                                            }}>
                                                {integration.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{integration.name}</span>
                                                    {integration.status === 'connected' ? (
                                                        <span className="badge badge-success"><Check size={10} /> Verbunden</span>
                                                    ) : (
                                                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}>Nicht verbunden</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    {integration.desc}
                                                </p>
                                                <button className={`btn btn-sm ${integration.status === 'connected' ? 'btn-secondary' : 'btn-primary'}`} style={{ marginTop: '8px' }}>
                                                    {integration.status === 'connected' ? 'Konfigurieren' : 'Verbinden'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Benachrichtigungen ─── */}
                    {activeTab === 'notifications' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div className="card-title">Benachrichtigungs-Einstellungen</div>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>
                                Diese Einstellungen steuern, welche Benachrichtigungen im <strong>Notification-Center</strong> (Glocken-Symbol oben rechts) angezeigt werden.
                                Deaktivierte Kategorien werden automatisch herausgefiltert.
                            </div>
                            {!activeCompany && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    Kein aktives Projekt ausgewählt.
                                </div>
                            )}
                            {NOTIFICATION_SETTING_META.map((setting, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 0', borderBottom: idx < 5 ? '1px solid var(--border-color)' : 'none',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{setting.title}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>{setting.desc}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleNotificationSetting(setting.key)}
                                        disabled={!can('canManageSettings') || !activeCompany}
                                        aria-label={`${setting.title} umschalten`}
                                        style={{
                                        width: '44px', height: '24px', borderRadius: 'var(--radius-full)',
                                        background: notificationSettings[setting.key] ? 'var(--color-primary)' : 'var(--bg-elevated)',
                                        border: `1px solid ${notificationSettings[setting.key] ? 'var(--color-primary)' : 'var(--border-color-strong)'}`,
                                        position: 'relative', cursor: 'pointer', transition: 'all var(--transition-fast)',
                                        opacity: !can('canManageSettings') || !activeCompany ? 0.55 : 1,
                                    }}
                                    >
                                        <div style={{
                                            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                            position: 'absolute', top: '2px',
                                            left: notificationSettings[setting.key] ? '22px' : '2px', transition: 'left var(--transition-fast)',
                                        }} />
                                    </button>
                                </div>
                            ))}
                            {(notificationSavedMsg || notificationErrorMsg) && (
                                <div style={{
                                    marginTop: '12px',
                                    fontSize: 'var(--font-size-xs)',
                                    color: notificationErrorMsg ? 'var(--color-danger)' : 'var(--color-success)',
                                }}>
                                    {notificationErrorMsg || notificationSavedMsg}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveNotificationSettings}
                                    disabled={!can('canManageSettings') || !activeCompany || !notificationsDirty}
                                >
                                    Einstellungen speichern
                                </button>
                            </div>
                        </div>
                    )}


                    {/* ─── Abonnement / Subscription ─── */}
                    {activeTab === 'subscription' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">{language === 'en' ? 'Your current plan' : 'Dein aktueller Plan'}</div>
                                </div>
                                {subLoading ? (
                                    <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                        {language === 'en' ? 'Loading...' : 'Wird geladen...'}
                                    </div>
                                ) : currentPlan ? (
                                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 200px' }}>
                                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                {currentPlan.name}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                                                {currentPlan.description}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{language === 'en' ? 'Price' : 'Preis'}</div>
                                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                                        {formatPrice(currentPlan.priceMonthly)}<span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>/{language === 'en' ? 'month' : 'Monat'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{language === 'en' ? 'Seats' : 'Pl\u00e4tze'}</div>
                                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                                        {companyMembers.length} / {currentPlan.maxSeats}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{language === 'en' ? 'Projects' : 'Projekte'}</div>
                                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                                        {subscription?.currentProjects ?? 1} / {currentPlan.maxProjects}
                                                    </div>
                                                </div>
                                            </div>
                                            {subscription && (
                                                <div style={{ marginTop: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    {language === 'en' ? 'Billing cycle' : 'Abrechnungszyklus'}: {subscription.billingCycle === 'yearly' ? (language === 'en' ? 'Yearly' : 'J\u00e4hrlich') : (language === 'en' ? 'Monthly' : 'Monatlich')}
                                                    {subscription.currentPeriodEnd && (
                                                        <> \u00b7 {language === 'en' ? 'Next renewal' : 'N\u00e4chste Verl\u00e4ngerung'}: {new Date(subscription.currentPeriodEnd).toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE')}</>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                        {language === 'en' ? 'No active subscription. Choose a plan below.' : 'Kein aktives Abonnement. W\u00e4hle unten einen Plan.'}
                                    </div>
                                )}
                            </div>
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">{language === 'en' ? 'Available plans' : 'Verf\u00fcgbare Pl\u00e4ne'}</div>
                                </div>
                                <PricingCards
                                    onSelect={async (plan) => {
                                        try {
                                            setErrorMsg('');
                                            await changePlan(plan.id);
                                            setSavedMsg(language === 'en' ? 'Plan changed successfully.' : 'Plan erfolgreich gewechselt.');
                                            setTimeout(() => setSavedMsg(''), 3000);
                                        } catch {
                                            setErrorMsg(language === 'en' ? 'Failed to change plan. Please try again.' : 'Planwechsel fehlgeschlagen. Bitte erneut versuchen.');
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ─── Import / Export ─── */}
                    {activeTab === 'importexport' && (isSuperAdmin || activeCompanyRole === 'company_admin') && (
                        <SettingsImportExport />
                    )}

                    {/* ─── Admin: Benutzerverwaltung ─── */}
                    {activeTab === 'admin' && can('canManageUsers') && (
                        <AdminSettings currentUser={currentUser} statusDot={statusDot} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Import/Export Sub-Component ───────────────────────────

function SettingsImportExport() {
    const { language } = useLanguage();
    const { activeCompany } = useCompany();
    const { positioning, companyKeywords, budgetData } = useData();
    const isDE = language === 'de';

    const handleProjectImport = async (raw: unknown) => {
        if (!activeCompany) return;
        const data = raw as ProjectExportData;

        // Update company info
        if (data.project.name || data.project.description || data.project.industry) {
            await api.updateCompany(activeCompany.id, {
                name: data.project.name || activeCompany.name,
                description: data.project.description || activeCompany.description,
                industry: data.project.industry || activeCompany.industry,
            });
        }

        // Import positioning
        if (data.positioning) {
            await api.savePositioning({
                ...data.positioning,
                lastUpdated: new Date().toISOString().split('T')[0],
                updatedBy: 'import',
            }, activeCompany.id);
        }

        // Import keywords
        if (data.keywords?.length) {
            for (const kw of data.keywords) {
                await api.createKeyword(kw, activeCompany.id);
            }
        }

        // Import budget categories
        if (data.budgetCategories?.length) {
            for (const cat of data.budgetCategories) {
                await api.createBudgetCategory(cat, activeCompany.id);
            }
        }

        // Reload page to reflect changes
        window.location.reload();
    };

    const handleProjectExport = () => {
        if (!activeCompany) return;
        downloadProjectExport(
            { name: activeCompany.name, description: activeCompany.description, industry: activeCompany.industry, logo: activeCompany.logo },
            positioning,
            companyKeywords,
            budgetData?.categories ?? [],
        );
    };

    return (
        <div>
            <h2 style={{ marginBottom: '4px' }}>{isDE ? 'Import / Export' : 'Import / Export'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                {isDE
                    ? 'Projekt-Daten exportieren oder aus einer JSON-Datei importieren. Nur für SuperAdmin und Projekt-Admin.'
                    : 'Export project data or import from a JSON file. Restricted to SuperAdmin and Project Admin.'}
            </p>
            <ImportExportPanel
                level="project"
                onImport={handleProjectImport}
                onExport={handleProjectExport}
                exportDisabled={!activeCompany}
                entityLabel={activeCompany?.name}
            />
        </div>
    );
}

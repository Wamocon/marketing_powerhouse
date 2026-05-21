import { useEffect, useState } from 'react';
import {
    Settings, Users, Plug, Bell, Shield, CreditCard, FileJson,
    Plus, Check, X, Lock, Trash2, ExternalLink, BookOpen, Clock,
} from 'lucide-react';
import { useAuth, ROLE_CONFIG } from '../context/AuthContext';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { useCompany } from '../context/CompanyContext';
import { useData } from '../context/DataContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTheme } from '../context/ThemeContext';
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

const NOTIFICATION_SETTING_META: { key: keyof NotificationSettings; title: { de: string; en: string; tr: string }; desc: { de: string; en: string; tr: string } }[] = [
    { key: 'campaignUpdates', title: { de: 'Kampagnen-Updates', en: 'Campaign updates', tr: 'Kampanya güncellemeleri' }, desc: { de: 'Statusänderungen und neue Kampagnen im Notification-Center', en: 'Status changes and new campaigns in the notification center', tr: 'Bildirim merkezindeki durum değişiklikleri ve yeni kampanyalar' } },
    { key: 'budgetAlerts', title: { de: 'Budget-Alerts', en: 'Budget alerts', tr: 'Bütçe uyarıları' }, desc: { de: 'Warnung bei Budgetüberschreitung (ab 80%) - erscheint als dringende Benachrichtigung', en: 'Warning when budget is exceeded (from 80%) - appears as urgent notification', tr: 'Bütçe aşımında uyarı (80% ve üzeri) - acil bildirim olarak görünür' } },
    { key: 'taskReminders', title: { de: 'Aufgaben-Benachrichtigungen', en: 'Task notifications', tr: 'Görev bildirimleri' }, desc: { de: 'Zuweisung, Status-Änderungen und KI-Generierungsergebnisse', en: 'Assignments, status changes, and AI generation results', tr: 'Atamalar, durum değişiklikleri ve yapay zeka üretim sonuçları' } },
    { key: 'teamActivities', title: { de: 'Team-Aktivitäten', en: 'Team activities', tr: 'Takım etkinlikleri' }, desc: { de: 'Neue Team-Mitglieder und Rollenwechsel', en: 'New team members and role changes', tr: 'Yeni takım üyeleri ve rol değişiklikleri' } },
    { key: 'weeklyReport', title: { de: 'Wöchentlicher Report', en: 'Weekly report', tr: 'Haftalık rapor' }, desc: { de: 'Zusammenfassung im Dashboard-Hinweisbereich', en: 'Summary in the dashboard notification area', tr: 'Kontrol paneli bildirim alanında özet' } },
    { key: 'kpiAnomalies', title: { de: 'KPI-Anomalien', en: 'KPI anomalies', tr: 'KPI anomalileri' }, desc: { de: 'Benachrichtigung bei ungewöhnlichen KPI-Werten', en: 'Notification for unusual KPI values', tr: 'Olağandışı KPI değerleri için bildirim' } },
];

interface IntegrationConfig {
    name: string;
    icon: string;
    desc: { de: string; en: string; tr: string };
    available: boolean;
    guide: {
        de: string[];
        en: string[];
        tr: string[];
        docUrl?: string;
    };
}

const INTEGRATIONS: IntegrationConfig[] = [
    {
        name: 'Google Analytics 4',
        icon: '📊',
        desc: { de: 'Website Traffic & Conversions', en: 'Website traffic & conversions', tr: 'Web sitesi trafiği ve dönüşümler' },
        available: true,
        guide: {
            de: [
                'Google Analytics Konto unter analytics.google.com erstellen oder vorhandenes verwenden.',
                'Unter Verwaltung > Datenstreams die Mess-ID (G-XXXXXXXXXX) kopieren.',
                'Die Mess-ID in den Projekt-Einstellungen unter "GA4 Tracking ID" eintragen.',
                'Optional: Google Analytics Data API aktivieren und ein Service-Account-JSON erstellen, um Reports zu importieren.',
            ],
            en: [
                'Create or use an existing Google Analytics account at analytics.google.com.',
                'Under Admin > Data Streams, copy the Measurement ID (G-XXXXXXXXXX).',
                'Enter the Measurement ID in the project settings under "GA4 Tracking ID".',
                'Optional: Enable the Google Analytics Data API and create a Service Account JSON to import reports.',
            ],
            tr: [
                'analytics.google.com adresinden bir Google Analytics hesabı oluşturun veya mevcut hesabınızı kullanın.',
                'Yönetici > Veri Akışları altında Ölçüm Kimliğini (G-XXXXXXXXXX) kopyalayın.',
                'Ölçüm Kimliğini proje ayarlarında "GA4 İzleme Kimliği" altına girin.',
                'İsteğe bağlı: Raporları içe aktarmak için Google Analytics Data API\'yi etkinleştirin ve bir Hizmet Hesabı JSON\'u oluşturun.',
            ],
            docUrl: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
        },
    },
    {
        name: 'Google Ads',
        icon: '🔍',
        desc: { de: 'Suchmaschinenwerbung', en: 'Search engine advertising', tr: 'Arama motoru reklamcılığı' },
        available: true,
        guide: {
            de: [
                'Ein Google Ads Konto unter ads.google.com erstellen oder vorhandenes verwenden.',
                'In der Google Cloud Console ein OAuth 2.0 Projekt anlegen und die Google Ads API aktivieren.',
                'Developer Token im Google Ads Konto unter Tools > API Center beantragen.',
                'OAuth Client-ID und Client-Secret in den Projekt-Einstellungen eintragen.',
            ],
            en: [
                'Create or use an existing Google Ads account at ads.google.com.',
                'In Google Cloud Console, create an OAuth 2.0 project and enable the Google Ads API.',
                'Request a Developer Token in your Google Ads account under Tools > API Center.',
                'Enter OAuth Client ID and Client Secret in the project settings.',
            ],
            tr: [
                'ads.google.com adresinden bir Google Ads hesabı oluşturun veya mevcut hesabınızı kullanın.',
                'Google Cloud Console\'da bir OAuth 2.0 projesi oluşturun ve Google Ads API\'yi etkinleştirin.',
                'Google Ads hesabınızda Araçlar > API Merkezi altından Geliştirici Jetonu talep edin.',
                'OAuth İstemci Kimliği ve İstemci Sırrını proje ayarlarına girin.',
            ],
            docUrl: 'https://developers.google.com/google-ads/api/docs/start',
        },
    },
    {
        name: 'Meta Business Suite',
        icon: '📘',
        desc: { de: 'Facebook & Instagram Ads', en: 'Facebook & Instagram ads', tr: 'Facebook ve Instagram reklamları' },
        available: true,
        guide: {
            de: [
                'Eine Meta Business App unter developers.facebook.com erstellen.',
                'Die Marketing API Berechtigung hinzufügen und einen System-Benutzer anlegen.',
                'Einen langlebigen Access Token generieren (mit ads_management und ads_read Scopes).',
                'Ad-Account-ID und Access Token in den Projekt-Einstellungen eintragen.',
            ],
            en: [
                'Create a Meta Business App at developers.facebook.com.',
                'Add the Marketing API permission and create a System User.',
                'Generate a long-lived Access Token (with ads_management and ads_read scopes).',
                'Enter Ad Account ID and Access Token in the project settings.',
            ],
            tr: [
                'developers.facebook.com adresinden bir Meta Business uygulaması oluşturun.',
                'Pazarlama API iznini ekleyin ve bir Sistem Kullanıcısı oluşturun.',
                'Uzun ömürlü bir Erişim Jetonu oluşturun (ads_management ve ads_read kapsamlarıyla).',
                'Reklam Hesabı Kimliği ve Erişim Jetonunu proje ayarlarına girin.',
            ],
            docUrl: 'https://developers.facebook.com/docs/marketing-apis/',
        },
    },
    {
        name: 'LinkedIn Ads',
        icon: '💼',
        desc: { de: 'B2B Werbung', en: 'B2B advertising', tr: 'B2B reklamcılık' },
        available: true,
        guide: {
            de: [
                'Eine LinkedIn Developer App unter linkedin.com/developers erstellen.',
                'Die Marketing Developer Platform Berechtigung beantragen.',
                'OAuth 2.0 Client-ID und Secret generieren.',
                'Client-ID, Secret und Ad-Account-ID in den Projekt-Einstellungen eintragen.',
            ],
            en: [
                'Create a LinkedIn Developer App at linkedin.com/developers.',
                'Request the Marketing Developer Platform permission.',
                'Generate OAuth 2.0 Client ID and Secret.',
                'Enter Client ID, Secret and Ad Account ID in the project settings.',
            ],
            tr: [
                'linkedin.com/developers adresinden bir LinkedIn Geliştirici Uygulaması oluşturun.',
                'Pazarlama Geliştirici Platformu iznini talep edin.',
                'OAuth 2.0 İstemci Kimliği ve Sırrı oluşturun.',
                'İstemci Kimliği, Sırrı ve Reklam Hesabı Kimliğini proje ayarlarına girin.',
            ],
            docUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
        },
    },
    {
        name: 'Mailchimp',
        icon: '📧',
        desc: { de: 'E-Mail Marketing', en: 'Email marketing', tr: 'E-posta pazarlama' },
        available: false,
        guide: { de: [], en: [], tr: [] },
    },
    {
        name: 'Slack',
        icon: '💬',
        desc: { de: 'Team-Benachrichtigungen', en: 'Team notifications', tr: 'Takım bildirimleri' },
        available: false,
        guide: { de: [], en: [], tr: [] },
    },
    {
        name: 'HubSpot CRM',
        icon: '🏢',
        desc: { de: 'Kontakt-Synchronisierung', en: 'Contact sync', tr: 'Kişi senkronizasyonu' },
        available: false,
        guide: { de: [], en: [], tr: [] },
    },
    {
        name: 'Zapier',
        icon: '⚡',
        desc: { de: 'Workflow-Automatisierung', en: 'Workflow automation', tr: 'İş akışı otomasyonu' },
        available: false,
        guide: { de: [], en: [], tr: [] },
    },
];

const statusDot = (s: 'online' | 'away' | 'offline' | undefined) => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    background: s === 'online' ? 'var(--color-success)' : s === 'away' ? 'var(--color-warning)' : 'var(--text-tertiary)',
});

export default function SettingsPage() {
    const { can, currentUser, isSuperAdmin, activeCompanyRole } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const {
        activeCompany,
        companyMembers,
        updateCompany,
        addMember,
        updateMemberRole,
        removeMember,
    } = useCompany();
    const { subscription, currentPlan, changePlan, loading: subLoading } = useSubscription();
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
    const [guideModal, setGuideModal] = useState<IntegrationConfig | null>(null);

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
                    setNotificationErrorMsg(t({ de: 'Einstellungen konnten nicht aus der Cloud geladen werden. Lokale Werte aktiv.', en: 'Could not load settings from the cloud. Local values active.', tr: 'Ayarlar buluttan yüklenemedi. Yerel değerler aktif.' }));
                } catch {
                    setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
                    setNotificationErrorMsg(t({ de: 'Benachrichtigungs-Einstellungen konnten nicht geladen werden. Standardwerte aktiv.', en: 'Notification settings could not be loaded. Default values active.', tr: 'Bildirim ayarları yüklenemedi. Varsayılan değerler aktif.' }));
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
            setErrorMsg(t({ de: 'Bitte einen gültigen Projektnamen eingeben.', en: 'Please enter a valid project name.', tr: 'Lütfen geçerli bir proje adı girin.' }));
            return;
        }
        try {
            setErrorMsg('');
            await updateCompany(activeCompany.id, {
                name: trimmedName,
                description: wsDesc.trim(),
                slug: trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            });
            setSavedMsg(t({ de: 'Projektdaten gespeichert.', en: 'Project data saved.', tr: 'Proje verileri kaydedildi.' }));
            setTimeout(() => setSavedMsg(''), 3000);
        } catch {
            setErrorMsg(t({ de: 'Speichern fehlgeschlagen. Bitte erneut versuchen.', en: 'Save failed. Please try again.', tr: 'Kaydetme başarısız. Lütfen tekrar deneyin.' }));
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
            setSavedMsg(t({ de: 'Rolle aktualisiert.', en: 'Role updated.', tr: 'Rol güncellendi.' }));
            setTimeout(() => setSavedMsg(''), 2500);
        } catch {
            setErrorMsg(t({ de: 'Rolle konnte nicht geändert werden.', en: 'Could not change role.', tr: 'Rol değiştirilemedi.' }));
        }
    };

    const handleMemberRemove = async (memberId: string, memberName: string) => {
        if (!confirm(t({ de: `${memberName} wirklich aus dem Projekt entfernen?`, en: `Really remove ${memberName} from the project?`, tr: `${memberName} projeden kaldırılsın mı?` }))) return;
        try {
            setErrorMsg('');
            await removeMember(memberId);
            setSavedMsg(t({ de: 'Mitglied entfernt.', en: 'Member removed.', tr: 'Üye kaldırıldı.' }));
            setTimeout(() => setSavedMsg(''), 2500);
        } catch {
            setErrorMsg(t({ de: 'Mitglied konnte nicht entfernt werden.', en: 'Could not remove member.', tr: 'Üye kaldırılamadı.' }));
        }
    };

    const handleInviteByEmail = async () => {
        if (!activeCompany || !can('canManageUsers')) return;
        const normalizedEmail = inviteEmail.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            setErrorMsg(t({ de: 'Bitte eine gültige E-Mail-Adresse eingeben.', en: 'Please enter a valid email address.', tr: 'Lütfen geçerli bir e-posta adresi girin.' }));
            return;
        }

        try {
            setInviteLoading(true);
            setErrorMsg('');

            const user = await api.fetchUserByEmail(normalizedEmail);
            if (!user) {
                setErrorMsg(t({ de: 'Benutzer nicht gefunden. Bitte Benutzer zuerst anlegen und dann erneut zuweisen.', en: 'User not found. Please create the user first, then assign again.', tr: 'Kullanıcı bulunamadı. Lütfen önce kullanıcıyı oluşturun ve tekrar atayın.' }));
                return;
            }

            const alreadyAssigned = companyMembers.some(member => member.userId === user.id);
            if (alreadyAssigned) {
                setErrorMsg(t({ de: 'Dieser Benutzer ist dem Projekt bereits zugewiesen.', en: 'This user is already assigned to the project.', tr: 'Bu kullanıcı projeye zaten atanmış.' }));
                return;
            }

            await addMember(user.id, 'member');
            setInviteEmail('');
            setSavedMsg(t({ de: `Benutzer ${user.name} wurde als Member zugewiesen.`, en: `User ${user.name} has been assigned as member.`, tr: `${user.name} kullanıcısı üye olarak atandı.` }));
            setTimeout(() => setSavedMsg(''), 3000);
        } catch {
            setErrorMsg(t({ de: 'Benutzer konnte nicht zugewiesen werden. Bitte erneut versuchen.', en: 'Could not assign user. Please try again.', tr: 'Kullanıcı atanamadı. Lütfen tekrar deneyin.' }));
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
            setNotificationErrorMsg(t({ de: 'Keine Berechtigung zum Speichern der Benachrichtigungen.', en: 'No permission to save notifications.', tr: 'Bildirimleri kaydetme izniniz yok.' }));
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
            setNotificationSavedMsg(t({ de: 'Benachrichtigungs-Einstellungen gespeichert.', en: 'Notification settings saved.', tr: 'Bildirim ayarları kaydedildi.' }));
            setTimeout(() => setNotificationSavedMsg(''), 2500);
        } catch {
            setNotificationErrorMsg(t({ de: 'Speichern der Benachrichtigungen fehlgeschlagen.', en: 'Failed to save notifications.', tr: 'Bildirimler kaydedilemedi.' }));
        }
    };

    const handleSaveLanguage = () => {
        setLanguage(generalLanguage);
        setLanguageSavedMsg(t({ de: 'Sprache gespeichert.', en: 'Language saved.', tr: 'Dil kaydedildi.' }));
        setTimeout(() => setLanguageSavedMsg(''), 2500);
    };

    const tabs = [
        { id: 'general', label: t({ de: 'Allgemein', en: 'General', tr: 'Genel' }), icon: Settings },
        { id: 'subscription', label: t({ de: 'Abonnement', en: 'Subscription', tr: 'Abonelik' }), icon: CreditCard },
        { id: 'team', label: t({ de: 'Team-Übersicht', en: 'Team overview', tr: 'Takım genel bakışı' }), icon: Users },
        { id: 'integrations', label: t({ de: 'Integrationen', en: 'Integrations', tr: 'Entegrasyonlar' }), icon: Plug },
        { id: 'notifications', label: t({ de: 'Benachrichtigungen', en: 'Notifications', tr: 'Bildirimler' }), icon: Bell },
    ];
    const adminTabs = [
        ...((isSuperAdmin || activeCompanyRole === 'company_admin') ? [{ id: 'importexport', label: 'Import / Export', icon: FileJson }] : []),
        ...(can('canManageUsers') ? [{ id: 'admin', label: t({ de: 'Benutzerverwaltung', en: 'User management', tr: 'Kullanıcı Yönetimi' }), icon: Shield }] : []),
    ];

    return (
        <div className="animate-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">{t({ de: 'Einstellungen', en: 'Settings', tr: 'Ayarlar' })}</h1>
                    <p className="page-subtitle">{t({ de: 'Workspace- und Kontoeinstellungen verwalten', en: 'Manage workspace and account settings', tr: 'Çalışma alanı ve hesap ayarlarını yönetin' })}</p>
                </div>
                <PageHelp title={t({ de: 'Einstellungen & Benutzerverwaltung', en: 'Settings & user management', tr: 'Ayarlar ve kullanıcı yönetimi' })}>
                    <p><strong>{t({ de: 'Team-Zuweisung per E-Mail (Admin):', en: 'Team assignment via email (Admin):', tr: 'E-posta ile takım ataması (Yönetici):' })}</strong> {t({ de: 'Im Tab "Team-Übersicht" kannst du bestehende Benutzer per E-Mail dem aktiven Projekt zuweisen.', en: 'In the "Team overview" tab you can assign existing users to the active project via email.', tr: '"Takım genel bakışı" sekmesinde mevcut kullanıcıları e-posta ile aktif projeye atayabilirsiniz.' })}</p>
                    <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
                        <li>{t({ de: 'Es werden nur bereits angelegte Benutzer akzeptiert.', en: 'Only already created users are accepted.', tr: 'Yalnızca önceden oluşturulmuş kullanıcılar kabul edilir.' })}</li>
                        <li>{t({ de: 'Bei erfolgreicher Zuweisung wird automatisch die Rolle', en: 'On successful assignment, the role', tr: 'Başarılı atamada otomatik olarak' })} <strong>Member</strong> {t({ de: 'vergeben.', en: 'is automatically assigned.', tr: 'rolü verilir.' })}</li>
                        <li>{t({ de: 'Existiert die E-Mail nicht, erscheint eine Fehlermeldung mit Hinweis zur Benutzeranlage.', en: 'If the email does not exist, an error message with instructions for user creation appears.', tr: 'E-posta mevcut değilse, kullanıcı oluşturma talimatıyla bir hata mesajı görünür.' })}</li>
                        <li>{t({ de: 'Rollen können danach in der Teamliste angepasst werden.', en: 'Roles can be adjusted afterwards in the team list.', tr: 'Roller daha sonra takım listesinde ayarlanabilir.' })}</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}><strong>{t({ de: 'Benachrichtigungen:', en: 'Notifications:', tr: 'Bildirimler:' })}</strong></p>
                    <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                        <li>{t({ de: 'Im Tab "Benachrichtigungen" steuerst du, welche Notification-Typen im', en: 'In the "Notifications" tab you control which notification types appear in the', tr: '"Bildirimler" sekmesinde hangi bildirim türlerinin' })} <strong>{t({ de: 'Glocken-Symbol', en: 'bell icon', tr: 'zil simgesinde' })}</strong> {t({ de: '(oben rechts) angezeigt werden.', en: '(top right) are displayed.', tr: '(sağ üstte) görüntüleneceğini kontrol edersiniz.' })}</li>
                        <li>{t({ de: 'Deaktivierte Kategorien werden automatisch herausgefiltert - die Benachrichtigungen werden trotzdem gespeichert und können später wieder aktiviert werden.', en: 'Disabled categories are automatically filtered out - notifications are still saved and can be re-enabled later.', tr: 'Devre dışı bırakılan kategoriler otomatik olarak filtrelenir - bildirimler yine de kaydedilir ve daha sonra yeniden etkinleştirilebilir.' })}</li>
                        <li>{t({ de: 'Die Einstellungen gelten pro Projekt.', en: 'Settings apply per project.', tr: 'Ayarlar proje bazında geçerlidir.' })}</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}><strong>{t({ de: 'Import / Export (Admin):', en: 'Import / Export (Admin):', tr: 'İçe / Dışa Aktarma (Yönetici):' })}</strong></p>
                    <ul style={{ marginTop: '4px', paddingLeft: '18px' }}>
                        <li>{t({ de: 'Im Tab "Import / Export" können SuperAdmin und Projekt-Admin Projektdaten als JSON exportieren oder importieren.', en: 'In the "Import / Export" tab, SuperAdmin and Project Admin can export or import project data as JSON.', tr: '"İçe / Dışa Aktarma" sekmesinde SüperYönetici ve Proje Yöneticisi proje verilerini JSON olarak dışa veya içe aktarabilir.' })}</li>
                        <li>{t({ de: 'Der Import übernimmt Positionierung, Keywords und Budget-Kategorien.', en: 'Import takes over positioning, keywords, and budget categories.', tr: 'İçe aktarma konumlandırma, anahtar kelimeler ve bütçe kategorilerini devralır.' })}</li>
                        <li>{t({ de: 'Eine leere Vorlage kann über den "Vorlage (JSON)"-Button heruntergeladen werden.', en: 'An empty template can be downloaded via the "Template (JSON)" button.', tr: 'Boş bir şablon "Şablon (JSON)" butonu ile indirilebilir.' })}</li>
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
                                <div className="card-title">{t({ de: 'Projekt-Einstellungen', en: 'Company settings', tr: 'Proje ayarları' })}</div>
                                {(!can('canManageSettings') || !activeCompany) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        <Lock size={11} /> {!activeCompany ? t({ de: 'Kein Projekt ausgewählt', en: 'No company selected', tr: 'Proje seçilmedi' }) : t({ de: 'Nur-Lese-Modus', en: 'Read-only mode', tr: 'Salt okunur mod' })}
                                    </div>
                                )}
                            </div>
                            {activeCompany && (
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '12px',
                                }}>
                                    {t({ de: 'Aktives Projekt', en: 'Active company', tr: 'Aktif proje' })}: {activeCompany.name}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Projektname (Workspace-Name)', en: 'Company name (workspace name)', tr: 'Proje adı (çalışma alanı adı)' })}</label>
                                <input type="text" className="form-input" value={wsName} onChange={e => setWsName(e.target.value)} disabled={!can('canManageSettings') || !activeCompany} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Beschreibung', en: 'Description', tr: 'Açıklama' })}</label>
                                <textarea className="form-input form-textarea" value={wsDesc} onChange={e => setWsDesc(e.target.value)} disabled={!can('canManageSettings') || !activeCompany} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Standard-Währung', en: 'Default currency', tr: 'Varsayılan para birimi' })}</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>EUR (€)</option><option>USD ($)</option><option>CHF (CHF)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t({ de: 'Zeitzone', en: 'Timezone', tr: 'Saat dilimi' })}</label>
                                <select className="form-select" disabled={!can('canManageSettings') || !activeCompany}>
                                    <option>Europe/Berlin (UTC+1)</option>
                                    <option>Europe/Zurich (UTC+1)</option>
                                    <option>Europe/Vienna (UTC+1)</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">{t({ de: 'Anwendungssprache', en: 'Application language', tr: 'Uygulama dili' })}</label>
                                <select
                                    className="form-select"
                                    value={generalLanguage}
                                    onChange={(e) => setGeneralLanguage(e.target.value as AppLanguage)}
                                    style={{ maxWidth: '280px' }}
                                >
                                    <option value="de">Deutsch</option>
                                    <option value="en">English</option>
                                    <option value="tr">Türkçe</option>
                                </select>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                                    {t({ de: 'Wird benutzerspezifisch gespeichert und nach dem Login angewendet.', en: 'Saved per user and applied after login.', tr: 'Kullanıcıya özel kaydedilir ve girişten sonra uygulanır.' })}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">{t({ de: 'Erscheinungsbild', en: 'Theme', tr: 'Tema' })}</label>
                                <select
                                    className="form-select"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                                    style={{ maxWidth: '280px' }}
                                >
                                    <option value="light">{t({ de: 'Hell', en: 'Light', tr: 'Açık' })}</option>
                                    <option value="dark">{t({ de: 'Dunkel', en: 'Dark', tr: 'Koyu' })}</option>
                                </select>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                                    {t({ de: 'Wechsle zwischen hellem und dunklem Modus für angenehmes Arbeiten.', en: 'Choose between light and dark mode for comfortable viewing.', tr: 'Rahat bir görüntüleme için açık ve koyu mod arasında seçim yapın.' })}
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
                                    <button className="btn btn-secondary" onClick={handleDiscardSettings}>{t({ de: 'Verwerfen', en: 'Discard', tr: 'İptal' })}</button>
                                    <button className="btn btn-secondary" onClick={handleSaveLanguage} disabled={generalLanguage === language}>{t({ de: 'Sprache speichern', en: 'Save language', tr: 'Dili kaydet' })}</button>
                                    <button className="btn btn-primary" onClick={handleSaveSettings}>{t({ de: 'Speichern', en: 'Save', tr: 'Kaydet' })}</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Team-Übersicht ─── */}
                    {activeTab === 'team' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">{t({ de: 'Team-Mitglieder', en: 'Team members', tr: 'Takım üyeleri' })}</div>
                                    <div className="card-subtitle">{companyMembers.length} {t({ de: 'Mitglieder im aktiven Projekt', en: 'members in the active project', tr: 'aktif projedeki üyeler' })}</div>
                                </div>
                                {can('canManageUsers') && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder={t({ de: 'E-Mail für Zuweisung', en: 'Email for assignment', tr: 'Atama için e-posta' })}
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            style={{ minWidth: '260px' }}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={handleInviteByEmail} disabled={inviteLoading}>
                                            <Plus size={14} /> {inviteLoading ? t({ de: 'Prüfung...', en: 'Checking...', tr: 'Kontrol ediliyor...' }) : t({ de: 'Per E-Mail zuweisen', en: 'Assign via email', tr: 'E-posta ile ata' })}
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
                                    {t({ de: 'Nur vorhandene Benutzer können per E-Mail zugewiesen werden. Neue Zuweisungen erfolgen standardmäßig mit der Rolle Member.', en: 'Only existing users can be assigned via email. New assignments default to the Member role.', tr: 'Yalnızca mevcut kullanıcılar e-posta ile atanabilir. Yeni atamalar varsayılan olarak Üye rolüyle yapılır.' })}
                                </div>
                            )}
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{t({ de: 'Mitglied', en: 'Member', tr: 'Üye' })}</th>
                                            <th>{t({ de: 'Rolle', en: 'Role', tr: 'Rol' })}</th>
                                            <th>{t({ de: 'Status', en: 'Status', tr: 'Durum' })}</th>
                                            {can('canManageUsers') && <th>{t({ de: 'Aktionen', en: 'Actions', tr: 'Eylemler' })}</th>}
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
                                                                {member.userName || t({ de: 'Unbekannt', en: 'Unknown', tr: 'Bilinmiyor' })}
                                                                {isMe && (
                                                                    <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary-light)', fontWeight: 700 }}>{t({ de: 'Du', en: 'You', tr: 'Sen' })}</span>
                                                                )}
                                                                {member.userIsSuperAdmin && (
                                                                    <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>Super-Admin</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                                {member.userEmail || t({ de: 'Keine E-Mail', en: 'No email', tr: 'E-posta yok' })}
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
                                                            {member.userStatus === 'online' ? 'Online' : member.userStatus === 'away' ? t({ de: 'Abwesend', en: 'Away', tr: 'Uzakta' }) : 'Offline'}
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
                                                                title={isProtectedSuperAdmin ? t({ de: 'Super-Admin-Rollen dürfen nur von Super-Admins angepasst werden.', en: 'Super admin roles can only be adjusted by super admins.', tr: 'Süper yönetici rolleri yalnızca süper yöneticiler tarafından değiştirilebilir.' }) : ''}
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
                                                                    onClick={() => handleMemberRemove(member.id, member.userName || t({ de: 'Mitglied', en: 'Member', tr: 'Üye' }))}
                                                                    title={isProtectedSuperAdmin ? t({ de: 'Super-Admin darf nicht von Projekt-Admins entfernt werden.', en: 'Super admin cannot be removed by project admins.', tr: 'Süper yönetici, proje yöneticileri tarafından kaldırılamaz.' }) : ''}
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
                                        <div className="card-title">{t({ de: 'Integrationen', en: 'Integrations', tr: 'Entegrasyonlar' })}</div>
                                        <div className="card-subtitle">{t({ de: 'Verbinde deine Marketing-Tools', en: 'Connect your marketing tools', tr: 'Pazarlama araçlarınızı bağlayın' })}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>
                                    {t({ de: 'Klicke auf "Einrichtungsanleitung" bei einer verfügbaren Integration, um die notwendigen Schritte zu sehen. Integrationen mit "Bald verfügbar" sind für ein zukünftiges Release geplant.', en: 'Click "Setup guide" on an available integration to see the required steps. Integrations marked as "Coming Soon" are planned for a future release.', tr: 'Gerekli adımları görmek için mevcut bir entegrasyonda "Kurulum kılavuzu"na tıklayın. "Yakında" olarak işaretlenen entegrasyonlar gelecek bir sürüm için planlanmıştır.' })}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                                {INTEGRATIONS.map(integration => (
                                    <div key={integration.name} className="card" style={{ padding: '16px', opacity: integration.available ? 1 : 0.6 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                                background: 'var(--bg-elevated)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                                                border: '1px solid var(--border-color)',
                                            }}>
                                                {integration.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{integration.name}</span>
                                                    {integration.available ? (
                                                        <span className="badge" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                                                            {t({ de: 'Verfügbar', en: 'Available', tr: 'Mevcut' })}
                                                        </span>
                                                    ) : (
                                                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={10} /> {t({ de: 'Bald verfügbar', en: 'Coming soon', tr: 'Yakında' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    {integration.desc[language]}
                                                </p>
                                                {integration.available ? (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        style={{ marginTop: '8px' }}
                                                        onClick={() => setGuideModal(integration)}
                                                    >
                                                        <BookOpen size={12} />
                                                        {t({ de: 'Einrichtungsanleitung', en: 'Setup guide', tr: 'Kurulum kılavuzu' })}
                                                    </button>
                                                ) : (
                                                    <div style={{ marginTop: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                                        {t({ de: 'Diese Integration ist für ein zukünftiges Update geplant.', en: 'This integration is planned for a future update.', tr: 'Bu entegrasyon gelecek bir güncelleme için planlanmıştır.' })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Integration Guide Modal */}
                            {guideModal && (
                                <div
                                    style={{
                                        position: 'fixed', inset: 0, zIndex: 1000,
                                        background: 'rgba(0,0,0,0.5)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        padding: '24px',
                                    }}
                                    onClick={() => setGuideModal(null)}
                                >
                                    <div
                                        className="card"
                                        style={{ maxWidth: '560px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="card-header">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '24px' }}>{guideModal.icon}</span>
                                                <div>
                                                    <div className="card-title">{guideModal.name}</div>
                                                    <div className="card-subtitle">{t({ de: 'Einrichtungsanleitung', en: 'Setup instructions', tr: 'Kurulum talimatları' })}</div>
                                                </div>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setGuideModal(null)}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {guideModal.guide[language].map((step, idx) => (
                                                <li key={idx} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                        {guideModal.guide.docUrl && (
                                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                                <a
                                                    href={guideModal.guide.docUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}
                                                >
                                                    <ExternalLink size={14} />
                                                    {t({ de: 'Offizielle Dokumentation', en: 'Official documentation', tr: 'Resmi dokümantasyon' })}
                                                </a>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary" onClick={() => setGuideModal(null)}>
                                                {t({ de: 'Schließen', en: 'Close', tr: 'Kapat' })}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Benachrichtigungen ─── */}
                    {activeTab === 'notifications' && (
                        <div className="card animate-in">
                            <div className="card-header">
                                <div className="card-title">{t({ de: 'Benachrichtigungs-Einstellungen', en: 'Notification settings', tr: 'Bildirim ayarları' })}</div>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>
                                {t({ de: 'Diese Einstellungen steuern, welche Benachrichtigungen im', en: 'These settings control which notifications appear in the', tr: 'Bu ayarlar hangi bildirimlerin' })} <strong>{t({ de: 'Notification-Center', en: 'notification center', tr: 'bildirim merkezinde' })}</strong> {t({ de: '(Glocken-Symbol oben rechts) angezeigt werden. Deaktivierte Kategorien werden automatisch herausgefiltert.', en: '(bell icon, top right). Disabled categories are automatically filtered out.', tr: '(sağ üstteki zil simgesi) görüneceğini kontrol eder. Devre dışı bırakılan kategoriler otomatik olarak filtrelenir.' })}
                            </div>
                            {!activeCompany && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                                    {t({ de: 'Kein aktives Projekt ausgewählt.', en: 'No active project selected.', tr: 'Aktif proje seçilmedi.' })}
                                </div>
                            )}
                            {NOTIFICATION_SETTING_META.map((setting, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 0', borderBottom: idx < 5 ? '1px solid var(--border-color)' : 'none',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{t(setting.title)}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>{t(setting.desc)}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleNotificationSetting(setting.key)}
                                        disabled={!can('canManageSettings') || !activeCompany}
                                        aria-label={`${t(setting.title)} ${t({ de: 'umschalten', en: 'toggle', tr: 'değiştir' })}`}
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
                                    {t({ de: 'Einstellungen speichern', en: 'Save settings', tr: 'Ayarları kaydet' })}
                                </button>
                            </div>
                        </div>
                    )}


                    {/* ─── Abonnement / Subscription ─── */}
                    {activeTab === 'subscription' && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">{t({ de: 'Dein aktueller Plan', en: 'Your current plan', tr: 'Mevcut planınız' })}</div>
                                </div>
                                {subLoading ? (
                                    <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                        {t({ de: 'Wird geladen...', en: 'Loading...', tr: 'Yükleniyor...' })}
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
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{t({ de: 'Preis', en: 'Price', tr: 'Fiyat' })}</div>
                                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                                        {formatPrice(currentPlan.priceMonthly)}<span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>/{t({ de: 'Monat', en: 'month', tr: 'ay' })}</span>
                                                    </div>
                                                </div>
                                                <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{t({ de: 'Plätze', en: 'Seats', tr: 'Koltuklar' })}</div>
                                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                                        {companyMembers.length} / {currentPlan.maxSeats}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{t({ de: 'Projekte', en: 'Projects', tr: 'Projeler' })}</div>
                                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                                        {subscription?.currentProjects ?? 1} / {currentPlan.maxProjects}
                                                    </div>
                                                </div>
                                            </div>
                                            {subscription && (
                                                <div style={{ marginTop: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                    {t({ de: 'Abrechnungszyklus', en: 'Billing cycle', tr: 'Fatura döngüsü' })}: {subscription.billingCycle === 'yearly' ? t({ de: 'Jährlich', en: 'Yearly', tr: 'Yıllık' }) : t({ de: 'Monatlich', en: 'Monthly', tr: 'Aylık' })}
                                                    {subscription.currentPeriodEnd && (
                                                        <> · {t({ de: 'Nächste Verlängerung', en: 'Next renewal', tr: 'Sonraki yenileme' })}: {new Date(subscription.currentPeriodEnd).toLocaleDateString(language === 'en' ? 'en-US' : language === 'tr' ? 'tr-TR' : 'de-DE')}</>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                        {t({ de: 'Kein aktives Abonnement. Wähle unten einen Plan.', en: 'No active subscription. Choose a plan below.', tr: 'Aktif abonelik yok. Aşağıdan bir plan seçin.' })}
                                    </div>
                                )}
                            </div>
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">{t({ de: 'Verfügbare Pläne', en: 'Available plans', tr: 'Mevcut planlar' })}</div>
                                </div>
                                <PricingCards
                                    onSelect={async (plan) => {
                                        try {
                                            setErrorMsg('');
                                            await changePlan(plan.id);
                                            setSavedMsg(t({ de: 'Plan erfolgreich gewechselt.', en: 'Plan changed successfully.', tr: 'Plan başarıyla değiştirildi.' }));
                                            setTimeout(() => setSavedMsg(''), 3000);
                                        } catch {
                                            setErrorMsg(t({ de: 'Planwechsel fehlgeschlagen. Bitte erneut versuchen.', en: 'Failed to change plan. Please try again.', tr: 'Plan değişikliği başarısız. Lütfen tekrar deneyin.' }));
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
    const { t } = useLanguage();
    const { activeCompany } = useCompany();
    const { positioning, companyKeywords, budgetData } = useData();

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
            <h2 style={{ marginBottom: '4px' }}>Import / Export</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                {t({ de: 'Projekt-Daten exportieren oder aus einer JSON-Datei importieren. Nur für SuperAdmin und Projekt-Admin.', en: 'Export project data or import from a JSON file. Restricted to SuperAdmin and Project Admin.', tr: 'Proje verilerini dışa aktarın veya bir JSON dosyasından içe aktarın. Yalnızca SüperYönetici ve Proje Yöneticisi için.' })}
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

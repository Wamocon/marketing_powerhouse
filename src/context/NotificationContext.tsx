'use client';

import {
  createContext, useContext, useState, useCallback, useEffect, useMemo, useRef,
  type ReactNode,
} from 'react';
import type { AppNotification, NotificationType, NotificationSettingKey } from '../types';
import { NOTIFICATION_SETTING_TYPE_MAP } from '../types';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import * as api from '../lib/api';
import { supabase } from '../lib/supabase';

// ─── Notification Settings helpers ─────────────────────────

const NOTIFICATION_STORAGE_PREFIX = 'momentum_notification_settings';
const NOTIFICATION_SETTINGS_CHANGED_EVENT = 'momentum_notification_settings_changed';

interface NotificationSettings {
  campaignUpdates: boolean;
  budgetAlerts: boolean;
  taskReminders: boolean;
  teamActivities: boolean;
  weeklyReport: boolean;
  kpiAnomalies: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  campaignUpdates: true,
  budgetAlerts: true,
  taskReminders: true,
  teamActivities: false,
  weeklyReport: true,
  kpiAnomalies: false,
};

function loadSettings(storageKey: string): NotificationSettings {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      campaignUpdates: typeof parsed.campaignUpdates === 'boolean' ? parsed.campaignUpdates : DEFAULT_SETTINGS.campaignUpdates,
      budgetAlerts: typeof parsed.budgetAlerts === 'boolean' ? parsed.budgetAlerts : DEFAULT_SETTINGS.budgetAlerts,
      taskReminders: typeof parsed.taskReminders === 'boolean' ? parsed.taskReminders : DEFAULT_SETTINGS.taskReminders,
      teamActivities: typeof parsed.teamActivities === 'boolean' ? parsed.teamActivities : DEFAULT_SETTINGS.teamActivities,
      weeklyReport: typeof parsed.weeklyReport === 'boolean' ? parsed.weeklyReport : DEFAULT_SETTINGS.weeklyReport,
      kpiAnomalies: typeof parsed.kpiAnomalies === 'boolean' ? parsed.kpiAnomalies : DEFAULT_SETTINGS.kpiAnomalies,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function getStorageKey(companyId: string, userId: string): string {
  return `${NOTIFICATION_STORAGE_PREFIX}:${companyId}:${userId}`;
}

function mapPreferencesToSettings(
  preferences: Array<{ type: NotificationType; enabled: boolean }>,
): NotificationSettings {
  if (preferences.length === 0) return { ...DEFAULT_SETTINGS };

  const byType = new Map<NotificationType, boolean>(
    preferences.map(pref => [pref.type, pref.enabled]),
  );

  const result: NotificationSettings = { ...DEFAULT_SETTINGS };
  for (const [settingKey, types] of Object.entries(NOTIFICATION_SETTING_TYPE_MAP)) {
    const key = settingKey as NotificationSettingKey;
    const values = types
      .map(type => byType.has(type) ? byType.get(type) : undefined)
      .filter((value): value is boolean => typeof value === 'boolean');

    if (values.length > 0) {
      result[key] = values.every(Boolean);
    }
  }

  return result;
}

function isTypeEnabled(type: NotificationType, settings: NotificationSettings): boolean {
  for (const [settingKey, types] of Object.entries(NOTIFICATION_SETTING_TYPE_MAP)) {
    if (types.includes(type)) {
      return settings[settingKey as NotificationSettingKey] ?? true;
    }
  }
  // Types not mapped to any setting (e.g. system_alert, content_*) are always shown
  return true;
}

// ─── Context typing ────────────────────────────────────────

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  createNotification: (input: api.CreateNotificationInput) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { activeCompany } = useCompany();
  const userId = currentUser?.id ?? null;
  const companyId = activeCompany?.id ?? null;

  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevCompanyId = useRef<string | null>(null);

  const refreshSettings = useCallback(async () => {
    if (!companyId || !userId) {
      setSettings({ ...DEFAULT_SETTINGS });
      return;
    }

    try {
      const preferences = await api.fetchNotificationPreferences(userId, companyId);
      if (preferences.length > 0) {
        const nextSettings = mapPreferencesToSettings(preferences);
        setSettings(nextSettings);
        localStorage.setItem(getStorageKey(companyId, userId), JSON.stringify(nextSettings));
        return;
      }
    } catch (err) {
      console.warn('[NotificationContext] failed to load notification preferences from API, using local fallback.', err);
    }

    setSettings(loadSettings(getStorageKey(companyId, userId)));
  }, [companyId, userId]);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (!companyId || !userId) return;

    const storageKey = getStorageKey(companyId, userId);

    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setSettings(loadSettings(storageKey));
      }
    };

    const onSettingsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ companyId?: string; userId?: string }>;
      const detail = customEvent.detail;
      if (!detail || (detail.companyId === companyId && detail.userId === userId)) {
        setSettings(loadSettings(storageKey));
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(NOTIFICATION_SETTINGS_CHANGED_EVENT, onSettingsChanged as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(NOTIFICATION_SETTINGS_CHANGED_EVENT, onSettingsChanged as EventListener);
    };
  }, [companyId, userId]);

  // Filtered notifications (respects user settings)
  const notifications = useMemo(
    () => allNotifications.filter(n => isTypeEnabled(n.type, settings)),
    [allNotifications, settings],
  );
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ─── Fetch ─────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!userId || !companyId) {
      setAllNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.fetchNotifications(userId, companyId);
      setAllNotifications(data);
    } catch (err) {
      console.error('[NotificationContext] fetch error:', err);
      setAllNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId, companyId]);

  // ─── Realtime subscription ─────────────────────────────

  useEffect(() => {
    // Cleanup previous channel when company changes
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!userId || !companyId) return;

    // Initial load
    if (prevCompanyId.current !== companyId) {
      prevCompanyId.current = companyId;
      fetchAll();
    }

    // Subscribe to new notifications for this user
    const channel = supabase
      .channel(`notifications:${userId}:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: '*',
          table: 'notifications',
          filter: `recipient_user_id=eq.${userId}`,
        },
        () => {
          api.fetchNotifications(userId, companyId)
            .then(data => setAllNotifications(data))
            .catch(() => { /* silent */ });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: '*',
          table: 'notifications',
          filter: `recipient_user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch on updates (mark-as-read from another tab)
          api.fetchNotifications(userId, companyId)
            .then(data => setAllNotifications(data))
            .catch(() => { /* silent */ });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, companyId, fetchAll]);

  // ─── Actions ───────────────────────────────────────────

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setAllNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
    );
    try {
      await api.markNotificationRead(id);
    } catch (err) {
      console.error('[NotificationContext] markAsRead error:', err);
      // Revert on failure
      fetchAll();
    }
  }, [fetchAll]);

  const markAllAsRead = useCallback(async () => {
    if (!userId || !companyId) return;
    const now = new Date().toISOString();
    // Optimistic update
    setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: now })));
    try {
      await api.markAllNotificationsRead(userId, companyId);
    } catch (err) {
      console.error('[NotificationContext] markAllAsRead error:', err);
      fetchAll();
    }
  }, [userId, companyId, fetchAll]);

  const archive = useCallback(async (id: string) => {
    // Optimistic update
    setAllNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await api.archiveNotification(id);
    } catch (err) {
      console.error('[NotificationContext] archive error:', err);
      fetchAll();
    }
  }, [fetchAll]);

  const createNotif = useCallback(async (input: api.CreateNotificationInput) => {
    try {
      await api.createNotification(input);
      // The realtime subscription will pick it up, but also refresh just in case
      if (input.recipientUserId === userId) {
        fetchAll();
      }
    } catch (err) {
      console.error('[NotificationContext] create error:', err);
    }
  }, [userId, fetchAll]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        archiveNotification: archive,
        refreshNotifications: fetchAll,
        refreshSettings,
        createNotification: createNotif,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

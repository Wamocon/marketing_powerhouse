import { useMemo } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '@/components/NotificationItem';
import type { AppNotification } from '../types';
import type { AppLanguage, Translations } from '../context/LanguageContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onClose: () => void;
}

function groupByDate(notifications: AppNotification[], language: AppLanguage): { label: string; items: AppNotification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayLabel: Translations = { de: 'Heute', en: 'Today', tr: 'Bug\u00FCn' };
  const yesterdayLabel: Translations = { de: 'Gestern', en: 'Yesterday', tr: 'D\u00FCn' };

  const groups: Record<string, AppNotification[]> = {};
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (dDate.getTime() === today.getTime()) {
      label = todayLabel[language];
    } else if (dDate.getTime() === yesterday.getTime()) {
      label = yesterdayLabel[language];
    } else {
      const localeMap: Record<AppLanguage, string> = { de: 'de-DE', en: 'en-US', tr: 'tr-TR' };
      label = d.toLocaleDateString(localeMap[language], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  // Sort: Today first, then Yesterday, then dates descending
  const order = Object.keys(groups);
  order.sort((a, b) => {
    if (a === todayLabel[language]) return -1;
    if (b === todayLabel[language]) return 1;
    if (a === yesterdayLabel[language]) return -1;
    if (b === yesterdayLabel[language]) return 1;
    return 0;
  });

  return order.map(label => ({ label, items: groups[label] }));
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, archiveNotification } = useNotifications();
  const { language, t } = useLanguage();

  const groups = useMemo(() => groupByDate(notifications, language), [notifications, language]);

  return (
    <div className="notification-panel">
      {/* Header */}
      <div className="notification-panel-header">
        <span className="notification-panel-title">
          {t({ de: 'Benachrichtigungen', en: 'Notifications', tr: 'Bildirimler' })}
          {unreadCount > 0 && (
            <span className="notification-panel-count">{unreadCount}</span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => markAllAsRead()}
            title={t({ de: 'Alle als gelesen markieren', en: 'Mark all as read', tr: 'T\u00FCm\u00FCn\u00FC okundu olarak i\u015Faretle' })}
            style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckCheck size={14} /> {t({ de: 'Alle gelesen', en: 'Mark all read', tr: 'T\u00FCm\u00FC okundu' })}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="notification-panel-body">
        {notifications.length === 0 ? (
          <div className="notification-panel-empty">
            <Bell size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p>{t({ de: 'Keine Benachrichtigungen', en: 'No notifications', tr: 'Bildirim yok' })}</p>
            <span>{t({ de: 'Du bist auf dem neuesten Stand!', en: 'You are all caught up!', tr: 'Her \u015Fey tamam!' })}</span>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.label} className="notification-group">
              <div className="notification-group-label">{group.label}</div>
              {group.items.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                  onArchive={archiveNotification}
                  onNavigate={onClose}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

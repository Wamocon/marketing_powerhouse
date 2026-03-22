import { useMemo } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '@/components/NotificationItem';
import type { AppNotification } from '../types';
import type { AppLanguage } from '../context/LanguageContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onClose: () => void;
}

function groupByDate(notifications: AppNotification[], language: AppLanguage): { label: string; items: AppNotification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, AppNotification[]> = {};
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (dDate.getTime() === today.getTime()) {
      label = language === 'en' ? 'Today' : 'Heute';
    } else if (dDate.getTime() === yesterday.getTime()) {
      label = language === 'en' ? 'Yesterday' : 'Gestern';
    } else {
      label = d.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  // Sort: Heute first, then Gestern, then dates descending
  const order = Object.keys(groups);
  order.sort((a, b) => {
    const todayLabel = language === 'en' ? 'Today' : 'Heute';
    const yesterdayLabel = language === 'en' ? 'Yesterday' : 'Gestern';
    if (a === todayLabel) return -1;
    if (b === todayLabel) return 1;
    if (a === yesterdayLabel) return -1;
    if (b === yesterdayLabel) return 1;
    return 0;
  });

  return order.map(label => ({ label, items: groups[label] }));
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, archiveNotification } = useNotifications();
  const { language } = useLanguage();

  const groups = useMemo(() => groupByDate(notifications, language), [notifications, language]);

  return (
    <div className="notification-panel">
      {/* Header */}
      <div className="notification-panel-header">
        <span className="notification-panel-title">
          {language === 'en' ? 'Notifications' : 'Benachrichtigungen'}
          {unreadCount > 0 && (
            <span className="notification-panel-count">{unreadCount}</span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => markAllAsRead()}
            title={language === 'en' ? 'Mark all as read' : 'Alle als gelesen markieren'}
            style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckCheck size={14} /> {language === 'en' ? 'Mark all read' : 'Alle gelesen'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="notification-panel-body">
        {notifications.length === 0 ? (
          <div className="notification-panel-empty">
            <Bell size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p>{language === 'en' ? 'No notifications' : 'Keine Benachrichtigungen'}</p>
            <span>{language === 'en' ? 'You are all caught up!' : 'Du bist auf dem neuesten Stand!'}</span>
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

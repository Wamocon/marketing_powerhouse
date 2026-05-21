import type React from 'react';
import { useProjectRouter } from '../hooks/useProjectRouter';
import {
  Megaphone, DollarSign, Clock, UserPlus, ArrowRightLeft,
  Sparkles, FileCheck, ThumbsUp, Globe, Users, TrendingUp,
  BarChart3, AlertTriangle, X,
} from 'lucide-react';
import type { AppNotification, NotificationType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import type { AppLanguage } from '../context/LanguageContext';

interface Props {
  notification: AppNotification;
  onMarkRead: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onNavigate: () => void;
}

const ICON_MAP: Record<NotificationType, { icon: typeof Megaphone; color: string }> = {
  campaign_update:       { icon: Megaphone, color: '#10b981' },
  budget_alert:          { icon: DollarSign, color: '#f59e0b' },
  task_reminder:         { icon: Clock, color: '#ef4444' },
  task_assigned:         { icon: UserPlus, color: '#8b5cf6' },
  task_status_changed:   { icon: ArrowRightLeft, color: '#6366f1' },
  ai_generation_complete:{ icon: Sparkles, color: '#ec4899' },
  content_review:        { icon: FileCheck, color: '#14b8a6' },
  content_approved:      { icon: ThumbsUp, color: '#10b981' },
  content_published:     { icon: Globe, color: '#3b82f6' },
  team_activity:         { icon: Users, color: '#8b5cf6' },
  kpi_anomaly:           { icon: TrendingUp, color: '#ef4444' },
  weekly_report:         { icon: BarChart3, color: '#6366f1' },
  system_alert:          { icon: AlertTriangle, color: '#f59e0b' },
};

const PRIORITY_CLASSES: Record<string, string> = {
  low: '',
  normal: '',
  high: 'notification-item--high',
  urgent: 'notification-item--urgent',
};

function timeAgo(dateStr: string, language: AppLanguage): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    const m: Record<AppLanguage, string> = { de: 'gerade eben', en: 'just now', tr: 'az \u00F6nce' };
    return m[language];
  }
  if (minutes < 60) {
    const m: Record<AppLanguage, string> = {
      de: `vor ${minutes} Min.`,
      en: `${minutes}m ago`,
      tr: `${minutes} dakika \u00F6nce`,
    };
    return m[language];
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const m: Record<AppLanguage, string> = {
      de: `vor ${hours} Std.`,
      en: `${hours}h ago`,
      tr: `${hours} saat \u00F6nce`,
    };
    return m[language];
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    const m: Record<AppLanguage, string> = { de: 'gestern', en: 'yesterday', tr: 'd\u00FCn' };
    return m[language];
  }
  if (days < 7) {
    const m: Record<AppLanguage, string> = {
      de: `vor ${days} Tagen`,
      en: `${days}d ago`,
      tr: `${days} g\u00FCn \u00F6nce`,
    };
    return m[language];
  }
  const localeMap: Record<AppLanguage, string> = { de: 'de-DE', en: 'en-US', tr: 'tr-TR' };
  return new Date(dateStr).toLocaleDateString(localeMap[language], { day: '2-digit', month: '2-digit' });
}

export default function NotificationItem({ notification, onMarkRead, onArchive, onNavigate }: Props) {
  const router = useProjectRouter();
  const { language, t } = useLanguage();
  const { icon: Icon, color } = ICON_MAP[notification.type] ?? ICON_MAP.system_alert;
  const priorityClass = PRIORITY_CLASSES[notification.priority] ?? '';

  const handleClick = async () => {
    if (!notification.isRead) {
      await onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onNavigate();
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onArchive(notification.id);
  };

  return (
    <div
      className={`notification-item ${!notification.isRead ? 'notification-item--unread' : ''} ${priorityClass}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') handleClick(); }}
    >
      <div className="notification-item-icon" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={16} />
      </div>
      <div className="notification-item-content">
        <div className="notification-item-title">{notification.title}</div>
        {notification.body && (
          <div className="notification-item-body">{notification.body}</div>
        )}
        <div className="notification-item-time">{timeAgo(notification.createdAt, language)}</div>
      </div>
      <button
        className="notification-item-dismiss"
        onClick={handleArchive}
        title={t({ de: 'Entfernen', en: 'Remove', tr: 'Kald\u0131r' })}
      >
        <X size={14} />
      </button>
    </div>
  );
}

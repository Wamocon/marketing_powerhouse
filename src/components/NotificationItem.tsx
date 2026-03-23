import type React from 'react';
import { useCompanyRouter } from '../hooks/useCompanyRouter';
import {
  Megaphone, DollarSign, Clock, UserPlus, ArrowRightLeft,
  Sparkles, FileCheck, ThumbsUp, Globe, Users, TrendingUp,
  BarChart3, AlertTriangle, X,
} from 'lucide-react';
import type { AppNotification, NotificationType } from '../types';
import { useLanguage } from '../context/LanguageContext';

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

function timeAgo(dateStr: string, language: 'de' | 'en'): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return language === 'en' ? 'just now' : 'gerade eben';
  if (minutes < 60) return language === 'en' ? `${minutes}m ago` : `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === 'en' ? `${hours}h ago` : `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days === 1) return language === 'en' ? 'yesterday' : 'gestern';
  if (days < 7) return language === 'en' ? `${days}d ago` : `vor ${days} Tagen`;
  return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', { day: '2-digit', month: '2-digit' });
}

export default function NotificationItem({ notification, onMarkRead, onArchive, onNavigate }: Props) {
  const router = useCompanyRouter();
  const { language } = useLanguage();
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
        title={language === 'en' ? 'Remove' : 'Entfernen'}
      >
        <X size={14} />
      </button>
    </div>
  );
}

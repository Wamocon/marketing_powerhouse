import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from '@/components/NotificationPanel';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : '';

  return (
    <div className="notification-bell-wrapper">
      <button
        ref={btnRef}
        className="header-icon-btn"
        title={language === 'en' ? 'Notifications' : 'Benachrichtigungen'}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={`notification-badge ${unreadCount > 0 ? 'notification-badge--active' : ''}`}>
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="notification-panel-anchor">
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

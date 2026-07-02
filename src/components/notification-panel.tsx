'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bell,
  Shield,
  CheckCircle,
  Send,
  AlertTriangle,
  UserPlus,
  AtSign,
  Settings,
  X,
  CheckCheck,
  Check,
  BellOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Notification } from '@/lib/types';

type FilterTab = 'all' | 'unread' | 'mentions';

// ─── Relative time formatting (FR/EN) ─────────────────────────────────────
function getRelativeTime(timestamp: string, locale: 'fr' | 'en'): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === 'fr') {
    if (diffMinutes < 1) return "à l'instant";
    if (diffMinutes < 60) return `il y a ${diffMinutes}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  // English
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ─── Notification type icons (per spec) ────────────────────────────────────
function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'validation_requested':
      return <Shield className="h-4 w-4" />;
    case 'content_approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'content_published':
      return <Send className="h-4 w-4" />;
    case 'send_failed':
      return <AlertTriangle className="h-4 w-4" />;
    case 'new_assignment':
      return <UserPlus className="h-4 w-4" />;
    case 'comment_mention':
      return <AtSign className="h-4 w-4" />;
    case 'system':
      return <Settings className="h-4 w-4" />;
    // Legacy types (keep backward compat)
    case 'assignment':
      return <UserPlus className="h-4 w-4" />;
    case 'comment':
      return <AtSign className="h-4 w-4" />;
    case 'deadline':
      return <AlertTriangle className="h-4 w-4" />;
    case 'mention':
      return <AtSign className="h-4 w-4" />;
    case 'invitation':
      return <UserPlus className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

// ─── Notification type border colors (per spec) ────────────────────────────
function getNotificationBorderColor(type: Notification['type']) {
  switch (type) {
    case 'validation_requested':
      return 'border-l-[oklch(0.55_0.18_250)]';
    case 'content_approved':
      return 'border-l-emerald-500';
    case 'content_published':
      return 'border-l-cyan-500';
    case 'send_failed':
      return 'border-l-rose-500';
    case 'new_assignment':
      return 'border-l-amber-500';
    case 'comment_mention':
      return 'border-l-pink-500';
    case 'system':
      return 'border-l-slate-400';
    // Legacy
    case 'assignment':
      return 'border-l-amber-500';
    case 'comment':
      return 'border-l-cyan-500';
    case 'deadline':
      return 'border-l-rose-500';
    case 'mention':
      return 'border-l-pink-500';
    case 'invitation':
      return 'border-l-amber-500';
    default:
      return 'border-l-muted';
  }
}

function getNotificationIconBg(type: Notification['type']) {
  switch (type) {
    case 'validation_requested':
      return 'bg-[oklch(0.55_0.18_250/0.12)] text-[oklch(0.55_0.18_250)]';
    case 'content_approved':
      return 'bg-emerald-500/12 text-emerald-500';
    case 'content_published':
      return 'bg-cyan-500/12 text-cyan-500';
    case 'send_failed':
      return 'bg-rose-500/12 text-rose-500';
    case 'new_assignment':
      return 'bg-amber-500/12 text-amber-500';
    case 'comment_mention':
      return 'bg-pink-500/12 text-pink-500';
    case 'system':
      return 'bg-slate-400/12 text-slate-500';
    // Legacy
    case 'assignment':
      return 'bg-amber-500/12 text-amber-500';
    case 'comment':
      return 'bg-cyan-500/12 text-cyan-500';
    case 'deadline':
      return 'bg-rose-500/12 text-rose-500';
    case 'mention':
      return 'bg-pink-500/12 text-pink-500';
    case 'invitation':
      return 'bg-amber-500/12 text-amber-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

// ─── Group notifications by time ───────────────────────────────────────────
function groupNotifications(notifications: Notification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const groups: { label: 'today' | 'yesterday' | 'earlier'; items: Notification[] }[] = [
    { label: 'today', items: [] },
    { label: 'yesterday', items: [] },
    { label: 'earlier', items: [] },
  ];

  for (const notif of notifications) {
    const date = new Date(notif.timestamp);
    const notifDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notifDay.getTime() >= today.getTime()) {
      groups[0].items.push(notif);
    } else if (notifDay.getTime() >= yesterday.getTime()) {
      groups[1].items.push(notif);
    } else {
      groups[2].items.push(notif);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

// ─── Notification Item ─────────────────────────────────────────────────────
function NotificationItem({
  notification,
  onMarkRead,
  onRemove,
  locale,
  t,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
  locale: 'fr' | 'en';
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg border-l-[3px] cursor-pointer transition-colors',
        getNotificationBorderColor(notification.type),
        !notification.read
          ? 'bg-muted/40 hover:bg-muted/60'
          : 'hover:bg-muted/20'
      )}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
      }}
    >
      <div className={cn('rounded-lg p-2 flex-shrink-0 mt-0.5', getNotificationIconBg(notification.type))}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('text-sm font-medium leading-tight', !notification.read && 'font-semibold')}>
            {notification.title}
          </span>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.18_250)] flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-xs text-muted-foreground/60 mt-1 block">
          {getRelativeTime(notification.timestamp, locale)}
        </span>
      </div>

      {/* Hover action buttons */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-[oklch(0.55_0.18_250/0.1)] hover:text-[oklch(0.55_0.18_250)]"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
              toast.success(t.notificationPanel.markedAsRead);
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
            toast.success(t.notificationPanel.dismissed);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────
export function NotificationPanel() {
  const {
    notificationPanelOpen,
    setNotificationPanelOpen,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    removeNotification,
    locale,
  } = useAppStore(
    useShallow((s) => ({
      notificationPanelOpen: s.notificationPanelOpen,
      setNotificationPanelOpen: s.setNotificationPanelOpen,
      notifications: s.notifications,
      markAllNotificationsRead: s.markAllNotificationsRead,
      markNotificationRead: s.markNotificationRead,
      removeNotification: s.removeNotification,
      locale: s.locale,
    }))
  );
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const mentionCount = notifications.filter((n) => n.type === 'mention' || n.type === 'comment_mention').length;

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'mentions':
        return notifications.filter((n) => n.type === 'mention' || n.type === 'comment_mention');
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const grouped = groupNotifications(filteredNotifications);

  const groupLabels: Record<string, string> = {
    today: t.notificationPanel.today,
    yesterday: t.notificationPanel.yesterday,
    earlier: t.notificationPanel.earlier,
  };

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: t.notificationPanel.all, count: notifications.length },
    { key: 'unread', label: t.notificationPanel.unread, count: unreadCount },
    { key: 'mentions', label: t.notificationPanel.mentions, count: mentionCount },
  ];

  const allRead = unreadCount === 0;

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setNotificationPanelOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[oklch(0.55_0.18_250/0.12)] p-2">
                  <Bell className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{t.notificationPanel.title}</h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} {t.topbar.new}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-[oklch(0.55_0.18_250)] hover:text-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.55_0.18_250/0.08)] border border-[oklch(0.55_0.18_250/0.15)]"
                    onClick={() => {
                      markAllNotificationsRead();
                      toast.success(t.notificationPanel.allMarkedRead);
                    }}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {t.notificationPanel.markAllRead}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setNotificationPanelOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 border-b flex-shrink-0">
              <div className="flex items-center gap-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      activeFilter === tab.key
                        ? 'bg-[oklch(0.55_0.18_250/0.12)] text-[oklch(0.55_0.18_250)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                        activeFilter === tab.key
                          ? 'bg-[oklch(0.55_0.18_250/0.2)] text-[oklch(0.55_0.18_250)]'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <ScrollArea className="flex-1">
              <AnimatePresence mode="popLayout">
                {allRead && activeFilter === 'all' ? (
                  /* ─── All caught up / empty state ──────────────────── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 px-4"
                  >
                    <div className="relative mb-5">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.18_250/0.15)] to-emerald-500/15 flex items-center justify-center">
                        <BellOff className="h-9 w-9 text-[oklch(0.55_0.18_250)]" />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <p className="text-base font-semibold text-foreground">{t.notificationPanel.allCaughtUp}</p>
                    <p className="text-sm text-muted-foreground mt-1.5 text-center max-w-[240px]">{t.notificationPanel.allCaughtUpSubtitle}</p>
                  </motion.div>
                ) : grouped.length === 0 ? (
                  /* ─── Filter empty state ───────────────────────────── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      <Bell className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t.notificationPanel.noNotifications}</p>
                  </motion.div>
                ) : (
                  /* ─── Notification groups ──────────────────────────── */
                  <div className="p-4 space-y-4">
                    {grouped.map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-2.5 bg-muted/30 px-3 py-1.5 rounded-lg">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {groupLabels[group.label]}
                          </span>
                          <Badge variant="secondary" className="h-5 text-xs px-1.5 font-semibold">
                            {group.items.length}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <AnimatePresence mode="popLayout">
                            {group.items.map((notif) => (
                              <NotificationItem
                                key={notif.id}
                                notification={notif}
                                onMarkRead={markNotificationRead}
                                onRemove={removeNotification}
                                locale={locale}
                                t={t}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

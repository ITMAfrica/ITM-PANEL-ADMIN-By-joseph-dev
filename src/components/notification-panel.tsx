'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bell,
  CheckSquare,
  MessageSquare,
  Clock,
  AtSign,
  Mail,
  Info,
  X,
  CheckCheck,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Notification } from '@/lib/types';

type FilterTab = 'all' | 'unread' | 'mentions';

function getRelativeTime(timestamp: string, t: ReturnType<typeof useTranslation>['t']): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return t.activity.justNow;
  if (diffMinutes < 60) return `${diffMinutes}${t.activity.minutes} ${t.activity.ago}`;
  if (diffHours < 24) return `${diffHours}${t.activity.hours} ${t.activity.ago}`;
  return `${diffDays}${t.activity.days} ${t.activity.ago}`;
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'assignment':
      return <CheckSquare className="h-4 w-4" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4" />;
    case 'deadline':
      return <Clock className="h-4 w-4" />;
    case 'mention':
      return <AtSign className="h-4 w-4" />;
    case 'invitation':
      return <Mail className="h-4 w-4" />;
    case 'system':
      return <Info className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationBorderColor(type: Notification['type']) {
  switch (type) {
    case 'assignment':
      return 'border-l-teal-500';
    case 'comment':
      return 'border-l-cyan-500';
    case 'deadline':
      return 'border-l-amber-500';
    case 'mention':
      return 'border-l-pink-500';
    case 'invitation':
      return 'border-l-emerald-500';
    case 'system':
      return 'border-l-slate-400';
    default:
      return 'border-l-muted';
  }
}

function getNotificationIconBg(type: Notification['type']) {
  switch (type) {
    case 'assignment':
      return 'bg-teal-500/12 text-teal-500';
    case 'comment':
      return 'bg-cyan-500/12 text-cyan-500';
    case 'deadline':
      return 'bg-amber-500/12 text-amber-500';
    case 'mention':
      return 'bg-pink-500/12 text-pink-500';
    case 'invitation':
      return 'bg-emerald-500/12 text-emerald-500';
    case 'system':
      return 'bg-slate-400/12 text-slate-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

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

function NotificationItem({
  notification,
  onMarkRead,
  onRemove,
  t,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
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
            <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-[10px] text-muted-foreground/60 mt-1 block">
          {getRelativeTime(notification.timestamp, t)}
        </span>
      </div>

      {/* Hover action buttons */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-teal-500/10 hover:text-teal-500"
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

export function NotificationPanel() {
  const {
    notificationPanelOpen,
    setNotificationPanelOpen,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    removeNotification,
  } = useAppStore();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const mentionCount = notifications.filter((n) => n.type === 'mention').length;

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'mentions':
        return notifications.filter((n) => n.type === 'mention');
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
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-500/12 p-2">
                  <Bell className="h-4 w-4 text-teal-500" />
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
                    className="h-8 gap-1.5 text-xs text-teal-500 hover:text-teal-500 hover:bg-teal-500/8"
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
                        ? 'bg-teal-500/12 text-teal-600 dark:text-teal-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                        activeFilter === tab.key
                          ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
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
                {grouped.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 px-4"
                  >
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Bell className="h-8 w-8 text-teal-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{t.notificationPanel.allCaughtUp}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.notificationPanel.allCaughtUpSubtitle}</p>
                  </motion.div>
                ) : (
                  <div className="p-4 space-y-4">
                    {grouped.map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-2.5 bg-muted/30 px-3 py-1.5 rounded-lg">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {groupLabels[group.label]}
                          </span>
                          <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-semibold">
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

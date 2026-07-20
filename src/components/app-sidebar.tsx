'use client';

import { memo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Star,
  ChevronLeft,
  X,
  Bell,
} from 'lucide-react';
import type { PageId } from '@/lib/types';
import {
  ALL_NAV_ITEMS,
  HEADER_SECTION_NAV,
  getSectionForPage,
  getSectionItems,
  isDashboardSidebarPage,
  type SectionKey,
} from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardConnectionsNav, DashboardToolsNav } from '@/components/dashboard-sidebar-nav';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  pageId: PageId;
  badge?: string | number;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const NavItem = memo(function NavItem({
  icon,
  label,
  pageId,
  badge,
  active,
  collapsed,
  onClick,
}: NavItemProps) {
  const { t } = useTranslation();
  const isFavorite = useAppStore((s) => s.favorites.includes(pageId));

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    useAppStore.getState().toggleFavorite(pageId);
  };

  const content = (
    <div
      className={cn(
        'w-full flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative overflow-hidden min-h-[40px]',
        active
          ? 'bg-metricool-active text-white font-medium shadow-sm'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      {/* Favorite amber left border indicator */}
      {isFavorite && !active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-amber-400/70 rounded-r-full" />
      )}
      {/* Active left bar indicator — hidden in Metricool pill style */}
      <button
        type="button"
        onClick={onClick}
        className="flex-1 flex items-center gap-3 min-w-0 bg-transparent border-0 p-0 text-inherit text-sm cursor-pointer"
      >
        <span className={cn(
          'flex-shrink-0 transition-transform duration-150 group-hover:scale-105',
          active ? 'text-white' : ''
        )}>{icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{label}</span>
            {badge !== undefined && Number(badge) > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  'h-5 min-w-[20px] px-1.5 text-xs',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-sidebar-accent text-sidebar-foreground/60'
                )}
              >
                {badge}
              </Badge>
            )}
          </>
        )}
      </button>
      {!collapsed && (
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={cn(
            'shrink-0 h-5 w-5 rounded flex items-center justify-center transition-all duration-200',
            isFavorite
              ? 'text-amber-400 hover:text-amber-500'
              : cn(
                  'text-transparent group-hover:text-sidebar-foreground/30 hover:!text-amber-400',
                  active && 'group-hover:text-white/40 hover:!text-white/70'
                )
          )}
          aria-label={isFavorite ? t.sidebar.removeFromFavorites : t.sidebar.addToFavorites}
        >
          <Star className={cn('h-3 w-3', isFavorite && 'fill-current')} />
        </button>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="flex items-center gap-2 font-medium">
          {label}
          {isFavorite && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed?: boolean }) {
  if (collapsed) return null;
  return (
    <div className="px-3 pt-3 pb-1">
      <span className="text-sm uppercase tracking-wider font-semibold text-sidebar-foreground/45 flex items-center gap-1">
        {children}
      </span>
    </div>
  );
}

export function AppSidebar() {
  const {
    activePage,
    setActivePage,
    sidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    notifications,
    favorites,
    dashboardPlatform,
    setDashboardPlatform,
    dashboardTool,
    setDashboardTool,
  } = useAppStore(
    useShallow((s) => ({
      activePage: s.activePage,
      setActivePage: s.setActivePage,
      sidebarCollapsed: s.sidebarCollapsed,
      mobileSidebarOpen: s.mobileSidebarOpen,
      setMobileSidebarOpen: s.setMobileSidebarOpen,
      notifications: s.notifications,
      favorites: s.favorites,
      dashboardPlatform: s.dashboardPlatform,
      setDashboardPlatform: s.setDashboardPlatform,
      dashboardTool: s.dashboardTool,
      setDashboardTool: s.setDashboardTool,
    }))
  );
  const { t } = useTranslation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Helper to get translated nav label by pageId
  const getNavLabel = (pageId: string): string => {
    const key = pageId as keyof typeof t.nav;
    return t.nav[key] || pageId;
  };

  const activeSection = getSectionForPage(activePage);
  const sectionItems = activeSection ? getSectionItems(activeSection) : [];
  const visibleSectionItems = sectionItems.filter((i) => !favorites.includes(i.pageId));
  const favoriteItems = ALL_NAV_ITEMS.filter((i) => favorites.includes(i.pageId));

  const getSectionLabel = (key: SectionKey): string =>
    t.sidebar[key as keyof typeof t.sidebar] || key;

  const handleNavClick = useCallback(
    (pageId: PageId) => {
      setActivePage(pageId);
      setMobileSidebarOpen(false);
    },
    [setActivePage, setMobileSidebarOpen]
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {sidebarCollapsed && (
        <div className="px-2 py-2 flex-shrink-0 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => useAppStore.getState().setNotificationPanelOpen(true)}
                className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-sidebar-border/30 bg-sidebar-accent/30 text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/50 transition-all"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] flex items-center justify-center rounded-full bg-[oklch(0.55_0.18_250)] text-white text-xs font-bold px-0.5">
                      {unreadCount}
                    </span>
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[oklch(0.55_0.18_250)] opacity-30 animate-ping" />
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {t.notificationPanel.title} {unreadCount > 0 ? `(${unreadCount})` : ''}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Mobile section switcher — header icons hidden below lg */}
      <div className="lg:hidden px-2 py-2 flex-shrink-0 border-b border-sidebar-border/60">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {HEADER_SECTION_NAV.map(({ key, icon: Icon, defaultPage }) => {
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavClick(defaultPage)}
                title={getSectionLabel(key)}
                className={cn(
                  'flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-150',
                  isActive
                    ? 'bg-metricool-active text-white shadow-sm'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
                aria-label={getSectionLabel(key)}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-sidebar-border/60 flex-shrink-0" />

      {/* Scrollable Navigation — active header section only */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden px-2 py-2 [&>[data-radix-scroll-area-viewport]]:scrollbar-thin">
        {favoriteItems.length > 0 && (
          <>
            <SectionLabel collapsed={sidebarCollapsed}>{t.sidebar.pinned}</SectionLabel>
            <div className="space-y-0.5">
              {favoriteItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavItem
                    key={item.pageId}
                    icon={<Icon className="h-4 w-4" />}
                    label={getNavLabel(item.pageId)}
                    pageId={item.pageId}
                    active={activePage === item.pageId}
                    collapsed={sidebarCollapsed}
                    onClick={() => handleNavClick(item.pageId)}
                  />
                );
              })}
            </div>
          </>
        )}

        {isDashboardSidebarPage(activePage) ? (
          <DashboardConnectionsNav
            collapsed={sidebarCollapsed}
            activePlatform={dashboardPlatform}
            onPlatformChange={(platform) => {
              setDashboardPlatform(platform);
              if (activePage !== 'dashboard') handleNavClick('dashboard');
            }}
          />
        ) : (
          activeSection &&
          visibleSectionItems.length > 0 && (
            <>
              <SectionLabel collapsed={sidebarCollapsed}>
                {getSectionLabel(activeSection)}
              </SectionLabel>
              <div className="space-y-0.5">
                {visibleSectionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavItem
                      key={item.pageId}
                      icon={<Icon className="h-4 w-4" />}
                      label={getNavLabel(item.pageId)}
                      pageId={item.pageId}
                      active={activePage === item.pageId}
                      collapsed={sidebarCollapsed}
                      onClick={() => handleNavClick(item.pageId)}
                    />
                  );
                })}
              </div>
            </>
          )
        )}
      </ScrollArea>

      {isDashboardSidebarPage(activePage) && (
        <>
          <Separator className="bg-sidebar-border/60 flex-shrink-0" />
          <DashboardToolsNav
            collapsed={sidebarCollapsed}
            activeTool={dashboardTool}
            onToolChange={setDashboardTool}
            onNavigate={handleNavClick}
          />
        </>
      )}

      <Separator className="bg-sidebar-border/60" />

      {/* Collapse sidebar button */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={() => useAppStore.getState().setSidebarCollapsed(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground/70 transition-colors min-h-[36px]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{t.sidebar.collapseSidebar}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <TooltipProvider delayDuration={200}>
        {/* Desktop sidebar — below fixed top bar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col fixed left-0 top-24 bottom-0 z-40 transition-all duration-300 bg-sidebar',
            sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
          )}
        >
          {sidebarContent}
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="lg:hidden fixed left-0 top-24 bottom-0 w-[280px] z-50 shadow-2xl bg-sidebar"
              >
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </>
  );
}

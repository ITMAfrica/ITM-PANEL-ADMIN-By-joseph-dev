'use client';

import { Fragment, memo } from 'react';
import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import type { PublicationComposerType } from '@/lib/publication-composer';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bell,
  CircleUser,
  Menu,
  Moon,
  Sun,
  Plus,
  FileText,
  Target,
  Clock,
  Mail,
  Megaphone,
  ScrollText,
  Share2,
  Sparkles,
  AtSign,
  ListChecks,
  CalendarClock,
  AlertTriangle,
  Globe,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HEADER_SECTION_NAV,
  shouldShowAppSidebar,
  HEADER_PAGE_NAV,
  getSectionForPage,
  type SectionKey,
} from '@/lib/navigation';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { UserProfileMenuContent } from '@/components/user-profile-menu';
import { TOPBAR_MENU_SIDE_OFFSET } from '@/lib/topbar-layout';
import { AnimatedSectionNavIcon } from '@/components/icons/animated-section-nav-icon';
import { AnimatedCalendar } from '@/components/icons/animated-calendar';

/** Shared top-bar icon button layout — keeps center nav and right actions aligned. */
const topBarIconBtn = (...classes: Array<string | false | undefined>) =>
  cn(
    'inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg p-0 leading-none transition-all duration-150 [&_svg]:block [&_svg]:shrink-0',
    ...classes
  );

/** Top-bar nav button with a visible title beside its icon. */
const topBarLabelBtn = (...classes: Array<string | false | undefined>) =>
  cn(
    'inline-flex items-center justify-center h-9 shrink-0 rounded-lg px-2 leading-none transition-all duration-150 [&_svg]:block [&_svg]:shrink-0',
    ...classes
  );

const notificationTypeIcons: Record<string, React.ReactNode> = {
  assignment: <ListChecks className="h-3.5 w-3.5 text-[oklch(0.55_0.18_250)]" />,
  comment: <MessageSquare className="h-3.5 w-3.5 text-cyan-500" />,
  deadline: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  mention: <AtSign className="h-3.5 w-3.5 text-rose-500" />,
  invitation: <Mail className="h-3.5 w-3.5 text-[oklch(0.55_0.18_250)]" />,
  system: <Globe className="h-3.5 w-3.5 text-muted-foreground" />,
  validation_requested: <ListChecks className="h-3.5 w-3.5 text-[oklch(0.55_0.18_250)]" />,
  content_approved: <CheckCircle className="h-3.5 w-3.5 text-blue-500" />,
  content_published: <Globe className="h-3.5 w-3.5 text-cyan-500" />,
  send_failed: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />,
  new_assignment: <ListChecks className="h-3.5 w-3.5 text-amber-500" />,
  comment_mention: <AtSign className="h-3.5 w-3.5 text-rose-500" />,
};

// Role labels for user menu trigger subtitle
const AnimatedBell = memo(function AnimatedBell({ hasUnread }: { hasUnread: boolean }) {
  if (!hasUnread) {
    return <Bell className="h-4 w-4" />;
  }

  return (
    <motion.div
      animate={{
        rotate: [0, -12, 12, -8, 8, 0],
        y: [0, -3, 0, -2, 0],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 5,
        ease: 'easeInOut',
      }}
    >
      <Bell className="h-4 w-4" />
    </motion.div>
  );
});

export function TopBar() {
  const {
    activePage,
    notifications,
    setNotificationPanelOpen,
    setCreateWorkspaceDialogOpen,
    openPublicationComposer: openComposer,
    setActivePage,
    setMobileSidebarOpen,
    locale,
    setLocale,
    isApiLoading,
  } = useAppStore(
    useShallow((s) => ({
      activePage: s.activePage,
      notifications: s.notifications,
      setNotificationPanelOpen: s.setNotificationPanelOpen,
      setCreateWorkspaceDialogOpen: s.setCreateWorkspaceDialogOpen,
      openPublicationComposer: s.openPublicationComposer,
      setActivePage: s.setActivePage,
      setMobileSidebarOpen: s.setMobileSidebarOpen,
      locale: s.locale,
      setLocale: s.setLocale,
      isApiLoading: s.isApiLoading,
    }))
  );
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const last3Notifications = notifications.slice(0, 3);

  const getPageName = (page: string): string => {
    const key = page as keyof typeof t.nav;
    return t.nav[key] || page;
  };

  // Get section key for current page (settings has no header section)
  const sectionKey = getSectionForPage(activePage);
  const sectionName = sectionKey
    ? (t.topbar?.sections?.[sectionKey] || t.sidebar[sectionKey as keyof typeof t.sidebar] || sectionKey)
    : '';

  const getSectionLabel = (key: SectionKey): string =>
    t.topbar?.sections?.[key] || key;

  const openComposerWithType = (type?: PublicationComposerType) => {
    setActivePage('editorial-calendar');
    openComposer({ type });
  };

  const showMobileSidebar = shouldShowAppSidebar(activePage);

  const pageTitle =
    activePage === 'editorial-calendar' ? (
      <span>{getPageName(activePage)}</span>
    ) : sectionKey && activePage !== 'dashboard' ? (
      <>
        <span className="font-medium text-white/55">{sectionName}</span>
        <span className="mx-1.5 text-white/30" aria-hidden>
          ·
        </span>
        <span>{getPageName(activePage)}</span>
      </>
    ) : (
      getPageName(activePage)
    );

  const pageTitleLabel =
    activePage === 'editorial-calendar'
      ? getPageName(activePage)
      : sectionKey && activePage !== 'dashboard'
      ? `${sectionName} · ${getPageName(activePage)}`
      : getPageName(activePage);

  return (
    <TooltipProvider delayDuration={200}>
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-24 px-3 lg:px-4 bg-topbar text-topbar-foreground shadow-md">
      {/* Data loading indicator - thin bar at top */}
      <AnimatePresence>
        {isApiLoading && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 origin-left"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-1 items-center gap-2 lg:gap-3 min-w-0 overflow-hidden justify-start">
        {/* Mobile hamburger menu — home page only */}
        {showMobileSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo / brand + page title */}
        <div className="flex items-center gap-2.5 min-w-0 shrink">
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            className="flex shrink-0 items-center hover:opacity-90 transition-opacity"
            aria-label="ITM"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-pink-500 text-[9px] font-bold leading-none text-white shadow-sm">
              ITM
            </div>
          </button>
          <AnimatePresence mode="wait">
            <motion.p
              key={activePage}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="max-w-[min(100vw-14rem,12rem)] truncate text-sm font-semibold leading-none text-white/90 sm:max-w-[min(100vw-18rem,16rem)] lg:max-w-[min(100vw-22rem,14rem)] xl:max-w-[min(100vw-26rem,18rem)] 2xl:max-w-[min(100vw-32rem,20rem)]"
              title={pageTitleLabel}
            >
              {pageTitle}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Center section navigation — absolutely centered so side actions never collide */}
      <nav
        className="pointer-events-none hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center gap-8 xl:gap-10 2xl:gap-12 max-w-[min(100%,calc(100vw-8rem))] px-1.5 min-w-0 overflow-hidden"
        aria-label={getPageName(activePage)}
      >
        {HEADER_SECTION_NAV.map(({ key, defaultPage }) => {
          const isActive = sectionKey === key;
          return (
            <Fragment key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setActivePage(defaultPage)}
                    className={topBarLabelBtn(
                      'pointer-events-auto gap-1.5 text-xs font-medium',
                      isActive
                        ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                        : 'text-white/55 hover:text-white hover:bg-white/10'
                    )}
                    aria-label={getSectionLabel(key)}
                  >
                    <AnimatedSectionNavIcon sectionKey={key} isActive={isActive} />
                    <span className="hidden xl:inline whitespace-nowrap">{getSectionLabel(key)}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{getSectionLabel(key)}</TooltipContent>
              </Tooltip>
              {key === 'communication' &&
                HEADER_PAGE_NAV.map(({ pageId, icon: Icon }) => {
                  const isPageActive = activePage === pageId;
                  return (
                    <Tooltip key={pageId}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setActivePage(pageId)}
                          className={topBarLabelBtn(
                            'pointer-events-auto gap-1.5 text-xs font-medium',
                            isPageActive
                              ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                              : 'text-white/55 hover:text-white hover:bg-white/10'
                          )}
                          aria-label={getPageName(pageId)}
                        >
                          {pageId === 'editorial-calendar' ? (
                            <AnimatedCalendar isActive={isPageActive} />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                          <span className="hidden xl:inline whitespace-nowrap">{getPageName(pageId)}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{getPageName(pageId)}</TooltipContent>
                    </Tooltip>
                  );
                })}
            </Fragment>
          );
        })}
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-end gap-1 lg:gap-1.5 min-w-0 shrink-0 pl-2">
        {/* What's New sparkle button — only when there is room beside the CTA */}
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={topBarIconBtn(
                  'hidden 2xl:inline-flex text-amber-400 hover:text-amber-300 hover:bg-white/10'
                )}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.topbar.whatsNewTooltip}</TooltipContent>
        </Tooltip>

        {/* Gradient CTA — full label on wide screens */}
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="hidden 2xl:flex h-9 px-4 text-xs font-semibold metricool-gradient-cta shadow-md hover:shadow-lg transition-shadow shrink-0 whitespace-nowrap"
                onClick={() => openComposerWithType()}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                {t.topbar.newContent}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.topbar.newContent}</TooltipContent>
        </Tooltip>

        {/* Compact CTA — icon from sm until full label fits */}
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="hidden sm:flex 2xl:hidden h-9 w-9 shrink-0 metricool-gradient-cta shadow-md hover:shadow-lg transition-shadow"
                onClick={() => openComposerWithType()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.topbar.newContent}</TooltipContent>
        </Tooltip>

        {/* Quick create dropdown */}
        <DropdownMenu>
          <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-9 w-9 text-white/70 hover:text-white hover:bg-white/10',
                      'sm:hidden'
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t.topbar.quickCreate}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="end"
            sideOffset={TOPBAR_MENU_SIDE_OFFSET}
            className="w-52"
          >
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.55_0.18_250)]" />
              {t.topbar.quickCreate}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => openComposerWithType('newsletter')}>
              <Mail className="h-4 w-4 mr-2 text-[oklch(0.55_0.18_250)]" />
              {t.createContent.newsletter}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => openComposerWithType('article')}>
              <FileText className="h-4 w-4 mr-2 text-amber-500" />
              {t.createContent.article}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => openComposerWithType('announcement')}>
              <Megaphone className="h-4 w-4 mr-2 text-rose-500" />
              {t.createContent.announcement}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => openComposerWithType('communique')}>
              <ScrollText className="h-4 w-4 mr-2 text-violet-500" />
              {t.createContent.communique}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => openComposerWithType('social')}>
              <Share2 className="h-4 w-4 mr-2 text-[#1877F2]" />
              {t.createContent.social}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => openComposerWithType()}>
              <FileText className="h-4 w-4 mr-2 text-[oklch(0.55_0.18_250)]" />
              {t.topbar.newContent}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setActivePage('campaigns')}
            >
              <Target className="h-4 w-4 mr-2 text-amber-500" />
              {t.topbar.newCampaign}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setActivePage('scheduling')}
            >
              <Clock className="h-4 w-4 mr-2 text-rose-500" />
              {t.topbar.schedulePublish || t.topbar.scheduleSend}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-[oklch(0.55_0.18_250)]"
              onClick={() => setCreateWorkspaceDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.sidebar.createTenant || t.sidebar.createWorkspace}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language toggle — hidden on tablet to reduce clutter */}
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 text-xs font-bold hidden lg:flex text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              >
                {locale.toUpperCase()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{locale === 'fr' ? 'English' : 'Français'}</TooltipContent>
        </Tooltip>

        {/* Language toggle — compact on mobile & tablet */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
        >
          {locale.toUpperCase()}
        </Button>

        {/* Theme toggle */}
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={topBarIconBtn(
                  'relative text-white/70 hover:text-white hover:bg-white/10'
                )}
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.topbar.toggleTheme}</TooltipContent>
        </Tooltip>

        {/* Notification Bell with badge and pulse animation */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={topBarIconBtn('relative text-white/70 hover:text-white hover:bg-white/10')}
            >
              <AnimatedBell hasUnread={unreadCount > 0} />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Badge className="h-4 min-w-[16px] p-0 flex items-center justify-center text-xs bg-rose-500 text-white border-2 border-topbar">
                    {unreadCount}
                  </Badge>
                  {/* Pulse animation ring */}
                  <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                </motion.div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 rounded-xl border shadow-lg"
            sideOffset={TOPBAR_MENU_SIDE_OFFSET}
          >
            <div className="p-3 border-b bg-muted/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t.topbar.notifications}</h4>
                {unreadCount > 0 && (
                  <Badge className="h-5 px-1.5 text-xs bg-rose-500 text-white">
                    {unreadCount} {t.topbar.new}
                  </Badge>
                )}
              </div>
            </div>
            <div className="divide-y">
              {last3Notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-2.5 p-3 transition-colors',
                    !n.read ? 'bg-muted/20' : ''
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notificationTypeIcons[n.type] || <Bell className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs truncate', !n.read ? 'font-medium' : 'text-muted-foreground')}>
                      {n.title}
                    </p>
                    <p className="text-sm text-muted-foreground/70 truncate mt-0.5">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 border-t bg-muted/20 rounded-b-xl">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[oklch(0.55_0.18_250)] hover:text-[oklch(0.55_0.18_250)]"
                onClick={() => {
                  setNotificationPanelOpen(true);
                }}
              >
                {t.topbar.viewAll}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Workspace selector + user profile */}
        <div className="flex items-center gap-0.5 ml-1 lg:ml-1.5 pl-1 lg:pl-1.5 border-l border-white/15 shrink-0 min-w-0">
          <WorkspaceSelector />

        {/* User menu */}
        <DropdownMenu>
          <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={topBarIconBtn('text-white/70 hover:text-white hover:bg-white/10')}
                  >
                    <CircleUser className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t.topbar.profile}</TooltipContent>
          </Tooltip>
          <UserProfileMenuContent />
        </DropdownMenu>
        </div>
      </div>

      <div className="topbar-rainbow-line" aria-hidden />
    </header>
    </TooltipProvider>
  );
}

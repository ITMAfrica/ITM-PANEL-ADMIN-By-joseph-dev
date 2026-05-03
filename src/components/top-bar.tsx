'use client';

import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  Search,
  Bell,
  PanelLeftClose,
  PanelLeft,
  Menu,
  Command,
  Moon,
  Sun,
  LogOut,
  Settings,
  User,
  Plus,
  CheckSquare,
  FolderKanban,
  Video,
  ChevronRight,
  Sparkles,
  AtSign,
  ListChecks,
  CalendarClock,
  Mail,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { PageId } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const notificationTypeIcons: Record<string, React.ReactNode> = {
  assignment: <ListChecks className="h-3.5 w-3.5 text-[oklch(0.55_0.15_160)]" />,
  comment: <MessageSquare className="h-3.5 w-3.5 text-cyan-500" />,
  deadline: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  mention: <AtSign className="h-3.5 w-3.5 text-rose-500" />,
  invitation: <Mail className="h-3.5 w-3.5 text-[oklch(0.55_0.15_160)]" />,
  system: <Globe className="h-3.5 w-3.5 text-muted-foreground" />,
};

export function TopBar() {
  const {
    activePage,
    activeWorkspaceId,
    workspaces,
    sidebarCollapsed,
    toggleSidebar,
    setSearchOpen,
    notifications,
    setNotificationPanelOpen,
    setCreateWorkspaceDialogOpen,
    setCreateTaskDialogOpen,
    setCreateProjectDialogOpen,
    currentUser,
    logout,
    setMobileSidebarOpen,
    locale,
    setLocale,
    setActivePage,
    isApiLoading,
  } = useAppStore();
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const last3Notifications = notifications.slice(0, 3);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const getPageName = (page: string): string => {
    const key = page as keyof typeof t.nav;
    return t.nav[key] || page;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-md relative">
      {/* Gradient border-bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[oklch(0.55_0.15_160/0.4)] via-[oklch(0.55_0.15_160/0.1)] to-transparent" />

      {/* Data loading indicator - thin teal bar at top */}
      <AnimatePresence>
        {(isApiLoading || searchFocused) && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_160)] to-transparent origin-left"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Mobile hamburger menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop sidebar toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex h-8 w-8"
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {sidebarCollapsed ? t.topbar.expandSidebar : t.topbar.collapseSidebar}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Breadcrumb navigation */}
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <span onClick={() => setActivePage('dashboard')} className="flex items-center gap-1.5">
                  {activeWorkspace?.name || 'TeamFlow'}
                  <span className="inline-flex items-center px-1 py-0 rounded text-[8px] font-bold bg-[oklch(0.55_0.15_160/0.12)] text-[oklch(0.55_0.15_160)] leading-none">
                    {t.topbar.pro}
                  </span>
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                >
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {getPageName(activePage)}
                  </BreadcrumbPage>
                </motion.div>
              </AnimatePresence>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile page title */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={activePage}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="sm:hidden text-lg font-semibold"
          >
            {getPageName(activePage)}
          </motion.h1>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Search bar - wider with animated focus ring */}
        <motion.div
          animate={{
            width: searchFocused ? 320 : undefined,
          }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            className={cn(
              'hidden md:flex items-center gap-2 h-9 px-3 text-muted-foreground hover:text-foreground',
              'w-72 justify-start shadow-sm bg-muted/30',
              'transition-all duration-200',
              searchFocused && 'ring-2 ring-[oklch(0.55_0.15_160/0.3)] border-[oklch(0.55_0.15_160/0.3)]'
            )}
            onClick={() => setSearchOpen(true)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          >
            <span className="text-[10px] text-muted-foreground/50">✦</span>
            <Search className="h-4 w-4" />
            <span className="text-sm">{t.topbar.search}</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* What's New sparkle button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.topbar.whatsNewTooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Quick create dropdown - enhanced with teal ring on hover */}
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:ring-2 hover:ring-[oklch(0.55_0.15_160/0.3)] transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t.topbar.quickCreate}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.55_0.15_160)]" />
              {t.topbar.quickCreate}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setCreateTaskDialogOpen(true)}
            >
              <CheckSquare className="h-4 w-4 mr-2 text-[oklch(0.55_0.15_160)]" />
              {t.topbar.newTask}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setCreateProjectDialogOpen(true)}
            >
              <FolderKanban className="h-4 w-4 mr-2 text-amber-500" />
              {t.topbar.newProject}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setActivePage('meetings')}
            >
              <Video className="h-4 w-4 mr-2 text-rose-500" />
              {t.topbar.scheduleMeeting}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-[oklch(0.55_0.15_160)]"
              onClick={() => setCreateWorkspaceDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.sidebar.createWorkspace}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language toggle - icon only on mobile */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 text-xs font-bold hidden sm:flex"
                onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              >
                {locale.toUpperCase()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{locale === 'fr' ? 'English' : 'Français'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Mobile language toggle - icon only */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-9 w-9 text-xs font-bold"
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
        >
          {locale.toUpperCase()}
        </Button>

        {/* Theme toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.topbar.toggleTheme}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications with hover dropdown preview */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
            >
              <motion.div
                animate={unreadCount > 0 ? {
                  rotate: [0, -8, 8, -4, 4, 0],
                } : { rotate: 0 }}
                transition={unreadCount > 0 ? {
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'easeInOut',
                } : undefined}
              >
                <Bell className="h-4 w-4" />
              </motion.div>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] p-0 flex items-center justify-center text-[10px] bg-[oklch(0.55_0.15_160)] text-white border-2 border-background">
                    {unreadCount}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 rounded-xl border shadow-lg"
            sideOffset={8}
          >
            <div className="p-3 border-b bg-muted/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t.topbar.notifications}</h4>
                {unreadCount > 0 && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-[oklch(0.55_0.15_160)] text-white">
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
                    <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_160)] flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 border-t bg-muted/20 rounded-b-xl">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[oklch(0.55_0.15_160)] hover:text-[oklch(0.55_0.15_160)]"
                onClick={() => {
                  setNotificationPanelOpen(true);
                }}
              >
                {t.topbar.viewAll}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu - enhanced with online dot and separator */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2 ml-1.5 pl-1.5 border-l border-border hidden sm:flex">
              <div className="relative">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[oklch(0.55_0.15_160)] text-white text-xs">
                    {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                  </AvatarFallback>
                </Avatar>
                {/* Online status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-tight max-w-[120px] truncate">
                  {currentUser?.name || 'Alex Thompson'}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {currentUser?.role || t.topbar.admin}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[oklch(0.55_0.15_160)] text-white text-sm">
                  {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name || 'Alex Thompson'}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'alex@acmecorp.com'}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              {t.topbar.profile}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => useAppStore.getState().setActivePage('settings' as PageId)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t.topbar.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              {t.topbar.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile user avatar only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[oklch(0.55_0.15_160)] text-white text-xs">
                  {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[oklch(0.55_0.15_160)] text-white text-sm">
                  {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name || 'Alex Thompson'}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'alex@acmecorp.com'}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              {t.topbar.profile}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => useAppStore.getState().setActivePage('settings' as PageId)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t.topbar.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              {t.topbar.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

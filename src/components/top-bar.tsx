'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Command,
  Moon,
  Sun,
  LogOut,
  Settings,
  User,
  Plus,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function TopBar() {
  const {
    activePage,
    sidebarCollapsed,
    toggleSidebar,
    setSearchOpen,
    notifications,
    notificationCenterOpen,
    setNotificationCenterOpen,
    currentUser,
    logout,
  } = useAppStore();
  const { resolvedTheme, setTheme } = useTheme();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const pageNames: Record<string, string> = {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    projects: 'Projects',
    calendar: 'Calendar',
    messages: 'Messages',
    meetings: 'Meetings',
    files: 'Files',
    wiki: 'Wiki & Notes',
    activity: 'Activity',
    members: 'Members',
    teams: 'Teams',
    reports: 'Reports',
    automations: 'Automations',
    settings: 'Settings',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
              {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <h1 className="text-lg font-semibold hidden sm:block">
          {pageNames[activePage] || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search bar */}
        <Button
          variant="outline"
          className={cn(
            'hidden md:flex items-center gap-2 h-9 px-3 text-muted-foreground hover:text-foreground',
            'w-64 justify-start'
          )}
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Quick create */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quick create</TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <DropdownMenu open={notificationCenterOpen} onOpenChange={setNotificationCenterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[oklch(0.55_0.15_160)] text-white border-2 border-background">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 font-semibold text-sm flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.slice(0, 5).map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={cn(
                  'flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer',
                  !notif.read && 'bg-[oklch(0.55_0.15_160/0.05)]'
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium text-sm">{notif.title}</span>
                  {!notif.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_160)] ml-auto flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {notif.message}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-[oklch(0.55_0.15_160)] font-medium justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[oklch(0.55_0.15_160)] text-white text-xs">
                  {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {currentUser?.name || 'Alex Thompson'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => useAppStore.getState().setActivePage('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

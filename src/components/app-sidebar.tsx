'use client';

import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  BookOpen,
  Activity,
  Users,
  UserCircle,
  BarChart3,
  Zap,
  Settings,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  Plus,
  Hash,
  LogOut,
  X,
  Keyboard,
  Clock,
} from 'lucide-react';
import type { PageId } from '@/lib/types';
import { mockChannels, mockUsers } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface NavItemConfig {
  icon: React.ReactNode;
  label: string;
  pageId: PageId;
  badge?: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  pageId: PageId;
  badge?: string | number;
  active?: boolean;
  collapsed?: boolean;
  isFavorite?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, pageId, badge, active, collapsed, isFavorite, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  const content = (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative overflow-hidden min-h-[44px]',
        active
          ? 'bg-gradient-to-r from-[oklch(0.55_0.15_160/0.15)] to-[oklch(0.55_0.15_160/0.05)] text-[oklch(0.65_0.16_160)] font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      {/* Favorite amber left border indicator */}
      {isFavorite && !active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-amber-400/60 rounded-r-full" />
      )}
      {/* Active left bar indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[oklch(0.55_0.15_160)] rounded-r-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      {/* Hover left border animation */}
      {!active && hovered && !isFavorite && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[oklch(0.55_0.15_160/0.4)] rounded-r-full"
        />
      )}
      <span className={cn(
        'flex-shrink-0 transition-transform duration-150 group-hover:scale-110',
        active ? 'text-[oklch(0.55_0.15_160)]' : ''
      )}>{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge !== undefined && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[20px] px-1.5 text-[10px] bg-sidebar-accent text-sidebar-foreground/60"
            >
              {badge}
            </Badge>
          )}
          {isFavorite && (
            <Star className="h-3 w-3 text-amber-400 fill-amber-400 opacity-60" />
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="flex items-center gap-2 font-medium">
            {label}
            {isFavorite && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function SectionLabel({ children, collapsed, onClick, chevron }: { children: React.ReactNode; collapsed?: boolean; onClick?: () => void; chevron?: boolean }) {
  if (collapsed) return null;
  return (
    <div className="px-3 pt-4 pb-1">
      <button
        onClick={onClick}
        className={cn(
          'text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/30 flex items-center gap-1 w-full',
          onClick && 'hover:text-sidebar-foreground/50 transition-colors'
        )}
      >
        <span>{children}</span>
        {chevron && (
          <ChevronRight className={cn(
            'h-3 w-3 transition-transform duration-200',
          )} />
        )}
      </button>
    </div>
  );
}

const allNavItems: NavItemConfig[] = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', pageId: 'dashboard' },
  { icon: <CheckSquare className="h-4 w-4" />, label: 'Tasks', pageId: 'tasks', badge: 5 },
  { icon: <FolderKanban className="h-4 w-4" />, label: 'Projects', pageId: 'projects', badge: 6 },
  { icon: <Calendar className="h-4 w-4" />, label: 'Calendar', pageId: 'calendar' },
  { icon: <MessageSquare className="h-4 w-4" />, label: 'Messages', pageId: 'messages', badge: 11 },
  { icon: <Video className="h-4 w-4" />, label: 'Meetings', pageId: 'meetings', badge: 4 },
  { icon: <FileText className="h-4 w-4" />, label: 'Files', pageId: 'files' },
  { icon: <BookOpen className="h-4 w-4" />, label: 'Wiki', pageId: 'wiki' },
  { icon: <Activity className="h-4 w-4" />, label: 'Activity', pageId: 'activity' },
  { icon: <Users className="h-4 w-4" />, label: 'Members', pageId: 'members' },
  { icon: <UserCircle className="h-4 w-4" />, label: 'Teams', pageId: 'teams' },
  { icon: <BarChart3 className="h-4 w-4" />, label: 'Reports', pageId: 'reports' },
  { icon: <Zap className="h-4 w-4" />, label: 'Automations', pageId: 'automations' },
];

const mainPageIds: Set<string> = new Set(['dashboard', 'tasks', 'projects', 'calendar']);
const collabPageIds: Set<string> = new Set(['messages', 'meetings', 'files', 'wiki']);
const managePageIds: Set<string> = new Set(['activity', 'members', 'teams', 'reports', 'automations']);

export function AppSidebar() {
  const {
    activePage,
    setActivePage,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    sidebarCollapsed,
    favorites,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    recentItems,
    setCreateTaskDialogOpen,
    setCreateProjectDialogOpen,
  } = useAppStore();
  const { t } = useTranslation();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);

  // Helper to get translated nav label by pageId
  const getNavLabel = (pageId: string): string => {
    const key = pageId as keyof typeof t.nav;
    return t.nav[key] || pageId;
  };

  // Filter out favorited items from section listings to avoid duplication
  const mainItems = allNavItems.filter((i) => mainPageIds.has(i.pageId) && !favorites.includes(i.pageId));
  const collabItems = allNavItems.filter((i) => collabPageIds.has(i.pageId) && !favorites.includes(i.pageId));
  const manageItems = allNavItems.filter((i) => managePageIds.has(i.pageId) && !favorites.includes(i.pageId));
  const favoriteItems = allNavItems.filter((i) => favorites.includes(i.pageId));

  const channels = mockChannels.slice(0, 4);
  const onlineUsers = mockUsers.filter((u) => u.status === 'online');
  const awayUsers = mockUsers.filter((u) => u.status === 'away');
  const extraOnlineCount = onlineUsers.length > 5 ? onlineUsers.length - 5 : 0;

  // Recent items (last 3, matching nav items)
  const recentNavItems = recentItems
    .slice(0, 3)
    .map((pageId) => allNavItems.find((i) => i.pageId === pageId))
    .filter(Boolean) as NavItemConfig[];

  const handleNavClick = (pageId: PageId) => {
    setActivePage(pageId);
    useAppStore.getState().addRecentItem(pageId);
    setMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-screen bg-sidebar text-sidebar-foreground">
      {/* Workspace Switcher - with gradient background */}
      <div className="px-3 py-3 flex-shrink-0 bg-gradient-to-b from-sidebar-accent/50 to-transparent">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-sidebar-accent transition-colors',
                sidebarCollapsed && 'justify-center px-0'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm',
                  sidebarCollapsed && 'ring-2 ring-offset-1 ring-offset-sidebar'
                )}
                style={{
                  backgroundColor: activeWorkspace?.color || '#10b981',
                  ...(sidebarCollapsed ? { boxShadow: `0 0 0 2px var(--sidebar-background), 0 0 0 4px ${activeWorkspace?.color || '#10b981'}40` } : {}),
                }}
              >
                {activeWorkspace?.icon || '🏢'}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {activeWorkspace?.name || 'Workspace'}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0 rounded-full text-[9px] font-semibold bg-[oklch(0.55_0.15_160/0.15)] text-[oklch(0.55_0.15_160)]">
                        {t.topbar.pro}
                      </span>
                    </div>
                    <div className="text-[10px] text-sidebar-foreground/40">
                      {mockUsers.length} {t.sidebar.members}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40 flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">{t.sidebar.workspaces}</div>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: ws.color }}
                >
                  {ws.icon}
                </div>
                <span className="flex-1">{ws.name}</span>
                {ws.id === activeWorkspaceId && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_160)]" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[oklch(0.55_0.15_160)] cursor-pointer"
              onClick={() => useAppStore.getState().setCreateWorkspaceDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.sidebar.createWorkspace}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[oklch(0.55_0.15_160)]">
              <LogOut className="h-4 w-4 mr-2" />
              {t.sidebar.joinWorkspace}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Gradient border under workspace switcher */}
      <div className="bg-gradient-to-r from-[oklch(0.55_0.15_160/0.3)] via-[oklch(0.55_0.15_160/0.1)] to-transparent h-px" />

      {/* Search (in sidebar) */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2">
          <button
            onClick={() => useAppStore.getState().setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors border border-sidebar-border/30 bg-sidebar-accent/30"
          >
            <span className="text-sidebar-foreground/30 text-[10px]">✦</span>
            <Search className="h-3.5 w-3.5" />
            <span>{t.sidebar.search}</span>
            <kbd className="ml-auto text-[10px] border border-sidebar-border/50 rounded px-1">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-[10px] gap-1 text-sidebar-foreground/50 hover:text-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160/0.1)] border border-sidebar-border/20"
                    onClick={() => setCreateTaskDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                    {t.sidebar.quickTask}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>+ {t.sidebar.quickTask}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-[10px] gap-1 text-sidebar-foreground/50 hover:text-amber-500 hover:bg-amber-500/10 border border-sidebar-border/20"
                    onClick={() => setCreateProjectDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                    {t.sidebar.quickProject}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>+ {t.sidebar.quickProject}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-[10px] gap-1 text-sidebar-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 border border-sidebar-border/20"
                    onClick={() => setActivePage('meetings')}
                  >
                    <Plus className="h-3 w-3" />
                    {t.sidebar.quickMeeting}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>+ {t.sidebar.quickMeeting}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      <Separator className="bg-sidebar-border/50" />

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 px-2 py-1">
        {/* Favorites */}
        {favoriteItems.length > 0 && (
          <>
            <SectionLabel collapsed={sidebarCollapsed}>{t.sidebar.pinned}</SectionLabel>
            <div className="space-y-0.5">
              {favoriteItems.map((item) => (
                <NavItem
                  key={item.pageId}
                  icon={item.icon}
                  label={getNavLabel(item.pageId)}
                  pageId={item.pageId}
                  badge={item.badge}
                  active={activePage === item.pageId}
                  collapsed={sidebarCollapsed}
                  isFavorite={true}
                  onClick={() => handleNavClick(item.pageId)}
                />
              ))}
            </div>
          </>
        )}

        {/* Recent Section */}
        {recentNavItems.length > 0 && !sidebarCollapsed && (
          <>
            <SectionLabel collapsed={sidebarCollapsed}>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {t.sidebar.recent}
              </span>
            </SectionLabel>
            <div className="space-y-0.5">
              {recentNavItems.map((item) => (
                <button
                  key={`recent-${item.pageId}`}
                  onClick={() => handleNavClick(item.pageId)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 min-h-[36px]',
                    activePage === item.pageId
                      ? 'bg-[oklch(0.55_0.15_160/0.08)] text-[oklch(0.55_0.15_160)]'
                      : 'text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left truncate">{getNavLabel(item.pageId)}</span>
                  <Clock className="h-3 w-3 text-sidebar-foreground/20" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Main Navigation */}
        {mainItems.length > 0 && (
          <>
            <SectionLabel collapsed={sidebarCollapsed}>{t.sidebar.main}</SectionLabel>
            <div className="space-y-0.5">
              {mainItems.map((item) => (
                <NavItem
                  key={item.pageId}
                  icon={item.icon}
                  label={getNavLabel(item.pageId)}
                  pageId={item.pageId}
                  badge={item.badge}
                  active={activePage === item.pageId}
                  collapsed={sidebarCollapsed}
                  onClick={() => handleNavClick(item.pageId)}
                />
              ))}
            </div>
          </>
        )}

        {/* Collaboration */}
        {collabItems.length > 0 && (
          <>
            <SectionLabel collapsed={sidebarCollapsed}>{t.sidebar.collaborate}</SectionLabel>
            <div className="space-y-0.5">
              {collabItems.map((item) => (
                <NavItem
                  key={item.pageId}
                  icon={item.icon}
                  label={getNavLabel(item.pageId)}
                  pageId={item.pageId}
                  badge={item.badge}
                  active={activePage === item.pageId}
                  collapsed={sidebarCollapsed}
                  onClick={() => handleNavClick(item.pageId)}
                />
              ))}
            </div>
          </>
        )}

        {/* Channels (collapsible) */}
        {!sidebarCollapsed && (
          <>
            <SectionLabel
              chevron
              onClick={() => setChannelsCollapsed(!channelsCollapsed)}
            >
              <span className="flex items-center gap-1.5">
                {t.sidebar.channels}
                <ChevronDown className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  channelsCollapsed && '-rotate-90'
                )} />
              </span>
            </SectionLabel>
            <AnimatePresence initial={false}>
              {!channelsCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5">
                    {channels.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleNavClick('messages')}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 group min-h-[36px]',
                          'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <span className="relative">
                          <Hash className="h-3.5 w-3.5 text-sidebar-foreground/30" />
                          <span className="absolute -right-0.5 -top-0.5 w-1 h-1 rounded-full bg-[oklch(0.55_0.15_160/0)] group-hover:bg-[oklch(0.55_0.15_160/0.6)] transition-colors duration-200" />
                        </span>
                        <span className="flex-1 text-left truncate">{ch.name}</span>
                        {ch.unread > 0 && (
                          <Badge className="h-4 min-w-[16px] px-1 text-[9px] bg-[oklch(0.55_0.15_160)] text-white">
                            {ch.unread}
                          </Badge>
                        )}
                      </button>
                    ))}
                    {/* New channel button */}
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/50 min-h-[36px]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="truncate">{t.sidebar.newChannel}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Management */}
        {manageItems.length > 0 && (
          <>
            <SectionLabel collapsed={sidebarCollapsed}>{t.sidebar.manage}</SectionLabel>
            <div className="space-y-0.5">
              {manageItems.map((item) => (
                <NavItem
                  key={item.pageId}
                  icon={item.icon}
                  label={getNavLabel(item.pageId)}
                  pageId={item.pageId}
                  active={activePage === item.pageId}
                  collapsed={sidebarCollapsed}
                  onClick={() => handleNavClick(item.pageId)}
                />
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      <Separator className="bg-sidebar-border/50" />

      {/* Settings */}
      <div className="px-2 py-2 flex-shrink-0">
        <NavItem
          icon={<Settings className="h-4 w-4" />}
          label={t.nav.settings}
          pageId="settings"
          active={activePage === 'settings'}
          collapsed={sidebarCollapsed}
          onClick={() => handleNavClick('settings')}
        />
      </div>

      {/* Separator above shortcuts hint */}
      <div className="mx-3 border-t border-sidebar-border/30" />

      {/* Keyboard Shortcuts hint */}
      <div className="px-3 py-2 flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => useAppStore.getState().setShortcutsHelpOpen(true)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground/70 transition-colors border border-sidebar-border/30 min-h-[36px]',
                  sidebarCollapsed && 'justify-center px-0'
                )}
              >
                <Keyboard className="h-3.5 w-3.5" />
                {!sidebarCollapsed && (
                  <>
                    <span>{t.shortcuts.title}</span>
                    <kbd className="ml-auto text-[10px] border border-sidebar-border/50 rounded px-1">?</kbd>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>{t.shortcuts.title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator className="bg-sidebar-border/50" />

      {/* Online users indicator with status text */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-3 pt-2">
          <div className="flex items-center">
            {/* Stacked avatars with overlap */}
            <div className="flex items-center">
              {onlineUsers.slice(0, 5).map((user, idx) => (
                <TooltipProvider key={user.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative" style={{ marginLeft: idx === 0 ? 0 : '-6px', zIndex: 5 - idx }}>
                        <Avatar className="h-6 w-6 border-2 border-sidebar">
                          <AvatarFallback className="text-[8px] bg-sidebar-accent text-sidebar-foreground">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-sidebar" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{user.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {/* +N indicator for more users */}
              {extraOnlineCount > 0 && (
                <div
                  className="relative flex items-center justify-center h-6 w-6 rounded-full bg-sidebar-accent text-[9px] font-medium text-sidebar-foreground/60 border-2 border-sidebar"
                  style={{ marginLeft: '-6px', zIndex: 0 }}
                >
                  +{extraOnlineCount}
                </div>
              )}
            </div>
            <span className="text-[10px] text-sidebar-foreground/40 ml-2 flex items-center gap-1.5">
              {/* Pulsing green dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {onlineUsers.length} {t.sidebar.onlineCount}{awayUsers.length} {t.sidebar.awayCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 border-r border-sidebar-border/30',
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 shadow-2xl"
            >
              {/* Close button for mobile */}
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
    </>
  );
}

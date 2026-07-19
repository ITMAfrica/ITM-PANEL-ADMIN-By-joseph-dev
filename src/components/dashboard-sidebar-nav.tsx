'use client';

import { memo, useCallback } from 'react';
import {
  ClipboardList,
  Plus,
  BarChart3,
  FileBarChart,
  Hash,
  SlidersHorizontal,
  Gem,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import type { PageId } from '@/lib/types';
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  LinkedInIcon,
} from '@/components/social/platform-icons';

export type DashboardPlatform =
  | 'summary'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin';

export type DashboardTool = 'reports' | 'hashtag' | 'messageSettings' | 'documentation';

interface DashboardSidebarNavProps {
  collapsed?: boolean;
  activePlatform: DashboardPlatform;
  onPlatformChange: (platform: DashboardPlatform) => void;
  activeTool?: DashboardTool | null;
  onToolChange?: (tool: DashboardTool) => void;
  onNavigate?: (pageId: PageId) => void;
}

interface ConnectionItem {
  id: DashboardPlatform;
  labelKey: 'summary' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  icon: React.ReactNode;
  brandColor?: string;
  connected: boolean;
  premium?: boolean;
}

const CONNECTIONS: ConnectionItem[] = [
  {
    id: 'summary',
    labelKey: 'summary',
    icon: <ClipboardList className="h-4 w-4" />,
    connected: true,
  },
  {
    id: 'facebook',
    labelKey: 'facebook',
    icon: <FacebookIcon className="h-4 w-4" />,
    brandColor: '#1877F2',
    connected: true,
  },
  {
    id: 'instagram',
    labelKey: 'instagram',
    icon: <InstagramIcon className="h-4 w-4" />,
    brandColor: '#E4405F',
    connected: false,
  },
  {
    id: 'tiktok',
    labelKey: 'tiktok',
    icon: <TikTokIcon className="h-4 w-4" />,
    brandColor: '#000000',
    connected: false,
  },
  {
    id: 'youtube',
    labelKey: 'youtube',
    icon: <YouTubeIcon className="h-4 w-4" />,
    brandColor: '#FF0000',
    connected: false,
  },
  {
    id: 'linkedin',
    labelKey: 'linkedin',
    icon: <LinkedInIcon className="h-4 w-4" />,
    brandColor: '#0A66C2',
    connected: false,
    premium: true,
  },
];

const ConnectionNavItem = memo(function ConnectionNavItem({
  item,
  label,
  active,
  collapsed,
  onClick,
}: {
  item: ConnectionItem;
  label: string;
  active: boolean;
  collapsed?: boolean;
  onClick: () => void;
}) {
  const content = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 min-h-[40px]',
        active
          ? 'bg-metricool-active text-white font-medium shadow-sm'
          : item.premium
            ? 'bg-amber-50/80 text-sidebar-foreground/90 hover:bg-amber-50 dark:bg-amber-500/10 dark:hover:bg-amber-500/15'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      <span
        className={cn(
          'flex-shrink-0',
          active ? 'text-white' : item.brandColor ? '' : 'text-sidebar-foreground/70'
        )}
        style={!active && item.brandColor ? { color: item.brandColor } : undefined}
      >
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {!item.connected && !item.premium && (
            <span className="shrink-0 h-5 w-5 flex items-center justify-center rounded-full text-sidebar-foreground/35">
              <Plus className="h-3.5 w-3.5" />
            </span>
          )}
          {item.premium && (
            <span className="shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-amber-400 text-amber-950">
              <Gem className="h-3 w-3" />
            </span>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

const ToolNavItem = memo(function ToolNavItem({
  icon,
  label,
  active,
  collapsed,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  const content = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 min-h-[40px]',
        active
          ? 'bg-metricool-active text-white font-medium shadow-sm'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      <span className={cn('flex-shrink-0', active ? 'text-white' : 'text-sidebar-foreground/70')}>
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge && (
            <Badge className="h-5 px-1.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 border-emerald-500/25 hover:bg-emerald-500/15">
              {badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
          {badge ? ` (${badge})` : ''}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

export function DashboardConnectionsNav({
  collapsed,
  activePlatform,
  onPlatformChange,
}: Pick<DashboardSidebarNavProps, 'collapsed' | 'activePlatform' | 'onPlatformChange'>) {
  const { t } = useTranslation();
  const ds = t.dashboardSidebar;

  return (
    <div className="space-y-0.5">
      {CONNECTIONS.map((item) => (
        <ConnectionNavItem
          key={item.id}
          item={item}
          label={ds.connections[item.labelKey]}
          active={activePlatform === item.id}
          collapsed={collapsed}
          onClick={() => onPlatformChange(item.id)}
        />
      ))}
    </div>
  );
}

export function DashboardToolsNav({
  collapsed,
  activeTool,
  onToolChange,
  onNavigate,
}: Pick<DashboardSidebarNavProps, 'collapsed' | 'activeTool' | 'onToolChange' | 'onNavigate'>) {
  const { t } = useTranslation();
  const ds = t.dashboardSidebar;

  const handleToolClick = useCallback(
    (tool: DashboardTool, pageId?: PageId) => {
      onToolChange?.(tool);
      if (pageId) onNavigate?.(pageId);
    },
    [onToolChange, onNavigate]
  );

  return (
    <div className="flex-shrink-0 space-y-0.5 px-2 py-2">
      <ToolNavItem
        icon={<BarChart3 className="h-4 w-4" />}
        label={ds.tools.reports}
        active={activeTool === 'reports'}
        collapsed={collapsed}
        badge={ds.newBadge}
        onClick={() => handleToolClick('reports', 'reports')}
      />
      <ToolNavItem
        icon={<Hash className="h-4 w-4" />}
        label={ds.tools.hashtagTracker}
        active={activeTool === 'hashtag'}
        collapsed={collapsed}
        onClick={() => handleToolClick('hashtag')}
      />
      <ToolNavItem
        icon={<SlidersHorizontal className="h-4 w-4" />}
        label={ds.tools.messageSettings}
        active={activeTool === 'messageSettings'}
        collapsed={collapsed}
        onClick={() => handleToolClick('messageSettings', 'settings')}
      />
      <ToolNavItem
        icon={<BookOpen className="h-4 w-4" />}
        label={ds.tools.documentation}
        active={activeTool === 'documentation'}
        collapsed={collapsed}
        onClick={() => handleToolClick('documentation', 'documentation')}
      />
    </div>
  );
}

export function useDashboardSidebarState() {
  const activePlatform = useAppStore((s) => s.dashboardPlatform);
  const setDashboardPlatform = useAppStore((s) => s.setDashboardPlatform);
  const activeTool = useAppStore((s) => s.dashboardTool);
  const setDashboardTool = useAppStore((s) => s.setDashboardTool);

  return {
    activePlatform,
    setDashboardPlatform,
    activeTool,
    setDashboardTool,
  };
}

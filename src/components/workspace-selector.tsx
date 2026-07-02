'use client';

import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { WorkspaceIcon } from '@/lib/workspace-icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus } from 'lucide-react';
import { TOPBAR_MENU_SIDE_OFFSET } from '@/lib/topbar-layout';

export function WorkspaceSelector() {
  const { tenants, activeTenantId, setActiveTenant, setCreateWorkspaceDialogOpen } = useAppStore(
    useShallow((s) => ({
      tenants: s.tenants,
      activeTenantId: s.activeTenantId,
      setActiveTenant: s.setActiveTenant,
      setCreateWorkspaceDialogOpen: s.setCreateWorkspaceDialogOpen,
    }))
  );
  const { t } = useTranslation();

  const activeTenant = tenants.find((tn) => tn.id === activeTenantId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-9 hover:bg-white/10 gap-1.5 px-2 min-w-0',
            'max-w-[120px] sm:max-w-[140px] lg:max-w-[160px] xl:max-w-[200px]'
          )}
          title={activeTenant?.name ?? t.sidebar.noWorkspace}
        >
          <span
            className={cn(
              'flex-1 text-left min-w-0 text-sm font-medium truncate text-white',
              !activeTenant && 'text-white/50'
            )}
          >
            {activeTenant?.name ?? t.sidebar.noWorkspace}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-white/40 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={TOPBAR_MENU_SIDE_OFFSET}
        className="w-56"
      >
        {tenants.length === 0 && (
          <div className="px-2 py-2 text-xs text-muted-foreground">
            {t.sidebar.noWorkspace}
          </div>
        )}
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => setActiveTenant(tenant.id)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: tenant.color }}
            >
              <WorkspaceIcon icon={tenant.icon} className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="truncate block">{tenant.name}</span>
              <span className="text-xs text-muted-foreground">{tenant.country}</span>
            </div>
            {tenant.id === activeTenantId && (
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.18_250)]" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-[oklch(0.55_0.18_250)] cursor-pointer"
          onClick={() => setCreateWorkspaceDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.sidebar.createWorkspace}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

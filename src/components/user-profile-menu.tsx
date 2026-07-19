'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { TOPBAR_MENU_SIDE_OFFSET } from '@/lib/topbar-layout';

const ICON_BLUE = 'text-[oklch(0.55_0.18_250)]';

function MenuIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center', ICON_BLUE)}>
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

const menuItemClass =
  'cursor-pointer rounded-none px-3 py-2.5 text-sm gap-3 focus:text-foreground';

interface ProfileMenuItemProps {
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}

function ProfileMenuItem({
  label,
  icon,
  destructive,
  onClick,
}: ProfileMenuItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        menuItemClass,
        destructive && 'text-destructive focus:text-destructive focus:bg-destructive/10'
      )}
      onClick={onClick}
    >
      {icon}
      <span className="flex-1">{label}</span>
    </DropdownMenuItem>
  );
}

export function UserProfileMenuContent() {
  const setActivePage = useAppStore((s) => s.setActivePage);
  const logout = useAppStore((s) => s.logout);
  const { t } = useTranslation();
  const m = t.topbar.userMenu;

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={TOPBAR_MENU_SIDE_OFFSET}
      className="w-72 p-0 overflow-hidden"
    >
      {/* Section 1 — Brands */}
      <ProfileMenuItem
        label={m.brandSettings}
        icon={<MenuIcon icon={Settings} />}
        onClick={() => setActivePage('tenants')}
      />

      <DropdownMenuSeparator className="my-0" />

      {/* Section 2 — Account & workspace */}
      <ProfileMenuItem
        label={m.accountSettings}
        icon={<MenuIcon icon={Settings} />}
        onClick={() => setActivePage('settings')}
      />

      <DropdownMenuSeparator className="my-0" />

      {/* Logout */}
      <ProfileMenuItem
        label={t.topbar.signOut}
        icon={
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-destructive">
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </span>
        }
        destructive
        onClick={logout}
      />
    </DropdownMenuContent>
  );
}

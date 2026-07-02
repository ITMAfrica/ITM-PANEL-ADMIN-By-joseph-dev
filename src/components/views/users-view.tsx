'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Filter } from 'lucide-react';
import { roleColors } from '@/lib/ui-constants';
import { useUsers } from '@/hooks/use-users';
import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  BrandPrimaryButton,
  ViewOutlineButton,
  ViewStatGrid,
  ViewStatCard,
  ViewFilterRow,
  FilterChip,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableCheckboxHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableCheckboxCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';
import { WorkspaceIcon } from '@/lib/workspace-icons';
import type { UserRole, UserStatus } from '@/lib/types';

const roleLabelKeys: Record<UserRole, string> = {
  super_admin: 'superAdmin',
  tenant_admin: 'tenantAdmin',
  editor: 'editor',
  contributor: 'contributor',
  reader: 'reader',
};

const statusColors: Record<UserStatus, { bg: string; text: string; border: string }> = {
  online: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  away: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  busy: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
  offline: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
};

function getStatusLabel(status: UserStatus, locale: 'fr' | 'en'): string {
  const labels: Record<UserStatus, Record<'fr' | 'en', string>> = {
    online: { fr: 'En ligne', en: 'Online' },
    away: { fr: 'Absent', en: 'Away' },
    busy: { fr: 'Occupé', en: 'Busy' },
    offline: { fr: 'Hors ligne', en: 'Offline' },
  };
  return labels[status][locale];
}

function getRelativeTime(dateStr: string, locale: 'fr' | 'en'): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'fr') {
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  }

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UsersView() {
  const { t } = useTranslation();
  const { activeTenantId, tenants, locale } = useAppStore(
    useShallow((s) => ({
      activeTenantId: s.activeTenantId,
      tenants: s.tenants,
      locale: s.locale,
    }))
  );
  const { data: allUsers = [] } = useUsers(activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [selectedAll, setSelectedAll] = useState(false);

  const filteredUsers = useMemo(() => {
    let users = allUsers;
    if (tenantFilter !== 'all') {
      users = users.filter((u) => u.tenantId === tenantFilter);
    }
    if (roleFilter !== 'all') {
      users = users.filter((u) => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      users = users.filter((u) => u.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.tenantName.toLowerCase().includes(q)
      );
    }
    return users;
  }, [allUsers, searchQuery, roleFilter, statusFilter, tenantFilter]);

  const totalUsers = allUsers.length;
  const onlineNow = allUsers.filter((u) => u.status === 'online').length;
  const newThisMonth = 3;

  const roles: UserRole[] = ['super_admin', 'tenant_admin', 'editor', 'contributor', 'reader'];
  const statuses: UserStatus[] = ['online', 'away', 'busy', 'offline'];

  const roleTabs = [
    { id: 'all', label: t.users.all },
    ...roles.map((role) => ({
      id: role,
      label: t.users[roleLabelKeys[role] as keyof typeof t.users],
    })),
  ];

  const getRoleLabel = (role: UserRole) =>
    t.users[roleLabelKeys[role] as keyof typeof t.users];

  return (
    <ViewShell>
      <ViewSubNav tabs={roleTabs} activeTab={roleFilter} onTabChange={setRoleFilter} />
      <ViewTabPanel>
        <ViewStatGrid cols={3}>
          <ViewStatCard label={t.users.totalUsers} value={totalUsers} />
          <ViewStatCard label={t.users.onlineNow} value={onlineNow} />
          <ViewStatCard label={t.users.newThisMonth} value={newThisMonth} />
        </ViewStatGrid>

        <ViewToolbar
          actions={
            <BrandPrimaryButton>
              <UserPlus className="h-4 w-4" />
              {t.users.inviteUser}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.users.searchUsers}
          />
          <Select value={tenantFilter} onValueChange={setTenantFilter}>
            <SelectTrigger className="h-9 w-[150px] border-[#E8ECEF] bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t.users.tenant} — {t.users.all}
              </SelectItem>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  <span className="flex items-center gap-2">
                    <WorkspaceIcon
                      icon={tenant.icon}
                      className="h-3.5 w-3.5 text-muted-foreground"
                    />
                    {tenant.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ViewOutlineButton icon={<Filter className="h-4 w-4" />} />
        </ViewToolbar>

        <ViewFilterRow>
          <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            {t.users.all}
          </FilterChip>
          {statuses.map((status) => (
            <FilterChip
              key={status}
              active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {getStatusLabel(status, locale as 'fr' | 'en')}
            </FilterChip>
          ))}
        </ViewFilterRow>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.users.sortName}</ViewDataTableHead>
            <ViewDataTableHead>{t.users.role}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">{t.users.tenant}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.users.contentCount}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.users.lastActive}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.users.sortStatus}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredUsers.length === 0 ? (
              <ViewDataTableEmpty colSpan={7} message={t.users.noResults} />
            ) : (
              filteredUsers.map((user) => {
                const roleColor = roleColors[user.role];
                const statusColor = statusColors[user.status];
                return (
                  <ViewDataTableRow key={user.id}>
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={getRoleLabel(user.role)}
                        className={cn(roleColor.bg, roleColor.text, roleColor.border)}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {user.tenantName}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground">
                      {user.contentCount}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {getRelativeTime(user.lastActive, locale as 'fr' | 'en')}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={getStatusLabel(user.status, locale as 'fr' | 'en')}
                        className={cn(statusColor.bg, statusColor.text, statusColor.border)}
                      />
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>
      </ViewTabPanel>
    </ViewShell>
  );
}

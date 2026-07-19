'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useWorkspaceMembers, useAddWorkspaceMember, useUpdateWorkspaceMember, useRemoveWorkspaceMember } from '@/hooks/use-workspace-members';
import { roleColors } from '@/lib/ui-constants';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';
import { UserPlus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ViewShell,
  ViewTabPanel,
  ViewStatGrid,
  ViewStatCard,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

const ALL_ROLES: { value: UserRole; labelKey: string }[] = [
  { value: 'tenant_admin', labelKey: 'tenantAdmin' },
  { value: 'editor', labelKey: 'editor' },
  { value: 'contributor', labelKey: 'contributor' },
  { value: 'reader', labelKey: 'reader' },
  { value: 'member', labelKey: 'member' },
];

export function WorkspaceMembersView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const tenants = useAppStore((s) => s.tenants);
  const activeTenant = tenants.find((t) => t.id === activeTenantId);

  const { data: members = [], isLoading } = useWorkspaceMembers(activeTenantId);
  const addMember = useAddWorkspaceMember(activeTenantId);
  const updateMember = useUpdateWorkspaceMember(activeTenantId);
  const removeMember = useRemoveWorkspaceMember(activeTenantId);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('contributor');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    if (!newEmail.trim()) return;
    try {
      await addMember.mutateAsync({ email: newEmail.trim(), role: newRole });
      setNewEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setError(null);
    try {
      await updateMember.mutateAsync({ userId, role });
    } catch {
      setError('Failed to update role');
    }
  };

  const handleRemove = async (userId: string) => {
    setError(null);
    try {
      await removeMember.mutateAsync(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove member');
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    const found = ALL_ROLES.find((r) => r.value === role);
    return found ? t.roles[found.labelKey as keyof typeof t.roles] : role;
  };

  if (!activeTenant) {
    return (
      <ViewShell>
        <ViewTabPanel>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No workspace selected
          </div>
        </ViewTabPanel>
      </ViewShell>
    );
  }

  return (
    <ViewShell>
      <ViewTabPanel>
        <ViewStatGrid cols={3}>
          <ViewStatCard label="Workspace" value={activeTenant.name} />
          <ViewStatCard label="Members" value={members.length} />
          <ViewStatCard
            label="Admins"
            value={members.filter((m) => m.role === 'tenant_admin').length}
          />
        </ViewStatGrid>

        {/* Add member form */}
        <div className="flex flex-wrap items-end gap-3 mb-4 p-4 rounded-xl border border-border/40 bg-muted/10">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-9"
            />
          </div>
          <div className="w-[160px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Role
            </label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {getRoleLabel(r.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={addMember.isPending || !newEmail.trim()}
            className="h-9 bg-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.50_0.18_250)] text-white"
          >
            {addMember.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span className="ml-1.5">Add</span>
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-600 text-sm border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableHead>Name</ViewDataTableHead>
            <ViewDataTableHead>Email</ViewDataTableHead>
            <ViewDataTableHead>Role</ViewDataTableHead>
            <ViewDataTableHead className="w-[100px]">Actions</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {isLoading ? (
              <ViewDataTableEmpty colSpan={4} message="Loading..." />
            ) : members.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={4}
                message="No members in this workspace"
                series2Id="audience-wave"
              />
            ) : (
              members.map((member) => {
                const roleColor = roleColors[member.role];
                return (
                  <ViewDataTableRow key={member.id}>
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{member.userName}</p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="text-muted-foreground text-sm">
                      {member.userEmail}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleRoleChange(member.userId, v)}
                      >
                        <SelectTrigger
                          className={cn(
                            'h-7 w-[140px] text-xs border-0',
                            roleColor.bg,
                            roleColor.text
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {getRoleLabel(r.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                        onClick={() => handleRemove(member.userId)}
                        disabled={removeMember.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

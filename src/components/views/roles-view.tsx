'use client';

import { useState, useCallback, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Plus, Save } from 'lucide-react';
import { roleColors } from '@/lib/ui-constants';
import { useUsers } from '@/hooks/use-users';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  BrandPrimaryButton,
  ViewOutlineButton,
  ViewStatGrid,
  ViewStatCard,
  ViewContentSurface,
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
import type { UserRole } from '@/lib/types';

interface PermissionDef {
  key: string;
  label: string;
}

interface PermissionCategory {
  key: string;
  label: string;
  permissions: PermissionDef[];
}

const permissionCategories: PermissionCategory[] = [
  {
    key: 'content',
    label: 'Contenu',
    permissions: [
      { key: 'content_create', label: 'Créer' },
      { key: 'content_edit', label: 'Modifier' },
      { key: 'content_delete', label: 'Supprimer' },
      { key: 'content_publish', label: 'Publier' },
    ],
  },
  {
    key: 'campaigns',
    label: 'Campagnes',
    permissions: [
      { key: 'campaign_create', label: 'Créer' },
      { key: 'campaign_manage', label: 'Gérer' },
    ],
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    permissions: [
      { key: 'user_invite', label: 'Inviter' },
      { key: 'user_manage', label: 'Gérer' },
    ],
  },
  {
    key: 'settings',
    label: 'Paramètres',
    permissions: [
      { key: 'settings_view', label: 'Voir' },
      { key: 'settings_edit', label: 'Modifier' },
    ],
  },
  {
    key: 'audit',
    label: 'Audit',
    permissions: [
      { key: 'audit_view', label: 'Voir' },
      { key: 'audit_export', label: 'Exporter' },
    ],
  },
];

interface RoleDef {
  key: UserRole;
  nameKey: string;
  description: string;
  userCount: number;
  defaultPermissions: Record<string, boolean>;
}

const roleDefinitions: RoleDef[] = [
  {
    key: 'super_admin',
    nameKey: 'superAdmin',
    description: 'Accès complet à toutes les fonctionnalités. Gestion globale de la plateforme.',
    userCount: 0,
    defaultPermissions: {
      content_create: true, content_edit: true, content_delete: true, content_publish: true,
      campaign_create: true, campaign_manage: true,
      user_invite: true, user_manage: true,
      settings_view: true, settings_edit: true,
      audit_view: true, audit_export: true,
    },
  },
  {
    key: 'tenant_admin',
    nameKey: 'tenantAdmin',
    description: 'Administration complète de son entité. Gestion des utilisateurs et paramètres locaux.',
    userCount: 0,
    defaultPermissions: {
      content_create: true, content_edit: true, content_delete: true, content_publish: true,
      campaign_create: true, campaign_manage: true,
      user_invite: true, user_manage: true,
      settings_view: true, settings_edit: true,
      audit_view: true, audit_export: false,
    },
  },
  {
    key: 'editor',
    nameKey: 'editor',
    description: 'Création et gestion de contenu. Peut publier et gérer les campagnes.',
    userCount: 0,
    defaultPermissions: {
      content_create: true, content_edit: true, content_delete: false, content_publish: true,
      campaign_create: true, campaign_manage: true,
      user_invite: false, user_manage: false,
      settings_view: true, settings_edit: false,
      audit_view: true, audit_export: false,
    },
  },
  {
    key: 'contributor',
    nameKey: 'contributor',
    description: 'Création et modification de contenu. Ne peut pas publier directement.',
    userCount: 0,
    defaultPermissions: {
      content_create: true, content_edit: true, content_delete: false, content_publish: false,
      campaign_create: false, campaign_manage: false,
      user_invite: false, user_manage: false,
      settings_view: false, settings_edit: false,
      audit_view: false, audit_export: false,
    },
  },
  {
    key: 'reader',
    nameKey: 'reader',
    description: 'Consultation uniquement. Accès en lecture au contenu publié.',
    userCount: 0,
    defaultPermissions: {
      content_create: false, content_edit: false, content_delete: false, content_publish: false,
      campaign_create: false, campaign_manage: false,
      user_invite: false, user_manage: false,
      settings_view: false, settings_edit: false,
      audit_view: false, audit_export: false,
    },
  },
];

export function RolesView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: users = [] } = useUsers(activeTenantId);

  const rolesWithCounts = useMemo(() => {
    const userCountsByRole: Record<string, number> = {};
    users.forEach((u) => {
      userCountsByRole[u.tenantRole] = (userCountsByRole[u.tenantRole] || 0) + 1;
    });
    return roleDefinitions.map((role) => ({
      ...role,
      userCount: userCountsByRole[role.key] || 0,
    }));
  }, [users]);

  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const state: Record<string, Record<string, boolean>> = {};
    roleDefinitions.forEach((role) => {
      state[role.key] = { ...role.defaultPermissions };
    });
    return state;
  });

  const togglePermission = useCallback((roleKey: string, permKey: string) => {
    setPermissions((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permKey]: !prev[roleKey][permKey],
      },
    }));
  }, []);

  const getPermCount = useCallback((roleKey: string) => {
    const perms = permissions[roleKey];
    if (!perms) return { enabled: 0, total: 0 };
    const total = Object.keys(perms).length;
    const enabled = Object.values(perms).filter(Boolean).length;
    return { enabled, total };
  }, [permissions]);

  const [activeRoleTab, setActiveRoleTab] = useState<string>('all');
  const [selectedRoleKey, setSelectedRoleKey] = useState<UserRole>('super_admin');
  const [selectedAll, setSelectedAll] = useState(false);

  const roleTabs = [
    { id: 'all', label: t.users.all },
    ...roleDefinitions.map((role) => ({
      id: role.key,
      label: t.roles[role.nameKey as keyof typeof t.roles],
    })),
  ];

  const displayedRoles = activeRoleTab === 'all'
    ? rolesWithCounts
    : rolesWithCounts.filter((role) => role.key === activeRoleTab);

  const selectedRole = displayedRoles.find((r) => r.key === selectedRoleKey) ?? displayedRoles[0];
  const isSuperAdmin = selectedRole?.key === 'super_admin';

  const totalPermissions = permissionCategories.reduce(
    (sum, cat) => sum + cat.permissions.length,
    0
  );

  return (
    <ViewShell>
      <ViewSubNav
        tabs={roleTabs}
        activeTab={activeRoleTab}
        onTabChange={setActiveRoleTab}
      />
      <ViewTabPanel>
        <ViewStatGrid cols={3}>
          <ViewStatCard label={t.roles.title} value={roleDefinitions.length} />
          <ViewStatCard label={t.users.title} value={users.length} />
          <ViewStatCard label="Permissions" value={totalPermissions} />
        </ViewStatGrid>

        <ViewToolbar
          actions={
            <>
              <ViewOutlineButton icon={<Save className="h-4 w-4" />}>
                {t.roles.save}
              </ViewOutlineButton>
              <BrandPrimaryButton>
                <Plus className="h-4 w-4" />
                {t.roles.createRole}
              </BrandPrimaryButton>
            </>
          }
        />

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">{t.users.title}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">Permissions</ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {displayedRoles.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={5}
                message={t.roles.title}
                illustrationId="roles"
              />
            ) : (
              displayedRoles.map((role) => {
                const roleColor = roleColors[role.key];
                const { enabled, total } = getPermCount(role.key);
                const isSelected = selectedRole?.key === role.key;

                return (
                  <ViewDataTableRow
                    key={role.key}
                    className={cn(isSelected && 'bg-muted/40')}
                    onClick={() => setSelectedRoleKey(role.key)}
                  >
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">
                        {t.roles[role.nameKey as keyof typeof t.roles]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {role.description}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {role.userCount} utilisateur{role.userCount !== 1 ? 's' : ''}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground">
                      {enabled}/{total}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      {role.key === 'super_admin' ? (
                        <ViewStatusText
                          label="Full Access"
                          className="bg-rose-500/10 text-rose-600 border-rose-500/20"
                        />
                      ) : (
                        <ViewStatusText
                          label={`${enabled}/${total}`}
                          className={cn(roleColor.bg, roleColor.text, roleColor.border)}
                        />
                      )}
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>

        {selectedRole && (
          <ViewContentSurface className="mt-4">
            <div className="p-4 border-b border-border/60">
              <h3 className="text-sm font-semibold">
                {t.roles[selectedRole.nameKey as keyof typeof t.roles]}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.description}</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {permissionCategories.map((category) => (
                  <div
                    key={category.key}
                    className="rounded-xl border border-border/40 p-3 bg-muted/10"
                  >
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {category.label}
                    </span>
                    <div className="space-y-2 mt-2.5">
                      {category.permissions.map((perm) => (
                        <div
                          key={perm.key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-sm text-foreground/80">{perm.label}</span>
                          <Switch
                            checked={permissions[selectedRole.key]?.[perm.key] ?? false}
                            onCheckedChange={() => togglePermission(selectedRole.key, perm.key)}
                            disabled={isSuperAdmin}
                            className={cn(
                              'scale-75 origin-right',
                              permissions[selectedRole.key]?.[perm.key]
                                ? 'data-[state=checked]:bg-[oklch(0.55_0.18_250)]'
                                : ''
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ViewContentSurface>
        )}
      </ViewTabPanel>
    </ViewShell>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  Plus,
  Save,
  Users,
  Crown,
  UserCog,
  PenTool,
  PenLine,
  BookOpen,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { mockUsers, roleColors } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Permission categories and their permissions ─────────────────────────────
interface PermissionDef {
  key: string;
  label: string;
}

interface PermissionCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  permissions: PermissionDef[];
}

const permissionCategories: PermissionCategory[] = [
  {
    key: 'content',
    label: 'Contenu',
    icon: PenTool,
    color: 'text-teal-600 bg-teal-500/10 border-teal-500/15',
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
    icon: Target,
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/15',
    permissions: [
      { key: 'campaign_create', label: 'Créer' },
      { key: 'campaign_manage', label: 'Gérer' },
    ],
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    icon: Users,
    color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/15',
    permissions: [
      { key: 'user_invite', label: 'Inviter' },
      { key: 'user_manage', label: 'Gérer' },
    ],
  },
  {
    key: 'settings',
    label: 'Paramètres',
    icon: Shield,
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/15',
    permissions: [
      { key: 'settings_view', label: 'Voir' },
      { key: 'settings_edit', label: 'Modifier' },
    ],
  },
  {
    key: 'audit',
    label: 'Audit',
    icon: CheckCircle2,
    color: 'text-slate-600 bg-slate-500/10 border-slate-500/15',
    permissions: [
      { key: 'audit_view', label: 'Voir' },
      { key: 'audit_export', label: 'Exporter' },
    ],
  },
];


// ─── Role definitions ────────────────────────────────────────────────────────
interface RoleDef {
  key: UserRole;
  nameKey: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  userCount: number;
  defaultPermissions: Record<string, boolean>;
}

const roleDefinitions: RoleDef[] = [
  {
    key: 'super_admin',
    nameKey: 'superAdmin',
    description: 'Accès complet à toutes les fonctionnalités. Gestion globale de la plateforme.',
    icon: Crown,
    gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
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
    icon: UserCog,
    gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
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
    icon: PenTool,
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
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
    icon: PenLine,
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
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
    icon: BookOpen,
    gradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
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

// Count users per role
const userCountsByRole: Record<string, number> = {};
mockUsers.forEach((u) => {
  userCountsByRole[u.role] = (userCountsByRole[u.role] || 0) + 1;
});
roleDefinitions.forEach((r) => {
  r.userCount = userCountsByRole[r.key] || 0;
});

// ─── Main Component ──────────────────────────────────────────────────────────
export function RolesView() {
  const { t } = useTranslation();
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

  // Calculate permission counts per role
  const getPermCount = useCallback((roleKey: string) => {
    const perms = permissions[roleKey];
    if (!perms) return { enabled: 0, total: 0 };
    const total = Object.keys(perms).length;
    const enabled = Object.values(perms).filter(Boolean).length;
    return { enabled, total };
  }, [permissions]);

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.roles.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {roleDefinitions.length} rôles · {mockUsers.length} utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 hover:border-[oklch(0.55_0.15_160/0.3)] hover:text-[oklch(0.55_0.15_160)]"
          >
            <Save className="h-4 w-4" /> {t.roles.save}
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
          >
            <Plus className="h-4 w-4" /> {t.roles.createRole}
          </Button>
        </div>
      </div>

      {/* ─── Role Cards ──────────────────────────────────────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {roleDefinitions.map((role, roleIdx) => {
          const roleColor = roleColors[role.key];
          const IconComp = role.icon;
          const { enabled, total } = getPermCount(role.key);
          const isSuperAdmin = role.key === 'super_admin';

          return (
            <motion.div key={role.key} variants={item}>
              <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Gradient top strip */}
                <div className="h-1 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />

                <CardContent className="p-0">
                  {/* Role header */}
                  <div className="flex items-center gap-4 p-4 pb-0">
                    <div className={cn('p-2.5 rounded-xl border flex-shrink-0', roleColor.bg, roleColor.border || 'border-border/30')}>
                      <IconComp className={cn('h-5 w-5', roleColor.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold">
                          {t.roles[role.nameKey as keyof typeof t.roles]}
                        </h3>
                        <Badge
                          className={cn(
                            'text-[9px] px-2 py-0 h-4 font-semibold border gap-1',
                            roleColor.bg,
                            roleColor.text,
                            roleColor.border
                          )}
                        >
                          {enabled}/{total} permissions
                        </Badge>
                        {isSuperAdmin && (
                          <Badge className="text-[9px] px-2 py-0 h-4 font-semibold border-0 gap-1 bg-rose-500/10 text-rose-600">
                            <Crown className="h-2.5 w-2.5" /> Full Access
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{role.description}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {role.userCount} utilisateur{role.userCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Permission Matrix */}
                  <div className="p-4 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {permissionCategories.map((category) => {
                        const CatIcon = category.icon;
                        return (
                          <div
                            key={category.key}
                            className="rounded-xl border border-border/40 p-3 bg-muted/10"
                          >
                            {/* Category header */}
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <div className={cn('p-1 rounded-md border', category.color)}>
                                <CatIcon className="h-3 w-3" />
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {category.label}
                              </span>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-2">
                              {category.permissions.map((perm) => (
                                <div
                                  key={perm.key}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span className="text-[11px] text-foreground/80">{perm.label}</span>
                                  <Switch
                                    checked={permissions[role.key]?.[perm.key] ?? false}
                                    onCheckedChange={() => togglePermission(role.key, perm.key)}
                                    disabled={isSuperAdmin}
                                    className={cn(
                                      'scale-75 origin-right',
                                      permissions[role.key]?.[perm.key]
                                        ? 'data-[state=checked]:bg-[oklch(0.55_0.15_160)]'
                                        : ''
                                    )}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

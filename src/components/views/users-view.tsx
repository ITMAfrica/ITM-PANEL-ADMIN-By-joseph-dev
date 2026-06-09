'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Shield,
  Mail,
  UserCircle,
  CircleDot,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { mockUsers, roleColors, getUserInitials } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserRole, UserStatus } from '@/lib/types';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Role label map ──────────────────────────────────────────────────────────
const roleLabelKeys: Record<UserRole, string> = {
  super_admin: 'superAdmin',
  tenant_admin: 'tenantAdmin',
  editor: 'editor',
  contributor: 'contributor',
  reader: 'reader',
};

// ─── Status config ───────────────────────────────────────────────────────────
const statusConfig: Record<UserStatus, { dot: string; label: string; bg: string }> = {
  online: { dot: 'bg-emerald-500', label: 'En ligne', bg: 'bg-emerald-500/10' },
  away: { dot: 'bg-amber-500', label: 'Absent', bg: 'bg-amber-500/10' },
  busy: { dot: 'bg-rose-500', label: 'Occupé', bg: 'bg-rose-500/10' },
  offline: { dot: 'bg-slate-400', label: 'Hors ligne', bg: 'bg-slate-500/10' },
};

// ─── Avatar gradient colors ──────────────────────────────────────────────────
const avatarGradients = [
  'from-teal-500 to-emerald-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-teal-600',
  'from-teal-500 to-cyan-600',
  'from-emerald-400 to-teal-500',
  'from-teal-400 to-emerald-500',
  'from-cyan-400 to-emerald-500',
  'from-emerald-600 to-cyan-500',
];

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins}m`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function UsersView() {
  const { t } = useTranslation();
  const { activeTenantId, tenants } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter users by active tenant (non-super-admin scenario)
  const filteredUsers = useMemo(() => {
    let users = mockUsers;
    // If activeTenantId is set and not 'all', filter by tenant
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
  }, [searchQuery, roleFilter, statusFilter, tenantFilter]);

  // Stats
  const totalUsers = mockUsers.length;
  const onlineNow = mockUsers.filter((u) => u.status === 'online').length;
  const newThisMonth = 3; // Simulated

  const statCards = [
    {
      title: t.users.totalUsers,
      value: totalUsers,
      icon: Users,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15 border-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
    },
    {
      title: t.users.onlineNow,
      value: onlineNow,
      icon: CircleDot,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 border-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.users.newThisMonth,
      value: newThisMonth,
      icon: TrendingUp,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 border-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
      trend: '+12%',
    },
  ];

  const roles: UserRole[] = ['super_admin', 'tenant_admin', 'editor', 'contributor', 'reader'];
  const statuses: UserStatus[] = ['online', 'away', 'busy', 'offline'];

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.users.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalUsers} {t.users.title.toLowerCase()} · {onlineNow} {t.users.online}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <UserPlus className="h-4 w-4" /> {t.users.inviteUser}
        </Button>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item} initial="hidden" animate="show">
              <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow duration-300 group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${stat.iconBg}`}>
                    <IconComp className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.title}</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-xl font-extrabold tracking-tight">{stat.value}</p>
                      {'trend' in stat && stat.trend && (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                          <ArrowUpRight className="h-3 w-3" />
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Filters Bar ─────────────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t.users.searchUsers}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs bg-muted/30 border-transparent">
                  <Shield className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.users.role} — {t.users.all}</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t.users[roleLabelKeys[role] as keyof typeof t.users]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs bg-muted/30 border-transparent">
                  <CircleDot className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Statut — Tous</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusConfig[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tenantFilter} onValueChange={setTenantFilter}>
                <SelectTrigger className="h-8 w-[150px] text-xs bg-muted/30 border-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.users.tenant} — {t.users.all}</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.icon} {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border/60 rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8 rounded-none', viewMode === 'grid' && 'bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)]')}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8 rounded-none', viewMode === 'list' && 'bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)]')}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── User Display ────────────────────────────────────────────────── */}
      {filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">{t.users.noResults}</p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* ─── Grid View ──────────────────────────────────────────────────── */
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredUsers.map((user, idx) => {
            const initials = getUserInitials(user.id);
            const gradient = avatarGradients[idx % avatarGradients.length];
            const roleColor = roleColors[user.role];
            const status = statusConfig[user.status];

            return (
              <motion.div key={user.id} variants={item}>
                <Card className="group overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Gradient top strip */}
                  <div className="h-1 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={cn(
                            'h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br',
                            gradient
                          )}
                        >
                          {initials}
                        </div>
                        {/* Status dot */}
                        <div
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
                            status.dot
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold truncate">{user.name}</h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>

                        {/* Role badge */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge
                            className={cn(
                              'text-[9px] px-2 py-0 h-4 font-semibold border gap-1',
                              roleColor.bg,
                              roleColor.text,
                              roleColor.border
                            )}
                          >
                            <Shield className="h-2.5 w-2.5" />
                            {t.users[roleLabelKeys[user.role] as keyof typeof t.users]}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="gap-2">
                            <UserCircle className="h-4 w-4" /> {t.users.profile}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Mail className="h-4 w-4" /> {t.users.sendMessage}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" /> {t.users.changeRole}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive gap-2">
                            <UserPlus className="h-4 w-4" /> Désactiver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Bottom info row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>{user.tenantName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5" /> {user.contentCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {getRelativeTime(user.lastActive)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* ─── List View ────────────────────────────────────────────────────── */
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="border-border/60 overflow-hidden">
            <div className="divide-y">
              {filteredUsers.map((user, idx) => {
                const initials = getUserInitials(user.id);
                const gradient = avatarGradients[idx % avatarGradients.length];
                const roleColor = roleColors[user.role];
                const status = statusConfig[user.status];

                return (
                  <motion.div
                    key={user.id}
                    variants={item}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br',
                          gradient
                        )}
                      >
                        {initials}
                      </div>
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                          status.dot
                        )}
                      />
                    </div>

                    {/* Name + Email */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <Badge
                          className={cn(
                            'text-[9px] px-1.5 py-0 h-4 font-semibold border gap-0.5',
                            roleColor.bg,
                            roleColor.text,
                            roleColor.border
                          )}
                        >
                          {t.users[roleLabelKeys[user.role] as keyof typeof t.users]}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Tenant */}
                    <div className="hidden md:block w-36 text-[11px] text-muted-foreground truncate">
                      {user.tenantName}
                    </div>

                    {/* Content count */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground w-16">
                      <FileText className="h-3 w-3" /> {user.contentCount}
                    </div>

                    {/* Last active */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground w-20">
                      <Clock className="h-3 w-3" /> {getRelativeTime(user.lastActive)}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="gap-2">
                          <UserCircle className="h-4 w-4" /> {t.users.profile}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" /> {t.users.sendMessage}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Shield className="h-4 w-4" /> {t.users.changeRole}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

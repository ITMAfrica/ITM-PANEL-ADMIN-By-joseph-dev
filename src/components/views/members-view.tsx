'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Shield,
  User,
  Eye,
  Mail,
  Crown,
  Users,
  Sparkles,
} from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { MemberRole } from '@/lib/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Role Config ─────────────────────────────────────────────────────────────
const roleConfig: Record<MemberRole, {
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  gradient: string;
}> = {
  admin: { color: 'text-teal-700', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: Crown, gradient: 'from-teal-500 to-teal-600' },
  member: { color: 'text-emerald-700', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: User, gradient: 'from-emerald-500 to-emerald-600' },
  guest: { color: 'text-amber-700', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Eye, gradient: 'from-amber-500 to-amber-600' },
};

// ─── Status Config ───────────────────────────────────────────────────────────
const statusConfig: Record<string, { color: string; ring: string; label: string; pulse: boolean }> = {
  online: { color: 'bg-emerald-500', ring: 'ring-emerald-500/20', label: 'Online', pulse: true },
  away: { color: 'bg-amber-500', ring: 'ring-amber-500/20', label: 'Away', pulse: false },
  busy: { color: 'bg-rose-500', ring: 'ring-rose-500/20', label: 'Busy', pulse: false },
  offline: { color: 'bg-slate-400', ring: 'ring-slate-400/20', label: 'Offline', pulse: false },
};

// ─── Avatar Gradient Colors ──────────────────────────────────────────────────
const avatarGradients = [
  'from-teal-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-pink-400 to-rose-500',
  'from-orange-400 to-amber-500',
  'from-violet-400 to-purple-500',
];

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function MembersView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const roleLabels: Record<string, string> = {
    all: t.members.all,
    admin: t.members.admin,
    member: t.members.member,
    guest: t.members.guest,
  };

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const onlineCount = mockUsers.filter((u) => u.status === 'online').length;

  const roleCount = (role: string) => {
    if (role === 'all') return mockUsers.length;
    return mockUsers.filter((u) => u.role === role).length;
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.members.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockUsers.length} {t.members.title.toLowerCase()} · {onlineCount} {t.members.online}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <UserPlus className="h-4 w-4" /> {t.members.inviteMember}
        </Button>
      </div>

      {/* ─── Search & Role Filters ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.members.searchMembers}
            className="pl-9 h-9 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {['all', 'admin', 'member', 'guest'].map((role) => {
            const isActive = roleFilter === role;
            const rc = role !== 'all' ? roleConfig[role as MemberRole] : null;
            return (
              <motion.button
                key={role}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
                  isActive
                    ? rc
                      ? `${rc.bg} ${rc.color} ${rc.border} shadow-sm`
                      : 'bg-[oklch(0.55_0.15_160)] text-white border-[oklch(0.55_0.15_160)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)]'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                )}
              >
                {rc && <rc.icon className="h-3 w-3" />}
                {roleLabels[role]}
                <span
                  className={cn(
                    'text-[10px] font-semibold px-1.5 py-0 rounded-full',
                    isActive
                      ? rc
                        ? 'bg-white/20'
                        : 'bg-white/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {roleCount(role)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Members Grid ────────────────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.map((user, idx) => {
          const role = roleConfig[user.role];
          const status = statusConfig[user.status];
          const RoleIcon = role.icon;
          const gradient = avatarGradients[idx % avatarGradients.length];

          return (
            <motion.div key={user.id} variants={item}>
              <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/60 overflow-hidden">
                {/* Colored top accent */}
                <div className={cn('h-1 bg-gradient-to-r', role.gradient)} />

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar with gradient background */}
                      <div className="relative">
                        <div className={cn('h-11 w-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-md', gradient)}>
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        {/* Online status with pulse */}
                        <div className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ring-2', status.color, status.ring)}>
                          {status.pulse && (
                            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" /> Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Remove from workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Role badge and status */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] px-2.5 py-0.5 gap-1 font-medium', role.bg, role.color, role.border)}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleLabels[user.role]}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-2 h-2 rounded-full', status.color)} />
                      <span className={cn(
                        'text-[11px] font-medium',
                        user.status === 'online' ? 'text-emerald-600' : 'text-muted-foreground'
                      )}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Invite Member Card */}
        <motion.div variants={item}>
          <Card className="border-dashed border-2 hover:border-[oklch(0.55_0.15_160/0.4)] transition-all duration-300 cursor-pointer group hover:shadow-md">
            <CardContent className="p-5 flex flex-col items-center justify-center min-h-[140px]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.15_160/0.1)] to-[oklch(0.55_0.15_160/0.05)] border border-[oklch(0.55_0.15_160/0.15)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {t.members.inviteMember}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add a new team member</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

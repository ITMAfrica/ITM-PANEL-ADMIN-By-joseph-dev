'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  LayoutGrid,
  List,
  ArrowUpDown,
  MessageSquare,
  ListChecks,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  Send,
} from 'lucide-react';
import { mockUsers, mockTasks, mockProjects } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { MemberRole } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
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

// ─── Mini Activity Bar ───────────────────────────────────────────────────────
function ActivityBar({ days }: { days: number[] }) {
  const max = Math.max(...days, 1);
  return (
    <div className="flex items-end gap-1 h-8">
      {days.map((val, i) => (
        <motion.div
          key={i}
          className="w-3 rounded-sm bg-gradient-to-t from-[oklch(0.55_0.15_160)] to-[oklch(0.55_0.15_160/0.5)]"
          initial={{ height: 0 }}
          animate={{ height: `${Math.max((val / max) * 100, 8)}%` }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

// ─── Member Detail Sheet ─────────────────────────────────────────────────────
function MemberDetailSheet({ userId, open, onClose }: { userId: string | null; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) return null;

  const role = roleConfig[user.role];
  const status = statusConfig[user.status];
  const RoleIcon = role.icon;
  const gradient = avatarGradients[mockUsers.indexOf(user) % avatarGradients.length];

  // Get user's tasks
  const userTasks = mockTasks.filter((t) => t.assigneeId === user.id);
  const userProjects = mockProjects.filter((p) => p.members.includes(user.id));

  // Mock activity for last 7 days
  const activityDays = [3, 5, 2, 7, 4, 6, 1];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const roleLabels: Record<string, string> = {
    admin: t.members.admin,
    member: t.members.member,
    guest: t.members.guest,
  };

  const taskStatusIcons: Record<string, { icon: React.ElementType; color: string }> = {
    todo: { icon: Clock, color: 'text-slate-500' },
    in_progress: { icon: Activity, color: 'text-amber-500' },
    review: { icon: Eye, color: 'text-cyan-500' },
    done: { icon: CheckCircle2, color: 'text-emerald-500' },
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="sr-only">{user.name} - {t.members.profile}</SheetTitle>
        </SheetHeader>

        {/* Profile Header */}
        <div className="text-center pb-5 border-b">
          <div className="relative inline-block mb-3">
            <div className={cn('h-16 w-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-lg mx-auto', gradient)}>
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className={cn('absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-3 border-background ring-2', status.color, status.ring)}>
              {status.pulse && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
            </div>
          </div>
          <h3 className="text-lg font-bold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className={cn('text-xs px-3 py-0.5 gap-1.5 font-medium', role.bg, role.color, role.border)}>
              <RoleIcon className="h-3.5 w-3.5" />
              {roleLabels[user.role]}
            </Badge>
            <Badge variant="outline" className="text-xs px-3 py-0.5 gap-1.5 font-medium bg-muted/50">
              <div className={cn('w-2 h-2 rounded-full', status.color)} />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t.members.joinDate}: Jan 15, 2025
          </p>
        </div>

        {/* Quick Actions */}
        <div className="py-4 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t.members.quickActions}</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 hover:border-[oklch(0.55_0.15_160/0.3)] hover:text-[oklch(0.55_0.15_160)]">
              <Send className="h-3.5 w-3.5" /> {t.members.sendMessage}
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 hover:border-[oklch(0.55_0.15_160/0.3)] hover:text-[oklch(0.55_0.15_160)]">
              <ListChecks className="h-3.5 w-3.5" /> {t.members.assignTask}
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 hover:border-[oklch(0.55_0.15_160/0.3)] hover:text-[oklch(0.55_0.15_160)]">
              <Shield className="h-3.5 w-3.5" /> {t.members.changeRole}
            </Button>
          </div>
        </div>

        {/* Activity Graph */}
        <div className="py-4 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t.members.activityGraph}</h4>
          <div className="flex items-end gap-2">
            <ActivityBar days={activityDays} />
            <div className="flex flex-col justify-between h-8 ml-1">
              {dayLabels.map((d) => (
                <span key={d} className="text-[8px] text-muted-foreground/50 leading-none">{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="py-4 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {t.members.tasks} ({userTasks.length})
          </h4>
          {userTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-3">{t.members.noTasksAssigned}</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {userTasks.map((task) => {
                const statusInfo = taskStatusIcons[task.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <StatusIcon className={cn('h-3.5 w-3.5 shrink-0', statusInfo.color)} />
                    <span className="text-xs truncate">{task.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="py-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {t.members.projects} ({userProjects.length})
          </h4>
          {userProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-3">{t.members.noProjects}</p>
          ) : (
            <div className="space-y-2">
              {userProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="text-xs font-medium truncate">{project.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-medium">{project.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function MembersView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const roleLabels: Record<string, string> = {
    all: t.members.all,
    admin: t.members.admin,
    member: t.members.member,
    guest: t.members.guest,
  };

  const filtered = useMemo(() => {
    const result = mockUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    // Sort
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'role': return a.role.localeCompare(b.role);
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });
  }, [search, roleFilter, sortBy]);

  const onlineCount = mockUsers.filter((u) => u.status === 'online').length;
  const adminCount = mockUsers.filter((u) => u.role === 'admin').length;

  const roleCount = (role: string) => {
    if (role === 'all') return mockUsers.length;
    return mockUsers.filter((u) => u.role === role).length;
  };

  // Stats cards data
  const statCards = [
    { title: t.members.totalMembers, value: mockUsers.length, icon: Users, gradient: 'from-teal-500/10 via-teal-500/5 to-transparent', iconBg: 'bg-teal-500/15 border-teal-500/15', iconColor: 'text-teal-600', borderAccent: 'border-teal-500/20' },
    { title: t.members.onlineNow, value: onlineCount, icon: Activity, gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent', iconBg: 'bg-emerald-500/15 border-emerald-500/15', iconColor: 'text-emerald-600', borderAccent: 'border-emerald-500/20' },
    { title: t.members.newThisMonth, value: 2, icon: UserPlus, gradient: 'from-amber-500/10 via-amber-500/5 to-transparent', iconBg: 'bg-amber-500/15 border-amber-500/15', iconColor: 'text-amber-600', borderAccent: 'border-amber-500/20' },
    { title: t.members.admins, value: adminCount, icon: Shield, gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent', iconBg: 'bg-cyan-500/15 border-cyan-500/15', iconColor: 'text-cyan-600', borderAccent: 'border-cyan-500/20' },
  ];

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
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList className="h-8 bg-muted/50 p-0.5">
              <TabsTrigger value="grid" className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <LayoutGrid className="h-3.5 w-3.5" /> {t.members.grid}
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <List className="h-3.5 w-3.5" /> {t.members.list}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
          >
            <UserPlus className="h-4 w-4" /> {t.members.inviteMember}
          </Button>
        </div>
      </div>

      {/* ─── Stats Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow duration-300 group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${stat.iconBg}`}>
                    <IconComp className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-lg font-extrabold tracking-tight">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Search, Role Filters, Sort ───────────────────────────────────── */}
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
        <div className="flex items-center gap-1.5 flex-wrap">
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
                      ? rc ? 'bg-white/20' : 'bg-white/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {roleCount(role)}
                </span>
              </motion.button>
            );
          })}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-9 w-[140px] text-xs bg-muted/30 border-transparent">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder={t.members.sortBy} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t.members.sortName}</SelectItem>
            <SelectItem value="role">{t.members.sortRole}</SelectItem>
            <SelectItem value="status">{t.members.sortStatus}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Members Content ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((user, idx) => {
                const role = roleConfig[user.role];
                const status = statusConfig[user.status];
                const RoleIcon = role.icon;
                const gradient = avatarGradients[idx % avatarGradients.length];
                const userTasks = mockTasks.filter((t) => t.assigneeId === user.id);
                const userProjects = mockProjects.filter((p) => p.members.includes(user.id));

                return (
                  <motion.div key={user.id} variants={item}>
                    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/60 overflow-hidden cursor-pointer" onClick={() => setSelectedMember(user.id)}>
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
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><User className="h-4 w-4 mr-2" /> {t.members.profile}</DropdownMenuItem>
                              <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> {t.members.sendMessage}</DropdownMenuItem>
                              <DropdownMenuItem><Shield className="h-4 w-4 mr-2" /> {t.members.changeRole}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Remove from workspace</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <ListChecks className="h-3 w-3" />
                            {userTasks.length} {t.members.tasks}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <FolderKanban className="h-3 w-3" />
                            {userProjects.length} {t.members.projects}
                          </div>
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
                    <p className="text-xs text-muted-foreground/60 mt-1">{t.members.addMember}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-muted/50 border-b text-xs font-semibold text-muted-foreground">
                <span></span>
                <span>{t.members.sortName}</span>
                <span className="hidden sm:block w-20">{t.members.sortRole}</span>
                <span className="hidden md:block w-16">{t.members.sortStatus}</span>
                <span className="hidden md:block w-20">{t.members.tasks}</span>
                <span className="w-20">{t.members.projects}</span>
              </div>
              {/* Table rows */}
              <motion.div variants={container} initial="hidden" animate="show" className="divide-y">
                {filtered.map((user, idx) => {
                  const role = roleConfig[user.role];
                  const status = statusConfig[user.status];
                  const RoleIcon = role.icon;
                  const gradient = avatarGradients[idx % avatarGradients.length];
                  const userTasks = mockTasks.filter((t) => t.assigneeId === user.id);
                  const userProjects = mockProjects.filter((p) => p.members.includes(user.id));

                  return (
                    <motion.div
                      key={user.id}
                      variants={item}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] gap-3 px-4 py-3 items-center cursor-pointer transition-colors"
                      onClick={() => setSelectedMember(user.id)}
                    >
                      <div className="relative">
                        <div className={cn('h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold', gradient)}>
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background', status.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="hidden sm:block w-20">
                        <Badge variant="outline" className={cn('text-[9px] px-2 py-0 h-4 gap-0.5 font-medium', role.bg, role.color, role.border)}>
                          <RoleIcon className="h-2.5 w-2.5" />
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 w-16">
                        <div className={cn('w-2 h-2 rounded-full', status.color)} />
                        <span className="text-[11px] font-medium text-muted-foreground">{status.label}</span>
                      </div>
                      <div className="hidden md:block w-20">
                        <span className="text-xs font-medium text-muted-foreground">{userTasks.length} {t.members.tasks}</span>
                      </div>
                      <div className="w-20">
                        <span className="text-xs font-medium text-muted-foreground">{userProjects.length} {t.members.projects}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Member Detail Sheet ──────────────────────────────────────────── */}
      <MemberDetailSheet
        userId={selectedMember}
        open={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}

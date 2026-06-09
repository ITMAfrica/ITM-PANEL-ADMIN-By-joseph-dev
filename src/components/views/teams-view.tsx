'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Users,
  FolderKanban,
  Pencil,
  Trash2,
  Sparkles,
  ArrowRight,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Crown,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { mockTeams, mockUsers, mockProjects, mockTasks, mockActivities } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MemberRole } from '@/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const avatarGradients = [
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-pink-400 to-rose-500',
  'from-orange-400 to-amber-500',
  'from-teal-400 to-cyan-500',
  'from-violet-400 to-purple-500',
];

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getUserGradient(id: string) {
  const idx = mockUsers.findIndex((u) => u.id === id);
  return avatarGradients[idx % avatarGradients.length];
}

function getUser(id: string) {
  return mockUsers.find((u) => u.id === id);
}

function getTeamTasks(teamId: string) {
  const team = mockTeams.find((t) => t.id === teamId);
  if (!team) return [];
  return mockTasks.filter((t) => team.projects.includes(t.projectId));
}

function getTeamProjects(teamId: string) {
  const team = mockTeams.find((t) => t.id === teamId);
  if (!team) return [];
  return mockProjects.filter((p) => team.projects.includes(p.id));
}

function getTeamActivities(teamId: string) {
  const team = mockTeams.find((t) => t.id === teamId);
  if (!team) return [];
  return mockActivities
    .filter((a) => team.members.includes(a.userId))
    .slice(0, 5);
}

function getTeamPerformance(teamId: string) {
  const tasks = getTeamTasks(teamId);
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'done').length;
  return Math.round((completed / tasks.length) * 100);
}

// ─── Role Config ─────────────────────────────────────────────────────────────
const roleConfig: Record<MemberRole, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  admin: { color: 'text-teal-700', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: Crown },
  member: { color: 'text-emerald-700', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Users },
  guest: { color: 'text-amber-700', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Activity },
};

const statusDot: Record<string, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  offline: 'bg-slate-400',
};

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Circular Progress ───────────────────────────────────────────────────────
function CircularProgress({ value, size = 48, strokeWidth = 4, color = '#10b981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }} transition={{ duration: 1, ease: 'easeOut' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground text-[10px] font-bold" transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {value}%
      </text>
    </svg>
  );
}

// ─── Avatar Stack Component ──────────────────────────────────────────────────
function AvatarStack({ ids, max = 4 }: { ids: string[]; max?: number }) {
  const display = ids.slice(0, max);
  const remaining = ids.length - max;

  return (
    <div className="flex -space-x-2">
      {display.map((id, i) => (
        <Avatar key={id} className="h-7 w-7 ring-2 ring-background shadow-sm transition-transform hover:scale-110 hover:z-10" style={{ zIndex: max - i }}>
          <AvatarFallback className={cn('text-[8px] font-bold bg-gradient-to-br text-white', getUserGradient(id))}>
            {getUserInitials(id)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center shadow-sm">
          <span className="text-[9px] font-semibold text-muted-foreground">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

// ─── Team Detail Panel ───────────────────────────────────────────────────────
function TeamDetailPanel({ teamId }: { teamId: string }) {
  const { t } = useTranslation();
  const team = mockTeams.find((t) => t.id === teamId);
  if (!team) return null;

  const projects = getTeamProjects(teamId);
  const activities = getTeamActivities(teamId);
  const tasks = getTeamTasks(teamId);
  const completedThisWeek = tasks.filter((t) => t.status === 'done').length;
  const avgVelocity = tasks.length > 0 ? Math.round((completedThisWeek / tasks.length) * 100) : 0;

  const roleLabels: Record<string, string> = {
    admin: t.members.admin,
    member: t.members.member,
    guest: t.members.guest,
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden"
    >
      <div className="px-5 pb-5 pt-2 space-y-5 border-t border-dashed mt-3">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
            <div className="p-1.5 rounded-md bg-emerald-500/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">{t.teams.tasksThisWeek}</p>
              <p className="text-sm font-bold">{completedThisWeek}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
            <div className="p-1.5 rounded-md bg-teal-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">{t.teams.avgVelocity}</p>
              <p className="text-sm font-bold">{avgVelocity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
            <div className="p-1.5 rounded-md bg-amber-500/10">
              <FolderKanban className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">{t.teams.projects}</p>
              <p className="text-sm font-bold">{projects.length}</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t.teams.members}</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {team.members.map((memberId, idx) => {
              const user = getUser(memberId);
              if (!user) return null;
              const role = roleConfig[user.role];
              const memberTasks = tasks.filter((t) => t.assigneeId === memberId);
              const isLead = idx === 0;
              return (
                <div key={memberId} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className={cn('h-7 w-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[9px] font-bold', getUserGradient(memberId))}>
                        {getUserInitials(memberId)}
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background', statusDot[user.status])} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{user.name}</span>
                        {isLead && (
                          <Badge className="h-4 px-1.5 text-[8px] font-bold bg-[oklch(0.55_0.15_160)]/10 text-[oklch(0.55_0.15_160)] border-[oklch(0.55_0.15_160)]/20 border gap-0.5">
                            <Crown className="h-2.5 w-2.5" /> {t.teams.lead}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-[8px] px-1.5 py-0 h-3.5 gap-0.5 font-medium', role.bg, role.color, role.border)}>
                          <role.icon className="h-2 w-2" />
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {memberTasks.length} {t.teams.memberTasks}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects with progress */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t.teams.projectProgress}</h4>
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0" style={{ backgroundColor: project.color + '20', color: project.color }}>
                  {project.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium truncate">{project.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: project.color }}>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" style={{ '--progress-color': project.color } as React.CSSProperties} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t.teams.recentActivity}</h4>
          {activities.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-3">{t.teams.noActivityYet}</p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 text-xs">
                  <div className={cn('h-5 w-5 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[7px] font-bold shrink-0 mt-0.5', getUserGradient(activity.userId))}>
                    {getUserInitials(activity.userId)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-muted-foreground line-clamp-1">
                      <span className="font-medium text-foreground">{getUserName(activity.userId)}</span> {activity.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Team Grid Card ──────────────────────────────────────────────────────────
function TeamGridCard({ team, expanded, onToggle }: { team: typeof mockTeams[0]; expanded: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const performance = getTeamPerformance(team.id);

  return (
    <motion.div variants={item}>
      <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/60 overflow-hidden">
        {/* Colored accent strip */}
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}99)` }} />

        <CardContent className="p-5">
          {/* Team header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm border border-white/10"
                style={{ backgroundColor: team.color + '20', color: team.color }}
              >
                {team.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{team.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">{team.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <CircularProgress value={performance} size={40} strokeWidth={3.5} color={team.color} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> {t.common.edit}</DropdownMenuItem>
                  <DropdownMenuItem><Users className="h-4 w-4 mr-2" /> {t.teams.memberRole}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> {t.common.delete}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-muted/50"><Users className="h-3 w-3 text-muted-foreground" /></div>
              <span className="text-xs font-medium text-muted-foreground">{team.members.length} {t.teams.members}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-muted/50"><FolderKanban className="h-3 w-3 text-muted-foreground" /></div>
              <span className="text-xs font-medium text-muted-foreground">{team.projects.length} {t.teams.projects}</span>
            </div>
          </div>

          {/* Avatar stack + expand toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-dashed">
            <AvatarStack ids={team.members} />
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:text-primary" onClick={onToggle}>
              {expanded ? t.teams.collapseDetails : t.teams.expandDetails}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>

        {/* Expandable Detail Panel */}
        <AnimatePresence>
          {expanded && <TeamDetailPanel teamId={team.id} />}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Team List Row ───────────────────────────────────────────────────────────
function TeamListRow({ team, expanded, onToggle }: { team: typeof mockTeams[0]; expanded: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const performance = getTeamPerformance(team.id);

  return (
    <motion.div variants={item}>
      <div className="border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border">
        <div className="relative flex items-center gap-4 px-4 py-3.5 cursor-pointer" onClick={onToggle}>
          {/* Left color bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(180deg, ${team.color}, ${team.color}99)` }} />
          <div className="pl-2 flex items-center gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: team.color + '20', color: team.color }}
            >
              {team.name.charAt(0)}
            </div>
            {/* Name + desc */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{team.name}</p>
              <p className="text-xs text-muted-foreground truncate">{team.description}</p>
            </div>
            {/* Performance */}
            <div className="hidden sm:flex items-center gap-2">
              <CircularProgress value={performance} size={36} strokeWidth={3} color={team.color} />
            </div>
            {/* Members */}
            <div className="hidden md:flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{team.members.length}</span>
            </div>
            {/* Projects */}
            <div className="hidden md:flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{team.projects.length}</span>
            </div>
            {/* Avatar */}
            <div className="hidden lg:block">
              <AvatarStack ids={team.members} max={3} />
            </div>
            {/* Expand icon */}
            <div className="shrink-0">
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && <TeamDetailPanel teamId={team.id} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function TeamsView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mockTeams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        team.description.toLowerCase().includes(search.toLowerCase());
      const matchesSize =
        sizeFilter === 'all' ||
        (sizeFilter === 'small' && team.members.length <= 3) ||
        (sizeFilter === 'medium' && team.members.length >= 4 && team.members.length <= 6) ||
        (sizeFilter === 'large' && team.members.length >= 7);
      return matchesSearch && matchesSize;
    });
  }, [search, sizeFilter]);

  const toggleExpand = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.teams.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockTeams.length} {t.teams.title.toLowerCase()} · {mockTeams.reduce((a, t) => a + t.members.length, 0)} {t.teams.members}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList className="h-8 bg-muted/50 p-0.5">
              <TabsTrigger value="grid" className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <LayoutGrid className="h-3.5 w-3.5" /> {t.teams.grid}
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2.5 h-7 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <List className="h-3.5 w-3.5" /> {t.teams.list}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
          >
            <Plus className="h-4 w-4" /> {t.teams.createTeam}
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.teams.searchTeams}
            className="pl-9 h-9 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="h-9 w-[180px] text-xs bg-muted/30 border-transparent">
            <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder={t.teams.filterBySize} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.members.all}</SelectItem>
            <SelectItem value="small">{t.teams.small}</SelectItem>
            <SelectItem value="medium">{t.teams.medium}</SelectItem>
            <SelectItem value="large">{t.teams.large}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Teams Content ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((team) => (
                <TeamGridCard key={team.id} team={team} expanded={expandedTeam === team.id} onToggle={() => toggleExpand(team.id)} />
              ))}
              {/* Create Team Card */}
              <motion.div variants={item}>
                <Card className="border-dashed border-2 hover:border-[oklch(0.55_0.15_160/0.4)] transition-all duration-300 cursor-pointer group hover:shadow-md">
                  <CardContent className="p-5 flex flex-col items-center justify-center min-h-[200px]">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.15_160/0.1)] to-[oklch(0.55_0.15_160/0.05)] border border-[oklch(0.55_0.15_160/0.15)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {t.teams.createNewTeam}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{t.teams.organizeMembers}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {filtered.map((team) => (
                <TeamListRow key={team.id} team={team} expanded={expandedTeam === team.id} onToggle={() => toggleExpand(team.id)} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

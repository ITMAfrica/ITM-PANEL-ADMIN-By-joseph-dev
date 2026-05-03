'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  TrendingUp,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { mockTasks, mockProjects, mockUsers, mockTeams } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.25, ease: 'easeOut' } },
};

const COLORS = ['oklch(0.55 0.15 160)', 'oklch(0.65 0.15 80)', 'oklch(0.55 0.2 25)', 'oklch(0.6 0.15 300)'];

// ─── Project Health Colors ───────────────────────────────────────────────────
const healthColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  on_hold: { bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-slate-500/10', text: 'text-slate-600', dot: 'bg-slate-400' },
  archived: { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-300' },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function ReportsView() {
  const { t } = useTranslation();
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((task) => task.status === 'done').length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  const activeMembers = mockUsers.filter((u) => u.status === 'online' || u.status === 'busy').length;

  // Task completion trend
  const completionTrend = [
    { name: 'Jan 14', completed: 3, created: 5 },
    { name: 'Jan 15', completed: 5, created: 4 },
    { name: 'Jan 16', completed: 2, created: 6 },
    { name: 'Jan 17', completed: 7, created: 3 },
    { name: 'Jan 18', completed: 4, created: 5 },
    { name: 'Jan 19', completed: 6, created: 2 },
    { name: 'Jan 20', completed: 8, created: 4 },
  ];

  // Tasks by priority
  const priorityData = [
    { name: 'Urgent', value: mockTasks.filter((tk) => tk.priority === 'urgent').length },
    { name: 'High', value: mockTasks.filter((tk) => tk.priority === 'high').length },
    { name: 'Medium', value: mockTasks.filter((tk) => tk.priority === 'medium').length },
    { name: 'Low', value: mockTasks.filter((tk) => tk.priority === 'low').length },
  ];

  // Team workload
  const workloadData = mockTeams.map((team) => ({
    name: team.name,
    tasks: team.projects.reduce((acc, pid) => {
      return acc + mockTasks.filter((tk) => tk.projectId === pid && tk.status !== 'done').length;
    }, 0),
    completed: team.projects.reduce((acc, pid) => {
      return acc + mockTasks.filter((tk) => tk.projectId === pid && tk.status === 'done').length;
    }, 0),
  }));

  const stats = [
    {
      title: t.reports.totalTasks,
      value: totalTasks,
      change: '+18%',
      trend: 'up' as const,
      icon: CheckSquare,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/5',
    },
    {
      title: t.reports.completionRate,
      value: `${completionRate}%`,
      isPercent: true,
      change: '+5%',
      trend: 'up' as const,
      icon: TrendingUp,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/5',
    },
    {
      title: t.reports.avgTaskTime,
      value: '3.2d',
      isString: true,
      change: '-12%',
      trend: 'up' as const,
      icon: Clock,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
      glowColor: 'shadow-cyan-500/5',
    },
    {
      title: t.reports.activeMembers,
      value: activeMembers,
      change: '+2',
      trend: 'up' as const,
      icon: Users,
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      borderAccent: 'border-rose-500/20',
      glowColor: 'shadow-rose-500/5',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.reports.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t.reports.subtitle}</p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Download className="h-4 w-4" /> {t.reports.exportReport}
        </Button>
      </div>

      {/* ─── Summary Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="relative group">
                <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-md ${stat.glowColor} hover:shadow-lg transition-shadow duration-300`}>
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                  {/* Decorative Circle */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-current/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ color: stat.iconColor.includes('emerald') ? '#10b981' : stat.iconColor.includes('amber') ? '#f59e0b' : stat.iconColor.includes('cyan') ? '#06b6d4' : '#ef4444' }} />

                  <CardContent className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-2xl ${stat.iconBg} backdrop-blur-sm border border-white/10 shadow-sm`}>
                        <IconComp className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {stat.change}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{t.dashboard.vsLastPeriod}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task Completion Trend */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.reports.taskCompletionTrend}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Completed vs created tasks</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-emerald-500/5">
                  Details <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={completionTrend}>
                    <defs>
                      <linearGradient id="reportCompletedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reportCreatedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.15 80)" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="oklch(0.65 0.15 80)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dy={8} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" dx={-4} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                      cursor={{ fill: 'var(--muted)', radius: 4 }}
                    />
                    <Area type="monotone" dataKey="completed" stroke="oklch(0.55 0.15 160)" fill="url(#reportCompletedGrad)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="created" stroke="oklch(0.65 0.15 80 / 0.7)" fill="url(#reportCreatedGrad)" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks by Priority */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <PieChartIcon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{t.reports.tasksByPriority}</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Distribution of task priorities</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                      }}
                    />
                    <Legend
                      fontSize={12}
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Team Workload ───────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
                  <BarChart3 className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.reports.teamWorkload}</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Active vs completed tasks per team</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                    }}
                    cursor={{ fill: 'var(--muted)', radius: 4 }}
                  />
                  <Bar dataKey="tasks" fill="oklch(0.55 0.15 160)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.active} />
                  <Bar dataKey="completed" fill="oklch(0.55 0.15 160 / 0.3)" radius={[0, 6, 6, 0]} maxBarSize={20} name={t.reports.completed} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Project Health Overview ─────────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/15">
                  <Target className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{t.reports.projectHealth}</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Progress and status of all projects</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-rose-500/5">
                View All <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.map((project, idx) => {
                const health = healthColors[project.status] || healthColors.active;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                  >
                    {/* Project Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 border border-white/10 shadow-sm"
                      style={{ backgroundColor: project.color + '20', color: project.color }}
                    >
                      {project.icon}
                    </div>

                    {/* Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{project.name}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      className={cn('text-[10px] px-2.5 py-0.5 gap-1 font-medium flex-shrink-0 border-0', health.bg, health.text)}
                    >
                      <div className={cn('w-1.5 h-1.5 rounded-full', health.dot)} />
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

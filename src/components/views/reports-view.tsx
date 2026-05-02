'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckSquare,
  TrendingUp,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { mockTasks, mockProjects, mockUsers, mockTeams } from '@/lib/mock-data';
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const COLORS = ['oklch(0.55 0.15 160)', 'oklch(0.65 0.15 80)', 'oklch(0.55 0.2 25)', 'oklch(0.6 0.15 300)'];

export function ReportsView() {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((t) => t.status === 'done').length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  const activeMembers = mockUsers.filter((u) => u.status === 'online' || u.status === 'busy').length;

  // Task completion trend (mock data)
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
    { name: 'Urgent', value: mockTasks.filter((t) => t.priority === 'urgent').length },
    { name: 'High', value: mockTasks.filter((t) => t.priority === 'high').length },
    { name: 'Medium', value: mockTasks.filter((t) => t.priority === 'medium').length },
    { name: 'Low', value: mockTasks.filter((t) => t.priority === 'low').length },
  ];

  // Team workload
  const workloadData = mockTeams.map((team) => ({
    name: team.name,
    tasks: team.projects.reduce((acc, pid) => {
      return acc + mockTasks.filter((t) => t.projectId === pid && t.status !== 'done').length;
    }, 0),
    completed: team.projects.reduce((acc, pid) => {
      return acc + mockTasks.filter((t) => t.projectId === pid && t.status === 'done').length;
    }, 0),
  }));

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      change: '+18%',
      trend: 'up' as const,
      icon: <CheckSquare className="h-4 w-4" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: '+5%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Avg. Task Time',
      value: '3.2d',
      change: '-12%',
      trend: 'up' as const,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Active Members',
      value: activeMembers,
      change: '+2',
      trend: 'up' as const,
      icon: <Users className="h-4 w-4" />,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Data-driven insights for your workspace</p>
        </div>
        <Button variant="outline" size="sm" className="h-8">
          Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span className={cn('text-xs font-medium', stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500')}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="completed" stroke="oklch(0.55 0.15 160)" fill="oklch(0.55 0.15 160 / 0.1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="created" stroke="oklch(0.65 0.15 80 / 0.7)" fill="oklch(0.65 0.15 80 / 0.05)" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tasks by Priority</CardTitle>
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
                        borderRadius: '8px',
                        fontSize: '12px',
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

      {/* Team Workload */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Team Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="tasks" fill="oklch(0.55 0.15 160)" radius={[0, 4, 4, 0]} name="Active" />
                  <Bar dataKey="completed" fill="oklch(0.55 0.15 160 / 0.3)" radius={[0, 4, 4, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Health */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Project Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: project.color + '20', color: project.color }}
                  >
                    {project.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{project.name}</span>
                      <span className="text-xs text-muted-foreground">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] flex-shrink-0',
                      project.status === 'active' ? 'border-emerald-200 text-emerald-600' :
                      project.status === 'on_hold' ? 'border-amber-200 text-amber-600' :
                      project.status === 'completed' ? 'text-slate-500' : ''
                    )}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

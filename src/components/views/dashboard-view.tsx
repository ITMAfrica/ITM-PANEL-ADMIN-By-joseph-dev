'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  FolderKanban,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  MessageSquare,
  AlertCircle,
  MoreHorizontal,
  FileText,
  Users,
  Activity,
} from 'lucide-react';
import { mockTasks, mockProjects, mockActivities, mockUsers, mockMeetings } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const weeklyData = [
  { name: 'Mon', completed: 4, created: 6 },
  { name: 'Tue', completed: 7, created: 5 },
  { name: 'Wed', completed: 3, created: 8 },
  { name: 'Thu', completed: 9, created: 4 },
  { name: 'Fri', completed: 6, created: 7 },
  { name: 'Sat', completed: 2, created: 1 },
  { name: 'Sun', completed: 1, created: 2 },
];

const burndownData = [
  { name: 'Week 1', ideal: 50, actual: 48 },
  { name: 'Week 2', ideal: 40, actual: 42 },
  { name: 'Week 3', ideal: 30, actual: 35 },
  { name: 'Week 4', ideal: 20, actual: 25 },
  { name: 'Week 5', ideal: 10, actual: 15 },
  { name: 'Week 6', ideal: 0, actual: 8 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function DashboardView() {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = mockTasks.filter((t) => t.status === 'in_progress').length;
  const activeProjects = mockProjects.filter((p) => p.status === 'active').length;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      change: '+12%',
      trend: 'up' as const,
      icon: <CheckSquare className="h-4 w-4" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      change: '+2',
      trend: 'up' as const,
      icon: <FolderKanban className="h-4 w-4" />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      change: '-3%',
      trend: 'down' as const,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((completedTasks / totalTasks) * 100)}%`,
      change: '+5%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  const getUserName = (id: string) => mockUsers.find((u) => u.id === id)?.name || 'Unknown';
  const getUserInitials = (id: string) => {
    const user = mockUsers.find((u) => u.id === id);
    return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-rose-500/10 text-rose-600 border-rose-200',
    high: 'bg-amber-500/10 text-amber-600 border-amber-200',
    medium: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    low: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Weekly Task Activity</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">View details</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
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
                    <Bar dataKey="completed" fill="oklch(0.55 0.15 160)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="created" fill="oklch(0.65 0.15 80 / 0.5)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Sprint Burndown</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">View details</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={burndownData}>
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
                    <Area type="monotone" dataKey="ideal" stroke="oklch(0.55 0.15 160 / 0.5)" fill="oklch(0.55 0.15 160 / 0.05)" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="actual" stroke="oklch(0.55 0.15 160)" fill="oklch(0.55 0.15 160 / 0.1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row: Active Tasks + Activity + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Tasks */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Active Tasks</CardTitle>
                <Badge variant="secondary" className="text-xs">{inProgressTasks} in progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {mockTasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-7 w-7 mt-0.5">
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                        {getUserInitials(task.assigneeId)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{getUserName(task.assigneeId)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {mockActivities.slice(0, 6).map((activity) => {
                const icons: Record<string, React.ReactNode> = {
                  task_completed: <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />,
                  comment_added: <MessageSquare className="h-3.5 w-3.5 text-cyan-500" />,
                  task_created: <CheckSquare className="h-3.5 w-3.5 text-amber-500" />,
                  file_uploaded: <FileText className="h-3.5 w-3.5 text-violet-500" />,
                  project_updated: <FolderKanban className="h-3.5 w-3.5 text-rose-500" />,
                  meeting_scheduled: <CalendarDays className="h-3.5 w-3.5 text-pink-500" />,
                  member_joined: <Users className="h-3.5 w-3.5 text-emerald-500" />,
                };

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-muted/50">
                      {icons[activity.type] || <Activity className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">{getUserName(activity.userId)}</span>{' '}
                        <span className="text-muted-foreground">{activity.description}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Meetings */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Upcoming</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">See all</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {mockMeetings
                .filter((m) => m.status === 'scheduled')
                .slice(0, 4)
                .map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-2.5 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(meeting.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' · '}
                          {new Date(meeting.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {meeting.attendees.slice(0, 3).map((id) => (
                            <Avatar key={id} className="h-5 w-5 border border-background">
                              <AvatarFallback className="text-[7px] bg-muted">
                                {getUserInitials(id)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {meeting.attendees.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{meeting.attendees.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {/* Deadlines */}
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Upcoming deadlines
                </p>
                {mockTasks
                  .filter((t) => t.status !== 'done' && t.dueDate)
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 2)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-2 py-1.5 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'urgent' ? 'bg-rose-500' : task.priority === 'high' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="truncate flex-1">{task.title}</span>
                      <span className="text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Project Progress */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Project Progress</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs">View all projects</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProjects
                .filter((p) => p.status !== 'completed')
                .map((project) => (
                  <div key={project.id} className="p-3 rounded-xl border hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: project.color + '20', color: project.color }}
                      >
                        {project.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {project.completedTasks}/{project.taskCount} tasks
                        </p>
                      </div>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex -space-x-1.5">
                        {project.members.slice(0, 3).map((id) => (
                          <Avatar key={id} className="h-5 w-5 border-2 border-background">
                            <AvatarFallback className="text-[7px] bg-muted">
                              {getUserInitials(id)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{project.progress}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

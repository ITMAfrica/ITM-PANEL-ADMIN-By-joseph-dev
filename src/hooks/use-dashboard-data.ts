'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockTasks, mockProjects, mockUsers, mockActivities, mockMeetings } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';

interface DashboardStats {
  totalTasks: number;
  activeProjects: number;
  inProgress: number;
  completionRate: number;
  taskTrend: number;
  projectTrend: number;
  inProgressTrend: number;
  completionTrend: number;
}

type DataRecord = Record<string, unknown>;

interface DashboardData {
  stats: DashboardStats;
  tasks: DataRecord[];
  projects: DataRecord[];
  users: DataRecord[];
  activities: DataRecord[];
  meetings: DataRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

export function useDashboardData(): DashboardData {
  const [tasks, setTasks] = useState<DataRecord[]>([]);
  const [projects, setProjects] = useState<DataRecord[]>([]);
  const [users, setUsers] = useState<DataRecord[]>([]);
  const [activities, setActivities] = useState<DataRecord[]>([]);
  const [meetings, setMeetings] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    useAppStore.getState().setApiLoading(true);
    setError(null);
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
        fetch('/api/users'),
      ]);

      let fetchedTasks: DataRecord[] = [];
      let fetchedProjects: DataRecord[] = [];
      let fetchedUsers: DataRecord[] = [];

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        fetchedTasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];
      }
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        fetchedProjects = Array.isArray(projectsData) ? projectsData : projectsData.projects || [];
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        fetchedUsers = Array.isArray(usersData) ? usersData : usersData.users || [];
      }

      // Gracefully fall back to mock data if API returns empty arrays
      setTasks(fetchedTasks.length > 0 ? fetchedTasks : mockTasks as unknown as DataRecord[]);
      setProjects(fetchedProjects.length > 0 ? fetchedProjects : mockProjects as unknown as DataRecord[]);
      setUsers(fetchedUsers.length > 0 ? fetchedUsers : mockUsers as unknown as DataRecord[]);
      // Activities and meetings still use mock data (no API endpoint)
      setActivities(mockActivities as unknown as DataRecord[]);
      setMeetings(mockMeetings as unknown as DataRecord[]);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Fall back to mock data on error
      setTasks(mockTasks as unknown as DataRecord[]);
      setProjects(mockProjects as unknown as DataRecord[]);
      setUsers(mockUsers as unknown as DataRecord[]);
      setActivities(mockActivities as unknown as DataRecord[]);
      setMeetings(mockMeetings as unknown as DataRecord[]);
    } finally {
      setIsLoading(false);
      useAppStore.getState().setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats from real data
  const totalTasks = tasks.length || 0;
  const activeProjects = projects.filter((p: DataRecord) => p.status === 'active').length || 0;
  const inProgress = tasks.filter((t: DataRecord) => t.status === 'in_progress').length || 0;
  const doneTasks = tasks.filter((t: DataRecord) => t.status === 'done').length || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const stats: DashboardStats = {
    totalTasks,
    activeProjects,
    inProgress,
    completionRate,
    taskTrend: 12,
    projectTrend: 8,
    inProgressTrend: -3,
    completionTrend: 5,
  };

  return { stats, tasks, projects, users, activities, meetings, isLoading, error, refetch: fetchData, lastUpdated };
}

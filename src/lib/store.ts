import { create } from 'zustand';
import type { PageId, Workspace, Notification, TaskStatus } from './types';
import type { Locale } from './i18n';

interface AppState {
  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Workspace
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspace: (id: string) => void;
  addWorkspace: (workspace: Workspace) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  notificationCenterOpen: boolean;
  setNotificationCenterOpen: (open: boolean) => void;
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (pageId: string) => void;

  // Task view mode
  taskViewMode: 'list' | 'kanban' | 'my_tasks';
  setTaskViewMode: (mode: 'list' | 'kanban' | 'my_tasks') => void;

  // i18n / Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Task detail drawer
  taskDetailOpen: boolean;
  setTaskDetailOpen: (open: boolean) => void;
  selectedTask: Record<string, unknown> | null;
  setSelectedTask: (task: Record<string, unknown> | null) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Create workspace dialog
  createWorkspaceDialogOpen: boolean;
  setCreateWorkspaceDialogOpen: (open: boolean) => void;

  // Create task dialog
  createTaskDialogOpen: boolean;
  setCreateTaskDialogOpen: (open: boolean) => void;

  // Create project dialog
  createProjectDialogOpen: boolean;
  setCreateProjectDialogOpen: (open: boolean) => void;

  // Shortcuts help dialog
  shortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (open: boolean) => void;

  // Keyboard shortcuts dialog
  keyboardShortcutsOpen: boolean;
  setKeyboardShortcutsOpen: (open: boolean) => void;

  // Recent items
  recentItems: string[];
  addRecentItem: (pageId: string) => void;

  // Global API loading indicator
  isApiLoading: boolean;
  setApiLoading: (loading: boolean) => void;

  // Auth
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  // Workspace
  workspaces: [
    {
      id: 'ws-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      color: '#10b981',
      icon: '🏢',
      createdAt: '2024-01-15',
    },
    {
      id: 'ws-2',
      name: 'Design Team',
      slug: 'design-team',
      color: '#f59e0b',
      icon: '🎨',
      createdAt: '2024-03-20',
    },
    {
      id: 'ws-3',
      name: 'Side Project',
      slug: 'side-project',
      color: '#ef4444',
      icon: '🚀',
      createdAt: '2024-06-10',
    },
  ],
  activeWorkspaceId: 'ws-1',
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id, activePage: 'dashboard' }),
  addWorkspace: (workspace) => set((s) => ({ workspaces: [...s.workspaces, workspace] })),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  // Search
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Notifications
  notifications: [
    {
      id: 'n1',
      type: 'assignment',
      title: 'New task assigned',
      message: 'You have been assigned "Design homepage mockup"',
      read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'n2',
      type: 'comment',
      title: 'New comment',
      message: 'Sarah commented on "API Integration"',
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n3',
      type: 'deadline',
      title: 'Deadline approaching',
      message: 'Sprint 4 ends in 2 days',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n4',
      type: 'mention',
      title: 'Mentioned in discussion',
      message: '@you in #general channel',
      read: true,
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n5',
      type: 'invitation',
      title: 'Workspace invitation',
      message: 'You were invited to join "Marketing Team"',
      read: false,
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n6',
      type: 'system',
      title: 'System update',
      message: 'TeamFlow v2.4 is now available with new features',
      read: true,
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n7',
      type: 'assignment',
      title: 'New task assigned',
      message: 'You have been assigned "Review pull request #142"',
      read: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n8',
      type: 'comment',
      title: 'Reply to your comment',
      message: 'Mike replied to your comment on "Database migration"',
      read: true,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n9',
      type: 'deadline',
      title: 'Overdue task',
      message: 'Task "Write unit tests" is 1 day overdue',
      read: false,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n10',
      type: 'mention',
      title: 'Mentioned in wiki',
      message: '@you in "Architecture Decisions" page',
      read: true,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  notificationCenterOpen: false,
  setNotificationCenterOpen: (open) => set({ notificationCenterOpen: open }),
  notificationPanelOpen: false,
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  // Favorites
  favorites: ['dashboard', 'tasks', 'messages'],
  toggleFavorite: (pageId) =>
    set((s) => ({
      favorites: s.favorites.includes(pageId)
        ? s.favorites.filter((f) => f !== pageId)
        : [...s.favorites, pageId],
    })),

  // Task view mode
  taskViewMode: 'kanban',
  setTaskViewMode: (mode) => set({ taskViewMode: mode }),

  // i18n / Locale
  locale: 'fr',
  setLocale: (locale) => set({ locale }),

  // Task detail drawer
  taskDetailOpen: false,
  setTaskDetailOpen: (open) => set({ taskDetailOpen: open }),
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task, taskDetailOpen: task !== null }),
  updateTaskStatus: (taskId, status) =>
    set((s) => {
      if (!s.selectedTask) return s;
      const task = s.selectedTask as Record<string, unknown> & { id: string; status: TaskStatus };
      if (task.id !== taskId) return s;
      return { selectedTask: { ...task, status } };
    }),

  // Create workspace dialog
  createWorkspaceDialogOpen: false,
  setCreateWorkspaceDialogOpen: (open) => set({ createWorkspaceDialogOpen: open }),

  // Create task dialog
  createTaskDialogOpen: false,
  setCreateTaskDialogOpen: (open) => set({ createTaskDialogOpen: open }),

  // Create project dialog
  createProjectDialogOpen: false,
  setCreateProjectDialogOpen: (open) => set({ createProjectDialogOpen: open }),

  // Shortcuts help dialog
  shortcutsHelpOpen: false,
  setShortcutsHelpOpen: (open) => set({ shortcutsHelpOpen: open }),

  // Keyboard shortcuts dialog
  keyboardShortcutsOpen: false,
  setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),

  // Recent items
  recentItems: ['dashboard', 'tasks', 'messages'],
  addRecentItem: (pageId) =>
    set((s) => {
      const filtered = s.recentItems.filter((id) => id !== pageId);
      return { recentItems: [pageId, ...filtered].slice(0, 8) };
    }),

  // Global API loading indicator
  isApiLoading: false,
  setApiLoading: (loading) => set({ isApiLoading: loading }),

  // Auth
  isAuthenticated: false,
  currentUser: null,
  login: () =>
    set({
      isAuthenticated: true,
      currentUser: {
        id: 'u-1',
        name: 'Alex Thompson',
        email: 'alex@acmecorp.com',
        avatar: '',
        role: 'Admin',
      },
    }),
  logout: () => set({ isAuthenticated: false, currentUser: null }),
}));

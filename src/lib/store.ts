import { create } from 'zustand';
import type { PageId, Workspace, Notification } from './types';

interface AppState {
  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Workspace
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspace: (id: string) => void;

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

  // Favorites
  favorites: string[];
  toggleFavorite: (pageId: string) => void;

  // Task view mode
  taskViewMode: 'list' | 'kanban' | 'my_tasks';
  setTaskViewMode: (mode: 'list' | 'kanban' | 'my_tasks') => void;

  // Auth
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
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
      timestamp: '2025-01-20T10:30:00Z',
    },
    {
      id: 'n2',
      type: 'comment',
      title: 'New comment',
      message: 'Sarah commented on "API Integration"',
      read: false,
      timestamp: '2025-01-20T09:15:00Z',
    },
    {
      id: 'n3',
      type: 'deadline',
      title: 'Deadline approaching',
      message: 'Sprint 4 ends in 2 days',
      read: true,
      timestamp: '2025-01-19T16:00:00Z',
    },
    {
      id: 'n4',
      type: 'mention',
      title: 'Mentioned in discussion',
      message: '@you in #general channel',
      read: true,
      timestamp: '2025-01-19T14:20:00Z',
    },
    {
      id: 'n5',
      type: 'invitation',
      title: 'Workspace invitation',
      message: 'You were invited to join "Marketing Team"',
      read: false,
      timestamp: '2025-01-18T11:00:00Z',
    },
  ],
  notificationCenterOpen: false,
  setNotificationCenterOpen: (open) => set({ notificationCenterOpen: open }),

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
      },
    }),
  logout: () => set({ isAuthenticated: false, currentUser: null }),
}));

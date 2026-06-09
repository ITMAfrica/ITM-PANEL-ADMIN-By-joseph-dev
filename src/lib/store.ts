import { create } from 'zustand';
import type { PageId, Tenant, Notification, UserRole } from './types';
import type { Locale } from './i18n';

interface AppState {
  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Tenant (Multi-Tenant)
  tenants: Tenant[];
  activeTenantId: string;
  setActiveTenant: (id: string) => void;
  addTenant: (tenant: Tenant) => void;

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
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (pageId: string) => void;

  // Content detail drawer
  contentDetailOpen: boolean;
  setContentDetailOpen: (open: boolean) => void;
  selectedContent: Record<string, unknown> | null;
  setSelectedContent: (content: Record<string, unknown> | null) => void;

  // Create content dialog
  createContentDialogOpen: boolean;
  setCreateContentDialogOpen: (open: boolean) => void;
  createContentType: string;
  setCreateContentType: (type: string) => void;

  // Shortcuts help dialog
  shortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (open: boolean) => void;
  keyboardShortcutsOpen: boolean;
  setKeyboardShortcutsOpen: (open: boolean) => void;

  // Recent items
  recentItems: string[];
  addRecentItem: (pageId: string) => void;

  // Global API loading indicator
  isApiLoading: boolean;
  setApiLoading: (loading: boolean) => void;

  // Focus mode
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  toggleFocusMode: () => void;

  // Create workspace dialog
  createWorkspaceDialogOpen: boolean;
  setCreateWorkspaceDialogOpen: (open: boolean) => void;
  addWorkspace: (workspace: { id: string; name: string; slug: string; color: string; icon: string }) => void;

  // i18n / Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Auth
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
    tenantId: string;
    tenantName: string;
  } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  // Tenant (Multi-Tenant)
  tenants: [
    {
      id: 't-1',
      name: 'Global Corp France',
      slug: 'global-corp-france',
      type: 'country',
      color: '#3b82f6',
      icon: '🇫🇷',
      country: 'France',
      memberCount: 24,
      contentCount: 156,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: 't-2',
      name: 'Global Corp RDC',
      slug: 'global-corp-rdc',
      type: 'subsidiary',
      color: '#f59e0b',
      icon: '🇨🇩',
      country: 'RD Congo',
      memberCount: 12,
      contentCount: 67,
      isActive: true,
      createdAt: '2024-03-20',
    },
    {
      id: 't-3',
      name: 'TechBrand',
      slug: 'techbrand',
      type: 'brand',
      color: '#ef4444',
      icon: '🏢',
      country: 'France',
      memberCount: 8,
      contentCount: 42,
      isActive: true,
      createdAt: '2024-06-10',
    },
    {
      id: 't-4',
      name: 'Marketing Dept',
      slug: 'marketing-dept',
      type: 'department',
      color: '#8b5cf6',
      icon: '📣',
      country: 'France',
      memberCount: 6,
      contentCount: 89,
      isActive: true,
      createdAt: '2024-08-01',
    },
  ],
  activeTenantId: 't-1',
  setActiveTenant: (id) => set({ activeTenantId: id, activePage: 'dashboard' }),
  addTenant: (tenant) => set((s) => ({ tenants: [...s.tenants, tenant] })),

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
      type: 'validation_requested',
      title: 'Validation demandée',
      message: 'L\'article "Résultats Q2 2025" attend votre validation',
      read: false,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'n2',
      type: 'content_approved',
      title: 'Contenu approuvé',
      message: 'La newsletter "Flash Info Juin" a été approuvée',
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n3',
      type: 'content_published',
      title: 'Publication effectuée',
      message: 'L\'annonce "Mise à jour système" a été publiée',
      read: false,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n4',
      type: 'send_failed',
      title: 'Échec d\'envoi',
      message: 'L\'envoi de la newsletter "Weekly Digest" a échoué',
      read: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n5',
      type: 'new_assignment',
      title: 'Nouvelle attribution',
      message: 'Vous avez été assigné à l\'article "Guide interne"',
      read: true,
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n6',
      type: 'comment_mention',
      title: 'Mention dans un commentaire',
      message: '@vous dans "Stratégie contenu Q3"',
      read: true,
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n7',
      type: 'system',
      title: 'Mise à jour système',
      message: 'ContentFlow v3.2 est disponible',
      read: true,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n8',
      type: 'validation_requested',
      title: 'Validation demandée',
      message: 'Le communiqué "Partenariat stratégique" attend validation',
      read: false,
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
  ],
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
  favorites: ['dashboard', 'newsletters', 'articles'],
  toggleFavorite: (pageId) =>
    set((s) => ({
      favorites: s.favorites.includes(pageId)
        ? s.favorites.filter((f) => f !== pageId)
        : [...s.favorites, pageId],
    })),

  // Content detail drawer
  contentDetailOpen: false,
  setContentDetailOpen: (open) => set({ contentDetailOpen: open }),
  selectedContent: null,
  setSelectedContent: (content) => set({ selectedContent: content, contentDetailOpen: content !== null }),

  // Create content dialog
  createContentDialogOpen: false,
  setCreateContentDialogOpen: (open) => set({ createContentDialogOpen: open }),
  createContentType: 'article',
  setCreateContentType: (type) => set({ createContentType: type }),

  // Shortcuts help dialog
  shortcutsHelpOpen: false,
  setShortcutsHelpOpen: (open) => set({ shortcutsHelpOpen: open }),
  keyboardShortcutsOpen: false,
  setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),

  // Recent items
  recentItems: ['dashboard', 'newsletters', 'articles'],
  addRecentItem: (pageId) =>
    set((s) => {
      const filtered = s.recentItems.filter((id) => id !== pageId);
      return { recentItems: [pageId, ...filtered].slice(0, 8) };
    }),

  // Global API loading indicator
  isApiLoading: false,
  setApiLoading: (loading) => set({ isApiLoading: loading }),

  // Focus mode
  focusMode: false,
  setFocusMode: (focus) => set({ focusMode: focus }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  // Create workspace dialog
  createWorkspaceDialogOpen: false,
  setCreateWorkspaceDialogOpen: (open) => set({ createWorkspaceDialogOpen: open }),
  addWorkspace: (workspace) => set((s) => ({
    tenants: [...s.tenants, { ...workspace, type: 'brand', country: 'France', memberCount: 1, contentCount: 0, isActive: true, createdAt: new Date().toISOString() } as Tenant],
  })),

  // i18n / Locale
  locale: 'fr',
  setLocale: (locale) => set({ locale }),

  // Auth
  isAuthenticated: false,
  currentUser: null,
  login: () =>
    set({
      isAuthenticated: true,
      currentUser: {
        id: 'u-1',
        name: 'Marie Dupont',
        email: 'marie@globalcorp.com',
        avatar: '',
        role: 'tenant_admin' as UserRole,
        tenantId: 't-1',
        tenantName: 'Global Corp France',
      },
    }),
  logout: () => set({ isAuthenticated: false, currentUser: null }),
}));

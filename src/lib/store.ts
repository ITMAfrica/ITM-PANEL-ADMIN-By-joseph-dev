import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { apiFetch } from './api-client';
import { pathToPageId, resolveLegacyCommunicationPath } from './app-routes';
import type { PageId, Tenant, Notification, UserRole } from './types';

interface TimeEntry {
  id: string;
  taskName: string;
  projectColor: string;
  duration: number;
  timestamp: string;
}

interface TimeTrackerState {
  isTracking: boolean;
  isPaused: boolean;
  activeTaskName: string;
  activeProjectColor: string;
  elapsedSeconds: number;
  todayTotal: number;
  todayTasksCount: number;
  timeEntries: TimeEntry[];
}
import {
  DEFAULT_PUBLICATION_COMPOSER_TYPE,
  isComposerScheduledAtValid,
  type OpenPublicationComposerOptions,
  type PublicationComposerState,
} from './publication-composer';
import type { Locale } from './i18n';

const AUTH_STORAGE_KEY = 'itm-panel-auth';

let authPersistMode: 'local' | 'session' = 'session';

// Monotonic id used by checkAuth() to discard stale results (race guard).
let _lastCheckAuthId = 0;

const authStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    const local = localStorage.getItem(name);
    if (local != null) {
      // A session found in localStorage was persisted with "remember me".
      // authPersistMode resets to 'session' on every page load; without this,
      // the next persisted write would MOVE the session to sessionStorage and
      // delete the localStorage copy — silently destroying the remembered
      // session, so the user was logged out after closing the tab/browser.
      authPersistMode = 'local';
      return local;
    }
    return sessionStorage.getItem(name);
  },
  setItem: (name, value) => {
    const storage = authPersistMode === 'local' ? localStorage : sessionStorage;
    const other = authPersistMode === 'local' ? sessionStorage : localStorage;
    storage.setItem(name, value);
    other.removeItem(name);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

// Synchronous check used by AppEntry to know — before the first render —
// whether a persisted session exists and must be validated server-side.
export function hasPersistedAuthSession(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(AUTH_STORAGE_KEY) != null ||
    sessionStorage.getItem(AUTH_STORAGE_KEY) != null
  );
}

interface AppState {
  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Tenant (Multi-Tenant)
  tenants: Tenant[];
  activeTenantId: string;
  setActiveTenant: (id: string) => void;
  addTenant: (tenant: Tenant) => void;
  setWorkspaces: (tenants: Tenant[]) => void;
  fetchWorkspaces: () => Promise<void>;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  dashboardPlatform: 'summary' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  setDashboardPlatform: (platform: AppState['dashboardPlatform']) => void;
  dashboardTool: 'reports' | 'hashtag' | 'messageSettings' | 'documentation' | null;
  setDashboardTool: (tool: AppState['dashboardTool']) => void;

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

  // Unified publication composer
  publicationComposer: PublicationComposerState;
  openPublicationComposer: (opts?: OpenPublicationComposerOptions) => void;
  closePublicationComposer: () => void;

  // Shortcuts help dialog
  shortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (open: boolean) => void;
  keyboardShortcutsOpen: boolean;
  setKeyboardShortcutsOpen: (open: boolean) => void;

  // Global API loading indicator
  isApiLoading: boolean;
  setApiLoading: (loading: boolean) => void;

  // Create workspace dialog
  createWorkspaceDialogOpen: boolean;
  setCreateWorkspaceDialogOpen: (open: boolean) => void;
  addWorkspace: (workspace: { id: string; name: string; slug: string; color: string; icon: string }) => void;

  // i18n / Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Project dialog
  createProjectDialogOpen: boolean;
  setCreateProjectDialogOpen: (open: boolean) => void;

  // Time tracker
  timeTracker: TimeTrackerState;
  startTracking: (taskName: string, projectColor: string, _?: string) => void;
  stopTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  tickTimer: () => void;

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

// Derives the initial page from the browser URL so MainApp never mounts on
// the 'dashboard' default only to be corrected by useSyncAppUrl a beat later
// (that correction was the visible "the page navigates by itself" jump after
// every refresh). Legacy communication slugs map to their redirect target.
function getInitialPage(): PageId {
  if (typeof window === 'undefined') return 'dashboard';
  const page = pathToPageId(window.location.pathname) ?? 'dashboard';
  if (resolveLegacyCommunicationPath(page)) return 'editorial-calendar';
  return page;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Navigation
  activePage: getInitialPage(),
  setActivePage: (page) => set({ activePage: page }),

  // Tenant (Multi-Tenant)
  tenants: [],
  activeTenantId: '',
  setActiveTenant: (id) => set({ activeTenantId: id, activePage: 'dashboard' }),
  addTenant: (tenant) => set((s) => ({ tenants: [...s.tenants, tenant] })),
  setWorkspaces: (tenants) =>
    set((s) => ({
      tenants,
      activeTenantId:
        s.activeTenantId && tenants.some((t) => t.id === s.activeTenantId)
          ? s.activeTenantId
          : tenants[0]?.id ?? '',
    })),
  fetchWorkspaces: async () => {
    try {
      const res = await apiFetch('/workspaces');
      if (!res.ok) return;
      const workspaces = await res.json();
      if (!Array.isArray(workspaces)) return;
      const tenants: Tenant[] = workspaces.map((ws) => ({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        type: 'brand' as const,
        color: ws.color ?? '#3b82f6',
        icon: ws.icon ?? '🏢',
        country: 'France',
        memberCount: ws.members?.length ?? 1,
        contentCount: 0,
        isActive: true,
        createdAt: ws.createdAt ?? new Date().toISOString(),
      }));
      get().setWorkspaces(tenants);
    } catch {
      // workspaces unavailable until database is connected
    }
  },

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  dashboardPlatform: 'summary',
  setDashboardPlatform: (platform) => set({ dashboardPlatform: platform, dashboardTool: null }),
  dashboardTool: null,
  setDashboardTool: (tool) => set({ dashboardTool: tool, dashboardPlatform: 'summary' }),

  // Notifications
  notifications: [],
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
  favorites: [],
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

  publicationComposer: {
    open: false,
    type: DEFAULT_PUBLICATION_COMPOSER_TYPE,
    scheduledAt: undefined,
    editContentId: undefined,
    initialChannelIds: undefined,
  },
  openPublicationComposer: (opts) =>
    set({
      publicationComposer: {
        open: true,
        type:
          opts?.type ??
          (opts?.scheduledAt ? 'article' : DEFAULT_PUBLICATION_COMPOSER_TYPE),
        scheduledAt:
          opts?.scheduledAt && isComposerScheduledAtValid(opts.scheduledAt)
            ? opts.scheduledAt.toISOString()
            : undefined,
        editContentId: opts?.editContentId,
        initialChannelIds:
          opts?.initialChannelIds && opts.initialChannelIds.length > 0
            ? opts.initialChannelIds
            : undefined,
      },
    }),
  closePublicationComposer: () =>
    set((s) => ({
      publicationComposer: {
        ...s.publicationComposer,
        open: false,
        scheduledAt: undefined,
        editContentId: undefined,
        initialChannelIds: undefined,
      },
    })),

  // Shortcuts help dialog
  shortcutsHelpOpen: false,
  setShortcutsHelpOpen: (open) => set({ shortcutsHelpOpen: open }),
  keyboardShortcutsOpen: false,
  setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),

  // Global API loading indicator
  isApiLoading: false,
  setApiLoading: (loading) => set({ isApiLoading: loading }),

  // Create workspace dialog
  createWorkspaceDialogOpen: false,
  setCreateWorkspaceDialogOpen: (open) => set({ createWorkspaceDialogOpen: open }),
  addWorkspace: (workspace) =>
    set((s) => {
      const tenant = {
        ...workspace,
        type: 'brand',
        country: 'France',
        memberCount: 1,
        contentCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      } as Tenant;
      const isFirst = s.tenants.length === 0 || !s.activeTenantId;
      return {
        tenants: [...s.tenants, tenant],
        activeTenantId: isFirst ? tenant.id : s.activeTenantId,
        currentUser: s.currentUser
          ? {
              ...s.currentUser,
              tenantId: isFirst ? tenant.id : s.currentUser.tenantId,
              tenantName: isFirst ? tenant.name : s.currentUser.tenantName,
            }
          : null,
      };
    }),

  // i18n / Locale
  locale: 'fr',
  setLocale: (locale) => set({ locale }),

  // Project dialog
  createProjectDialogOpen: false,
  setCreateProjectDialogOpen: (open) => set({ createProjectDialogOpen: open }),

  // Time tracker
  timeTracker: {
    isTracking: false,
    isPaused: false,
    activeTaskName: '',
    activeProjectColor: '#3b82f6',
    elapsedSeconds: 0,
    todayTotal: 0,
    todayTasksCount: 0,
    timeEntries: [],
  },
  startTracking: (taskName, projectColor) =>
    set((s) => ({
      timeTracker: {
        ...s.timeTracker,
        isTracking: true,
        isPaused: false,
        activeTaskName: taskName,
        activeProjectColor: projectColor,
        elapsedSeconds: 0,
      },
    })),
  stopTracking: () =>
    set((s) => {
      const entry: TimeEntry = {
        id: Date.now().toString(36),
        taskName: s.timeTracker.activeTaskName,
        projectColor: s.timeTracker.activeProjectColor,
        duration: s.timeTracker.elapsedSeconds,
        timestamp: new Date().toISOString(),
      };
      return {
        timeTracker: {
          ...s.timeTracker,
          isTracking: false,
          isPaused: false,
          activeTaskName: '',
          activeProjectColor: '#3b82f6',
          elapsedSeconds: 0,
          todayTotal: s.timeTracker.todayTotal + s.timeTracker.elapsedSeconds,
          todayTasksCount: s.timeTracker.todayTasksCount + 1,
          timeEntries: [entry, ...s.timeTracker.timeEntries].slice(0, 20),
        },
      };
    }),
  pauseTracking: () =>
    set((s) => ({
      timeTracker: { ...s.timeTracker, isPaused: true },
    })),
  resumeTracking: () =>
    set((s) => ({
      timeTracker: { ...s.timeTracker, isPaused: false },
    })),
  tickTimer: () =>
    set((s) => ({
      timeTracker: {
        ...s.timeTracker,
        elapsedSeconds: s.timeTracker.isTracking && !s.timeTracker.isPaused
          ? s.timeTracker.elapsedSeconds + 1
          : s.timeTracker.elapsedSeconds,
      },
    })),

  // Auth
  isAuthenticated: false,
  currentUser: null,
  _hasHydrated: false,
  setHasHydrated: (value) => set({ _hasHydrated: value }),
  login: async (email, password, rememberMe = false) => {
    authPersistMode = rememberMe ? 'local' : 'session';
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({
        isAuthenticated: true,
        currentUser: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar ?? '',
          role: data.user.role as UserRole,
          tenantId: data.user.tenantId,
          tenantName: data.user.tenantName,
        },
        activeTenantId: data.user.tenantId || get().activeTenantId,
      });
      await get().fetchWorkspaces();
      return true;
    } catch {
      return false;
    }
  },
  register: async (name, email, password, rememberMe = false) => {
    authPersistMode = rememberMe ? 'local' : 'session';
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({
        isAuthenticated: true,
        currentUser: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar ?? '',
          role: data.user.role as UserRole,
          tenantId: data.user.tenantId,
          tenantName: data.user.tenantName,
        },
        activeTenantId: data.user.tenantId || get().activeTenantId,
      });
      return true;
    } catch {
      return false;
    }
  },
  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    authStorage.removeItem(AUTH_STORAGE_KEY);
    set({ isAuthenticated: false, currentUser: null });
  },
  checkAuth: async () => {
    // Race-condition guard: only the most recent checkAuth call may apply its
    // result. A stale 401 (e.g. fired before a fresh login set the session)
    // must NOT overwrite a newer authenticated state — that was the root cause
    // of the login/logout cycle.
    const callId = ++_lastCheckAuthId;
    try {
      const res = await apiFetch('/auth/me');
      if (callId !== _lastCheckAuthId) return;
      if (!res.ok) {
        // Only an explicit 401/403 means the session is invalid. Any other
        // status (5xx, etc.) is a server problem — keep the local session
        // instead of kicking the user back to the login screen.
        if (res.status === 401 || res.status === 403) {
          authStorage.removeItem(AUTH_STORAGE_KEY);
          set({ isAuthenticated: false, currentUser: null });
        }
        return;
      }
      const data = await res.json();
      if (callId !== _lastCheckAuthId) return;
      if (data.user) {
        set({
          isAuthenticated: true,
          currentUser: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar ?? '',
            role: data.user.role as UserRole,
            tenantId: data.user.tenantId,
            tenantName: data.user.tenantName,
          },
          activeTenantId: data.user.tenantId || get().activeTenantId,
        });
        await get().fetchWorkspaces();
      }
    } catch {
      // Network failure (API down/restarting, CORS, offline): NOT an auth
      // signal. Keep the persisted session — the next successful /auth/me
      // will re-validate it. Logging out here caused the connect/disconnect
      // loop whenever the API was briefly unreachable during page load.
    }
  },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      skipHydration: true,
    }
  )
);

export function openPublicationComposer(options?: OpenPublicationComposerOptions): void {
  useAppStore.getState().openPublicationComposer(options);
}

export function closePublicationComposer(): void {
  useAppStore.getState().closePublicationComposer();
}

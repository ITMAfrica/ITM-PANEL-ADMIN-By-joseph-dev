'use client';

import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardView } from '@/components/views/dashboard-view';
import { AutomationsView } from '@/components/views/automations-view';
import { ReportsView } from '@/components/views/reports-view';
import { SettingsView } from '@/components/views/settings-view';
import { EditorialCalendarView } from '@/components/views/editorial-calendar-view';
import { LibraryView } from '@/components/views/library-view';
import { MediaView } from '@/components/views/media-view';
import { TemplatesView } from '@/components/views/templates-view';
import { DraftsView } from '@/components/views/drafts-view';
import { PublishedView } from '@/components/views/published-view';
import { ArchiveView } from '@/components/views/archive-view';
import { UsersView } from '@/components/views/users-view';
import { RolesView } from '@/components/views/roles-view';
import { TenantsView } from '@/components/views/tenants-view';
import { WorkspaceMembersView } from '@/components/views/workspace-members-view';
import { DocumentationView } from '@/components/views/documentation-view';
import { ConversationView } from '@/components/views/conversation-view';
import { AuditView } from '@/components/views/audit-view';
import { TopBar } from '@/components/top-bar';
import { NotificationPanel } from '@/components/notification-panel';
import { CreateWorkspaceDialog } from '@/components/create-workspace-dialog';
import { CreatePublicationComposerOverlay } from '@/components/create-publication-composer';
import { ContentDetailDrawer } from '@/components/content-detail-drawer';
import { ShortcutsDialog } from '@/components/shortcuts-dialog';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useSyncAppUrl } from '@/hooks/use-sync-app-url';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Plus, FileText, Target, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/page-transition';
import { shouldShowAppSidebar } from '@/lib/navigation';
import type { OpenPublicationComposerOptions } from '@/lib/publication-composer';

import { LEGACY_COMMUNICATION_REDIRECTS } from '@/lib/app-routes';

const LEGACY_HUB_PAGE_SET = new Set<string>(Object.keys(LEGACY_COMMUNICATION_REDIRECTS));

const viewMap: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  'editorial-calendar': EditorialCalendarView,
  conversation: ConversationView,
  library: LibraryView,
  media: MediaView,
  templates: TemplatesView,
  drafts: DraftsView,
  published: PublishedView,
  archive: ArchiveView,
  automations: AutomationsView,
  reports: ReportsView,
  users: UsersView,
  roles: RolesView,
  tenants: TenantsView,
  'workspace-members': WorkspaceMembersView,
  audit: AuditView,
  documentation: DocumentationView,
  settings: SettingsView,
};

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.getElementById('main-content-area');
      if (mainEl) {
        setVisible(mainEl.scrollTop > 400);
      }
    };

    const mainEl = document.getElementById('main-content-area');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainEl.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const mainEl = document.getElementById('main-content-area');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-40 h-10 w-10 rounded-full bg-[oklch(0.55_0.18_250)] text-white shadow-lg hover:shadow-xl hover:bg-[oklch(0.55_0.18_250/0.9)] transition-shadow flex items-center justify-center"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function openCalendarComposer(opts?: OpenPublicationComposerOptions) {
  const store = useAppStore.getState();
  store.setActivePage('editorial-calendar');
  store.openPublicationComposer(opts);
}

function MobileFAB() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2 items-end"
          >
            <button
              onClick={() => {
                openCalendarComposer();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background shadow-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
              <span>{t.topbar.newContent}</span>
            </button>
            <button
              onClick={() => {
                openCalendarComposer({ type: 'article' });
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background shadow-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              <Target className="h-4 w-4 text-amber-500" />
              <span>{t.topbar.newCampaign}</span>
            </button>
            <button
              onClick={() => {
                openCalendarComposer({ type: 'article', scheduledAt: new Date() });
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background shadow-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              <Clock className="h-4 w-4 text-rose-500" />
              <span>{t.topbar.schedulePublish}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-colors',
          open
            ? 'bg-rose-500 text-white rotate-45'
            : 'bg-[oklch(0.55_0.18_250)] text-white'
        )}
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}


function LazyOverlays() {
  const notificationPanelOpen = useAppStore((s) => s.notificationPanelOpen);
  const contentDetailOpen = useAppStore((s) => s.contentDetailOpen);
  const shortcutsHelpOpen = useAppStore((s) => s.shortcutsHelpOpen);
  const keyboardShortcutsOpen = useAppStore((s) => s.keyboardShortcutsOpen);
  const createWorkspaceDialogOpen = useAppStore((s) => s.createWorkspaceDialogOpen);

  return (
    <>
      {notificationPanelOpen && <NotificationPanel />}
      {contentDetailOpen && <ContentDetailDrawer />}
      {/* Always mounted so Radix Dialog can release body pointer-events on close */}
      <CreatePublicationComposerOverlay />
      {createWorkspaceDialogOpen && <CreateWorkspaceDialog />}
      {shortcutsHelpOpen && <ShortcutsDialog />}
      {keyboardShortcutsOpen && <KeyboardShortcutsDialog />}
    </>
  );
}

export function MainApp() {
  const activePage = useAppStore((s) => s.activePage);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const showSidebar = shouldShowAppSidebar(activePage);

  useKeyboardShortcuts();
  useSyncAppUrl();

  useEffect(() => {
    const { fetchWorkspaces, setCreateWorkspaceDialogOpen } = useAppStore.getState();
    fetchWorkspaces().then(() => {
      const state = useAppStore.getState();
      if (state.tenants.length === 0) {
        setCreateWorkspaceDialogOpen(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!showSidebar) {
      useAppStore.getState().setMobileSidebarOpen(false);
    }
  }, [showSidebar]);

  const ActiveView =
    activePage === 'editorial-calendar' || LEGACY_HUB_PAGE_SET.has(activePage)
      ? EditorialCalendarView
      : viewMap[activePage] || DashboardView;

  return (
    <div className="min-h-screen bg-content-bg">
      {/* Fixed full-width top navigation (Metricool-style) */}
      <TopBar />

      {/* Body: sidebar (home only) + scrollable content below top bar */}
      <div className="flex pt-18 min-h-screen overflow-x-hidden">
        {showSidebar && <AppSidebar />}

        <div
          className={cn(
            'flex flex-col min-h-[calc(100vh-4.5rem)] w-full transition-all duration-300',
            showSidebar && (sidebarCollapsed
              ? 'lg:w-[calc(100vw-68px)] lg:ml-[68px]'
              : 'lg:w-[calc(100vw-260px)] lg:ml-[260px]')
          )}
        >
          <main
            id="main-content-area"
            className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden relative metricool-content-bg"
          >
            <div className="relative z-10">
              <PageTransition pageId={activePage}>
                <ActiveView />
              </PageTransition>
            </div>
          </main>
        </div>
      </div>

      {/* Back to top button */}
      <BackToTopButton />

      {/* Mobile FAB */}
      <MobileFAB />

      <LazyOverlays />
    </div>
  );
}

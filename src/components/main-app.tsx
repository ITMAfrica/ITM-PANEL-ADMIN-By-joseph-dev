'use client';

import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardView } from '@/components/views/dashboard-view';
import { TasksView } from '@/components/views/tasks-view';
import { ProjectsView } from '@/components/views/projects-view';
import { CalendarView } from '@/components/views/calendar-view';
import { MessagesView } from '@/components/views/messages-view';
import { MeetingsView } from '@/components/views/meetings-view';
import { FilesView } from '@/components/views/files-view';
import { WikiView } from '@/components/views/wiki-view';
import { ActivityView } from '@/components/views/activity-view';
import { MembersView } from '@/components/views/members-view';
import { TeamsView } from '@/components/views/teams-view';
import { ReportsView } from '@/components/views/reports-view';
import { AutomationsView } from '@/components/views/automations-view';
import { SettingsView } from '@/components/views/settings-view';
import { TopBar } from '@/components/top-bar';
import { NotificationPanel } from '@/components/notification-panel';
import { CreateWorkspaceDialog } from '@/components/create-workspace-dialog';
import { CreateTaskDialog } from '@/components/create-task-dialog';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { TaskDetailDrawer } from '@/components/task-detail-drawer';
import { ShortcutsDialog } from '@/components/shortcuts-dialog';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { ConnectionStatus } from '@/components/connection-status';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowUp, Plus, CheckSquare, FolderKanban, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/page-transition';

const viewMap: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  tasks: TasksView,
  projects: ProjectsView,
  calendar: CalendarView,
  messages: MessagesView,
  meetings: MeetingsView,
  files: FilesView,
  wiki: WikiView,
  activity: ActivityView,
  members: MembersView,
  teams: TeamsView,
  reports: ReportsView,
  automations: AutomationsView,
  settings: SettingsView,
};



function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="relative bg-background/50 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_160/0.2)] to-transparent" />
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground/60">TeamFlow</span>
        <span className="text-muted-foreground/40">v2.4.0</span>
        <span className="hidden sm:inline text-muted-foreground/40">•</span>
        <span className="hidden sm:inline">{t.footer.rights}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden md:flex items-center gap-1">
          {t.footer.madeWith} <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> {t.footer.byTeam}
        </span>
        <button
          onClick={() => useAppStore.getState().setShortcutsHelpOpen(true)}
          className="flex items-center gap-1 hover:text-foreground/80 transition-colors"
        >
          <kbd className="bg-muted border border-border rounded px-1 py-0.5 text-[10px] font-mono">?</kbd>
          <span className="hidden sm:inline">{t.footer.shortcuts}</span>
        </button>
      </div>
    </footer>
  );
}

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
          className="fixed bottom-20 right-6 z-40 h-10 w-10 rounded-full bg-[oklch(0.55_0.15_160)] text-white shadow-lg hover:shadow-xl hover:bg-[oklch(0.55_0.15_160/0.9)] transition-shadow flex items-center justify-center"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
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
                useAppStore.getState().setCreateTaskDialogOpen(true);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background shadow-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              <CheckSquare className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
              <span>{t.sidebar.quickTask}</span>
            </button>
            <button
              onClick={() => {
                useAppStore.getState().setCreateProjectDialogOpen(true);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background shadow-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              <FolderKanban className="h-4 w-4 text-amber-500" />
              <span>{t.sidebar.quickProject}</span>
            </button>
            <button
              onClick={() => {
                useAppStore.getState().setActivePage('meetings');
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background shadow-lg border text-xs font-medium hover:bg-muted transition-colors"
            >
              <Video className="h-4 w-4 text-rose-500" />
              <span>{t.sidebar.quickMeeting}</span>
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
            : 'bg-[oklch(0.55_0.15_160)] text-white'
        )}
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

export function MainApp() {
  const activePage = useAppStore((s) => s.activePage);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  useKeyboardShortcuts();

  const ActiveView = viewMap[activePage] || DashboardView;

  return (
    <>
    <ConnectionStatus />
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
        )}
      >
        <TopBar />
        <main
          id="main-content-area"
          className="flex-1 p-4 md:p-6 overflow-auto relative dot-pattern"
        >
          {/* Subtle dot-pattern background overlay */}
          <div className="relative z-10">
            <PageTransition pageId={activePage}>
              <ActiveView />
            </PageTransition>
          </div>
        </main>
        <AppFooter />
      </div>

      {/* Back to top button */}
      <BackToTopButton />

      {/* Mobile FAB */}
      <MobileFAB />

      {/* Notification Panel (slide-out overlay) */}
      <NotificationPanel />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer />

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog />

      {/* Create Task Dialog */}
      <CreateTaskDialog />

      {/* Create Project Dialog */}
      <CreateProjectDialog />

      {/* Keyboard Shortcuts Dialog (legacy, triggered by ?) */}
      <ShortcutsDialog />

      {/* Keyboard Shortcuts Dialog (new, triggered by ⌘/) */}
      <KeyboardShortcutsDialog />

      {/* Toast Notifications */}
      <Toaster />
    </div>
    </>
  );
}

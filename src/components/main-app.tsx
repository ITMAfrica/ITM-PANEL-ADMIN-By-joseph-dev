'use client';

import { useAppStore } from '@/lib/store';
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
import { cn } from '@/lib/utils';

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

export function MainApp() {
  const activePage = useAppStore((s) => s.activePage);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  const ActiveView = viewMap[activePage] || DashboardView;

  return (
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
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <ActiveView />
        </main>
      </div>
    </div>
  );
}

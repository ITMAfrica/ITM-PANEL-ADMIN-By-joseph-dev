'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  BookOpen,
  Activity,
  Users,
  UserCircle,
  BarChart3,
  Zap,
  Settings,
} from 'lucide-react';
import type { PageId } from '@/lib/types';

const pages: { icon: React.ReactNode; label: string; pageId: PageId }[] = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', pageId: 'dashboard' },
  { icon: <CheckSquare className="h-4 w-4" />, label: 'Tasks', pageId: 'tasks' },
  { icon: <FolderKanban className="h-4 w-4" />, label: 'Projects', pageId: 'projects' },
  { icon: <Calendar className="h-4 w-4" />, label: 'Calendar', pageId: 'calendar' },
  { icon: <MessageSquare className="h-4 w-4" />, label: 'Messages', pageId: 'messages' },
  { icon: <Video className="h-4 w-4" />, label: 'Meetings', pageId: 'meetings' },
  { icon: <FileText className="h-4 w-4" />, label: 'Files', pageId: 'files' },
  { icon: <BookOpen className="h-4 w-4" />, label: 'Wiki & Notes', pageId: 'wiki' },
  { icon: <Activity className="h-4 w-4" />, label: 'Activity', pageId: 'activity' },
  { icon: <Users className="h-4 w-4" />, label: 'Members', pageId: 'members' },
  { icon: <UserCircle className="h-4 w-4" />, label: 'Teams', pageId: 'teams' },
  { icon: <BarChart3 className="h-4 w-4" />, label: 'Reports', pageId: 'reports' },
  { icon: <Zap className="h-4 w-4" />, label: 'Automations', pageId: 'automations' },
  { icon: <Settings className="h-4 w-4" />, label: 'Settings', pageId: 'settings' },
];

export function SearchDialog() {
  const { searchOpen, setSearchOpen, setActivePage } = useAppStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [searchOpen, setSearchOpen]);

  const runCommand = (command: () => void) => {
    setSearchOpen(false);
    command();
  };

  return (
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.pageId}
              onSelect={() => runCommand(() => setActivePage(page.pageId))}
            >
              {page.icon}
              <span className="ml-2">{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => setActivePage('tasks'))}>
            <CheckSquare className="h-4 w-4" />
            <span className="ml-2">Create new task</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActivePage('projects'))}>
            <FolderKanban className="h-4 w-4" />
            <span className="ml-2">Create new project</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActivePage('meetings'))}>
            <Video className="h-4 w-4" />
            <span className="ml-2">Schedule meeting</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

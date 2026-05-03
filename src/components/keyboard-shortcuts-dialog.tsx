'use client';

import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  Keyboard,
  Search,
  Plus,
  FolderKanban,
  PanelLeftClose,
  Bell,
  LayoutDashboard,
  ListTodo,
  FolderTree,
  CalendarDays,
  MessageSquare,
  Video,
  FileIcon,
  BookOpen,
  Activity,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  keys: string[];
  label: string;
  icon?: React.ReactNode;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

function Kbd({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <kbd
      className={cn(
        'bg-muted/80 border border-border/80 rounded px-1.5 py-0.5 text-[11px] font-mono inline-flex items-center gap-0.5 shadow-sm select-none',
        small && 'px-1 text-[10px]'
      )}
    >
      {children}
    </kbd>
  );
}

function ShortcutRow({ keys, label, icon }: ShortcutItem) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors group"
    >
      <span className="text-sm text-foreground/80 flex items-center gap-2">
        {icon && (
          <span className="text-muted-foreground group-hover:text-[oklch(0.55_0.15_160)] transition-colors">
            {icon}
          </span>
        )}
        {label}
      </span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <Kbd>{key}</Kbd>
            {i < keys.length - 1 && (
              <span className="text-muted-foreground/40 text-[10px]">+</span>
            )}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function KeyboardShortcutsDialog() {
  const { keyboardShortcutsOpen, setKeyboardShortcutsOpen } = useAppStore();
  const { t } = useTranslation();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const mod = isMac ? '⌘' : 'Ctrl';
  const shift = isMac ? '⇧' : 'Shift';

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: t.shortcuts.navigation,
      items: [
        {
          keys: [mod, '1'],
          label: t.shortcuts.dashboard,
          icon: <LayoutDashboard className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '2'],
          label: t.shortcuts.tasks,
          icon: <ListTodo className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '3'],
          label: t.shortcuts.projects,
          icon: <FolderTree className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '4'],
          label: t.shortcuts.calendar,
          icon: <CalendarDays className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '5'],
          label: t.shortcuts.messages,
          icon: <MessageSquare className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '6'],
          label: t.shortcuts.meetings,
          icon: <Video className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '7'],
          label: t.shortcuts.files,
          icon: <FileIcon className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '8'],
          label: t.shortcuts.wiki,
          icon: <BookOpen className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, '9'],
          label: t.shortcuts.activity,
          icon: <Activity className="h-3.5 w-3.5" />,
        },
      ],
    },
    {
      title: t.shortcuts.actions,
      items: [
        {
          keys: [mod, 'K'],
          label: t.shortcuts.search,
          icon: <Search className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, 'N'],
          label: t.shortcuts.newTask,
          icon: <Plus className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, shift, 'P'],
          label: t.shortcuts.newProject,
          icon: <FolderKanban className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, 'B'],
          label: t.shortcuts.toggleSidebar,
          icon: <PanelLeftClose className="h-3.5 w-3.5" />,
        },
        {
          keys: [mod, shift, 'I'],
          label: t.shortcuts.notifications,
          icon: <Bell className="h-3.5 w-3.5" />,
        },
      ],
    },
    {
      title: t.shortcuts.help,
      items: [
        {
          keys: [mod, '/'],
          label: t.shortcuts.showShortcuts,
          icon: <Keyboard className="h-3.5 w-3.5" />,
        },
        {
          keys: ['?'],
          label: t.shortcuts.showHelp,
          icon: <HelpCircle className="h-3.5 w-3.5" />,
        },
        {
          keys: ['Esc'],
          label: t.shortcuts.closeDialog,
          icon: null,
        },
      ],
    },
  ];

  return (
    <Dialog open={keyboardShortcutsOpen} onOpenChange={setKeyboardShortcutsOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-[oklch(0.55_0.15_160/0.08)] via-[oklch(0.55_0.15_160/0.04)] to-transparent border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.48_0.12_160)] text-white shadow-sm">
                  <Keyboard className="h-4 w-4" />
                </div>
                <span className="bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.45_0.12_160)] bg-clip-text text-transparent font-bold">
                  {t.shortcuts.title}
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t.shortcuts.title}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {groupIndex > 0 && <Separator className="mb-5" />}
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 px-2">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item, index) => (
                    <motion.div
                      key={item.keys.join('-')}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.05 + index * 0.02 }}
                    >
                      <ShortcutRow
                        keys={item.keys}
                        label={item.label}
                        icon={item.icon}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-6 py-3 border-t bg-muted/20">
            <p className="text-[11px] text-muted-foreground text-center">
              {t.shortcuts.footerHint}
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

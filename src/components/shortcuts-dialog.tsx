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

interface ShortcutItem {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs font-mono inline-flex items-center gap-0.5">
      {children}
    </kbd>
  );
}

function ShortcutRow({ keys, label }: ShortcutItem) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-foreground/80">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <Kbd>{key}</Kbd>
            {i < keys.length - 1 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShortcutsDialog() {
  const { shortcutsHelpOpen, setShortcutsHelpOpen } = useAppStore();
  const { t } = useTranslation();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: t.shortcuts.navigation,
      items: [
        { keys: ['1'], label: t.shortcuts.dashboard },
        { keys: ['2'], label: t.shortcuts.tasks },
        { keys: ['3'], label: t.shortcuts.projects },
        { keys: ['4'], label: t.shortcuts.calendar },
        { keys: ['5'], label: t.shortcuts.messages },
        { keys: ['6'], label: t.shortcuts.meetings },
        { keys: ['7'], label: t.shortcuts.files },
        { keys: ['8'], label: t.shortcuts.wiki },
      ],
    },
    {
      title: t.shortcuts.actions,
      items: [
        { keys: ['⌘', 'N'], label: t.shortcuts.newTask },
        { keys: ['⌘', '⇧', 'N'], label: t.shortcuts.newProject },
        { keys: ['⌘', 'K'], label: t.shortcuts.search },
        { keys: ['⌘', '\\'], label: t.shortcuts.toggleSidebar },
        { keys: ['⌘', '⇧', 'I'], label: t.shortcuts.notifications },
      ],
    },
    {
      title: t.shortcuts.help,
      items: [
        { keys: ['?'], label: t.shortcuts.showHelp },
      ],
    },
  ];

  return (
    <Dialog open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">{t.shortcuts.title}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t.shortcuts.title}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {groupIndex > 0 && <Separator className="mb-4" />}
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <ShortcutRow
                      key={item.keys.join('-')}
                      keys={item.keys}
                      label={item.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

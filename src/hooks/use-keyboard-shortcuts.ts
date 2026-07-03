'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { shouldShowAppSidebar } from '@/lib/navigation';

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const isMeta = e.metaKey || e.ctrlKey;
      const store = useAppStore.getState();

      if (e.key === 'Escape') {
        if (store.createProjectDialogOpen) {
          store.setCreateProjectDialogOpen(false);
          return;
        }
        if (store.createWorkspaceDialogOpen) {
          store.setCreateWorkspaceDialogOpen(false);
          return;
        }
        if (store.keyboardShortcutsOpen) {
          store.setKeyboardShortcutsOpen(false);
          return;
        }
        if (store.shortcutsHelpOpen) {
          store.setShortcutsHelpOpen(false);
          return;
        }
        if (store.notificationPanelOpen) {
          store.setNotificationPanelOpen(false);
          return;
        }
        return;
      }

      if (isInputField) return;

      if (isMeta && e.key === 'b') {
        if (!shouldShowAppSidebar(store.activePage)) return;
        e.preventDefault();
        store.toggleSidebar();
        return;
      }

      if (isMeta && e.key === '/') {
        e.preventDefault();
        store.setKeyboardShortcutsOpen(!store.keyboardShortcutsOpen);
        return;
      }

      if (isMeta && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        store.setNotificationPanelOpen(true);
        return;
      }

      if (isMeta && !e.altKey && !e.shiftKey && e.key === '1') {
        e.preventDefault();
        store.setActivePage('dashboard');
        return;
      }

      if (e.key === '?' && !isMeta) {
        e.preventDefault();
        store.setShortcutsHelpOpen(!store.shortcutsHelpOpen);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function useKeyboardShortcuts() {
  const {
    setActivePage,
    setSearchOpen,
    toggleSidebar,
    setCreateTaskDialogOpen,
    setCreateProjectDialogOpen,
    setNotificationPanelOpen,
    setKeyboardShortcutsOpen,
    setShortcutsHelpOpen,
    setTaskDetailOpen,
    setCreateWorkspaceDialogOpen,
    searchOpen,
    createTaskDialogOpen,
    createProjectDialogOpen,
    keyboardShortcutsOpen,
    shortcutsHelpOpen,
    notificationPanelOpen,
    taskDetailOpen,
    createWorkspaceDialogOpen,
  } = useAppStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs (except for Escape)
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const isMeta = e.metaKey || e.ctrlKey;

      // Escape — close any open dialog/panel
      if (e.key === 'Escape') {
        const store = useAppStore.getState();
        if (store.searchOpen) {
          store.setSearchOpen(false);
          return;
        }
        if (store.createTaskDialogOpen) {
          store.setCreateTaskDialogOpen(false);
          return;
        }
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
        if (store.taskDetailOpen) {
          store.setTaskDetailOpen(false);
          store.setSelectedTask(null);
          return;
        }
        return;
      }

      // All remaining shortcuts should not fire when user is typing in an input
      if (isInputField) return;

      // ⌘K / Ctrl+K — Search
      if (isMeta && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // ⌘N / Ctrl+N — New task
      if (isMeta && !e.shiftKey && e.key === 'n') {
        e.preventDefault();
        setCreateTaskDialogOpen(true);
        return;
      }

      // ⌘⇧P / Ctrl+Shift+P — New project
      if (isMeta && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setCreateProjectDialogOpen(true);
        return;
      }

      // ⌘B / Ctrl+B — Toggle sidebar
      if (isMeta && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // ⌘/ / Ctrl+/ — Show keyboard shortcuts dialog
      if (isMeta && e.key === '/') {
        e.preventDefault();
        const store = useAppStore.getState();
        store.setKeyboardShortcutsOpen(!store.keyboardShortcutsOpen);
        return;
      }

      // ⌘⇧I / Ctrl+Shift+I — Notifications
      if (isMeta && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        setNotificationPanelOpen(true);
        return;
      }

      // ⌘1-9 / Ctrl+1-9 — Navigate to views
      if (isMeta && !e.altKey && !e.shiftKey) {
        const pageMap: Record<string, Parameters<typeof setActivePage>[0]> = {
          '1': 'dashboard',
          '2': 'tasks',
          '3': 'projects',
          '4': 'calendar',
          '5': 'messages',
          '6': 'meetings',
          '7': 'files',
          '8': 'wiki',
          '9': 'activity',
        };
        const page = pageMap[e.key];
        if (page) {
          e.preventDefault();
          setActivePage(page);
          return;
        }
      }

      // ? — Show keyboard shortcuts help (without modifier, but not in input)
      if (e.key === '?' && !isMeta) {
        e.preventDefault();
        const store = useAppStore.getState();
        store.setShortcutsHelpOpen(!store.shortcutsHelpOpen);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActivePage,
    setSearchOpen,
    toggleSidebar,
    setCreateTaskDialogOpen,
    setCreateProjectDialogOpen,
    setNotificationPanelOpen,
    setKeyboardShortcutsOpen,
    setShortcutsHelpOpen,
    setTaskDetailOpen,
    setCreateWorkspaceDialogOpen,
    searchOpen,
    createTaskDialogOpen,
    createProjectDialogOpen,
    keyboardShortcutsOpen,
    shortcutsHelpOpen,
    notificationPanelOpen,
    taskDetailOpen,
    createWorkspaceDialogOpen,
  ]);
}

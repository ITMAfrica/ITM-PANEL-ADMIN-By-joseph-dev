'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/login-page';
import { MainApp } from '@/components/main-app';

export function AppEntry() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);

  useEffect(() => {
    useAppStore.persist.rehydrate();
    useAppStore.getState().checkAuth();
  }, []);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}

'use client';

import { useEffect, useState } from 'react';
import { useAppStore, hasPersistedAuthSession } from '@/lib/store';
import { LoginPage } from '@/components/login-page';
import { MainApp } from '@/components/main-app';

// Module scope: survives component remounts within the same page load.
// Navigating between the root page (/) and the dynamic [page] route remounts
// AppEntry every time; without this flag each remount re-ran the full
// rehydrate + /auth/me + /workspaces sequence and flashed the loader for
// seconds on every single navigation.
let authValidatedThisLoad = false;

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function AppEntry() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  // Initialized synchronously from storage: when a persisted session exists
  // and has not been validated yet this page load, the loader stays up from
  // the very first render until /auth/me answers. Remounts after the first
  // validation skip the loader entirely.
  const [validating, setValidating] = useState(
    () => !authValidatedThisLoad && hasPersistedAuthSession()
  );

  useEffect(() => {
    let cancelled = false;
    // Rehydrate FIRST, then validate the persisted session server-side.
    // Running rehydrate() and checkAuth() in parallel caused a race: a stale
    // /auth/me 401 (fired before any session existed) resolved after a fresh
    // login and kicked the user back to the login screen in a loop.
    void (async () => {
      try {
        await useAppStore.persist.rehydrate();
        if (cancelled) return;
        // Validate the persisted session server-side ONCE per page load.
        // Set the flag before any await so StrictMode double-effects and
        // route remounts cannot start a second /auth/me.
        if (!authValidatedThisLoad) {
          authValidatedThisLoad = true;
          const { isAuthenticated, currentUser } = useAppStore.getState();
          // Only hit /auth/me when we actually have a persisted session to verify.
          // On a cold start (no session) there is nothing to check — showing the
          // login page directly avoids an unnecessary 401.
          if (isAuthenticated && currentUser) {
            await useAppStore.getState().checkAuth();
          }
        }
      } finally {
        // Always release the loader — even if rehydrate/checkAuth throws —
        // otherwise the app would hang on the spinner forever.
        if (!cancelled) setValidating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hasHydrated || validating) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}

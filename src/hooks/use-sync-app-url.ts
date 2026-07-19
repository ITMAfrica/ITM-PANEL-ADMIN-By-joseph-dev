'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { safeReplace } from '@/lib/safe-navigate';
import {
  pageIdToPath,
  pathToPageId,
  resolveLegacyCommunicationPath,
} from '@/lib/app-routes';

function pathOnly(pathOrUrl: string): string {
  return pathOrUrl.split('?')[0] || '/';
}

function currentFullPath(pathname: string): string {
  return (
    pathname + (typeof window !== 'undefined' ? window.location.search : '')
  );
}

/**
 * Keeps Zustand `activePage` and the browser URL in sync (bidirectional).
 * Mount once in MainApp — all existing setActivePage() calls update the URL automatically.
 *
 * On refresh / direct link: URL must win first (activePage defaults to dashboard and is not persisted).
 * State → URL must not strip page-owned query params (e.g. editorial-calendar tabs).
 */
export function useSyncAppUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const skipUrlPush = useRef(false);
  const skipStatePull = useRef(false);
  const lastPathname = useRef<string | null>(null);

  // Browser navigation / direct URL / refresh → Zustand
  useLayoutEffect(() => {
    if (skipStatePull.current) {
      skipStatePull.current = false;
      lastPathname.current = pathname;
      return;
    }

    // Skip only on same-path re-runs after init — never skip first mount (refresh).
    if (lastPathname.current === pathname) {
      return;
    }
    lastPathname.current = pathname;

    const pageFromUrl = pathToPageId(pathname);
    if (!pageFromUrl) return;

    const legacyRedirect = resolveLegacyCommunicationPath(pageFromUrl);
    if (legacyRedirect) {
      skipUrlPush.current = true;
      setActivePage('editorial-calendar');
      if (currentFullPath(pathname) !== legacyRedirect) {
        skipStatePull.current = true;
        safeReplace(router, legacyRedirect, { scroll: false });
      }
      return;
    }

    const currentPage = useAppStore.getState().activePage;
    if (pageFromUrl === currentPage) return;

    skipUrlPush.current = true;
    setActivePage(pageFromUrl);
  }, [pathname, setActivePage, router]);

  // Zustand navigation → URL
  useEffect(() => {
    if (skipUrlPush.current) {
      skipUrlPush.current = false;
      return;
    }

    // Until URL→state has initialized from the real pathname, do not push dashboard default.
    if (lastPathname.current === null) {
      return;
    }

    const legacyRedirect = resolveLegacyCommunicationPath(activePage);
    if (legacyRedirect) {
      if (useAppStore.getState().activePage !== 'editorial-calendar') {
        skipUrlPush.current = true;
        setActivePage('editorial-calendar');
      }
      if (currentFullPath(pathname) !== legacyRedirect) {
        skipStatePull.current = true;
        safeReplace(router, legacyRedirect, { scroll: false });
      }
      return;
    }

    const targetPath = pageIdToPath(activePage);
    const targetPathname = pathOnly(targetPath);

    // Already on the right page — keep search params (calendar tabs, filters, etc.).
    if (pathname === targetPathname) {
      return;
    }

    skipStatePull.current = true;
    safeReplace(router, targetPath, { scroll: false });
  }, [activePage, pathname, router, setActivePage]);
}

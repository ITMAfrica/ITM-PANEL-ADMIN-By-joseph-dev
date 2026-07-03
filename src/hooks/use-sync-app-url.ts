'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  pageIdToPath,
  pathToPageId,
  resolveLegacyCommunicationPath,
} from '@/lib/app-routes';

/**
 * Keeps Zustand `activePage` and the browser URL in sync (bidirectional).
 * Mount once in MainApp — all existing setActivePage() calls update the URL automatically.
 *
 * URL → state runs only when `pathname` changes (back/forward, direct link).
 * State → URL runs when `activePage` changes from app code.
 */
export function useSyncAppUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const skipUrlPush = useRef(false);
  const skipStatePull = useRef(false);
  const lastPathname = useRef(pathname);

  // Browser navigation / direct URL → Zustand
  useLayoutEffect(() => {
    if (skipStatePull.current) {
      skipStatePull.current = false;
      lastPathname.current = pathname;
      return;
    }

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
      const currentFull =
        pathname +
        (typeof window !== 'undefined' ? window.location.search : '');
      if (currentFull !== legacyRedirect) {
        skipStatePull.current = true;
        router.replace(legacyRedirect, { scroll: false });
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

    const legacyRedirect = resolveLegacyCommunicationPath(activePage);
    if (legacyRedirect) {
      skipStatePull.current = true;
      if (useAppStore.getState().activePage !== 'editorial-calendar') {
        setActivePage('editorial-calendar');
      }
      const currentFull =
        pathname +
        (typeof window !== 'undefined' ? window.location.search : '');
      if (currentFull !== legacyRedirect) {
        router.replace(legacyRedirect, { scroll: false });
      }
      return;
    }

    const targetPath = pageIdToPath(activePage);
    const currentFull =
      pathname +
      (typeof window !== 'undefined' ? window.location.search : '');
    if (currentFull === targetPath) return;

    skipStatePull.current = true;
    router.replace(targetPath, { scroll: false });
  }, [activePage, pathname, router]);
}

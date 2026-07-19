'use client';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Defensive navigation guard.
 *
 * The app syncs Zustand state ↔ the URL in several places, and a race between
 * those syncs (or a StrictMode double-mount) can call router.replace() in a
 * tight loop, which trips the browser's
 *   "SecurityError: Attempt to use history.replaceState() more than 100 times
 *    per 10 seconds"
 *
 * `safeReplace` makes every programmatic navigation:
 *   1. Idempotent — skip if the destination (path + search) already matches the
 *      current URL, so ping-pong between identical states cannot accumulate.
 *   2. Rate-limited — never allow more than a small number of distinct
 *      navigations per second, hard-breaking any runaway loop.
 */

const WINDOW_MS = 10_000;
const MAX_NAVIGATIONS = 60; // well under the browser's 100/10s hard limit
const timestamps: number[] = [];

function tooManyRecentNavigations(): boolean {
  const now = Date.now();
  // Drop timestamps older than the window.
  while (timestamps.length > 0 && now - timestamps[0] > WINDOW_MS) {
    timestamps.shift();
  }
  if (timestamps.length >= MAX_NAVIGATIONS) {
    return true;
  }
  timestamps.push(now);
  return false;
}

function currentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname + window.location.search;
}

/**
 * Replaces the URL only when it actually changes and we are not rate-limited.
 * Returns true when a navigation was performed, false when it was skipped.
 */
export function safeReplace(
  router: AppRouterInstance,
  href: string,
  options?: Parameters<AppRouterInstance['replace']>[1],
): boolean {
  if (typeof window !== 'undefined') {
    // Normalize: ignore leading/trailing differences that don't matter.
    const target = href.startsWith('?') ? currentUrl().split('?')[0] + href : href;
    if (normalizeUrl(target) === normalizeUrl(currentUrl())) {
      return false;
    }
  }

  if (tooManyRecentNavigations()) {
    // Hard break: refuse to navigate further this window. This is what stops
    // the SecurityError regardless of the upstream logic that caused the loop.
    if (typeof console !== 'undefined') {
      console.warn('[safeReplace] navigation loop detected — replace() suppressed.');
    }
    return false;
  }

  router.replace(href, options);
  return true;
}

function normalizeUrl(url: string): string {
  // Collapse a trailing slash (except for the root) so "/settings" and
  // "/settings/" are treated as the same destination.
  let u = url;
  if (u !== '/' && u.endsWith('/')) u = u.slice(0, -1);
  // Deterministic query-string ordering so a≠b params don't look different.
  const qIndex = u.indexOf('?');
  if (qIndex !== -1) {
    const base = u.slice(0, qIndex);
    const search = u.slice(qIndex + 1);
    const sorted = search
      .split('&')
      .filter(Boolean)
      .sort()
      .join('&');
    u = sorted ? `${base}?${sorted}` : base;
  }
  return u;
}

'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { safeReplace } from '@/lib/safe-navigate';
import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/login-page';
import type { PublicationComposerType } from '@/lib/publication-composer';

const VALID_TYPES: PublicationComposerType[] = [
  'newsletter',
  'article',
  'announcement',
  'communique',
  'social',
];

function parseType(value: string | null): PublicationComposerType | undefined {
  if (!value) return undefined;
  return VALID_TYPES.includes(value as PublicationComposerType)
    ? (value as PublicationComposerType)
    : undefined;
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function CreatePublicationPageContent() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    const type = parseType(searchParams.get('type'));
    const params = new URLSearchParams({ tab: 'calendar', create: 'true' });
    if (type) params.set('composerType', type);
    safeReplace(router, `/editorial-calendar?${params.toString()}`);
  }, [hasHydrated, isAuthenticated, router, searchParams]);

  if (!hasHydrated) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <PageLoader />;
}

export default function CreatePublicationPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CreatePublicationPageContent />
    </Suspense>
  );
}

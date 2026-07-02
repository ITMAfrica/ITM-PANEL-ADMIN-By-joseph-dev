'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/login-page';
import { CreatePublicationComposer } from '@/components/create-publication-composer';
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
  const initialType = useMemo(() => parseType(searchParams.get('type')), [searchParams]);

  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  if (!hasHydrated) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <CreatePublicationComposer
      overlay
      open
      initialType={initialType}
      onOpenChange={(open) => {
        if (!open) router.push('/');
      }}
    />
  );
}

export default function CreatePublicationPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CreatePublicationPageContent />
    </Suspense>
  );
}

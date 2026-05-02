'use client';

import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/login-page';
import { MainApp } from '@/components/main-app';

export default function Home() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}

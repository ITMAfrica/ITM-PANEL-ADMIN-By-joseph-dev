import { redirect } from 'next/navigation';
import { AppEntry } from '@/components/app-entry';
import { isValidPageSlug } from '@/lib/app-routes';

interface PageProps {
  params: Promise<{ page: string }>;
}

export default async function DynamicAppPage({ params }: PageProps) {
  const { page } = await params;

  if (!isValidPageSlug(page)) {
    redirect('/');
  }

  return <AppEntry />;
}

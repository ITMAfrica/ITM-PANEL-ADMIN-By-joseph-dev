'use client';

import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, User as UserIcon } from 'lucide-react';
import { useChannelSubscribers } from '@/hooks/use-distribution-channels';
import type { DistributionChannel, Subscriber } from '@/lib/types';

const statusColors: Record<Subscriber['status'], string> = {
  subscribed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  unsubscribed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const statusLabels: Record<Subscriber['status'], { fr: string; en: string }> = {
  subscribed: { fr: 'Abonné', en: 'Subscribed' },
  unsubscribed: { fr: 'Désabonné', en: 'Unsubscribed' },
};

function formatDate(iso: string, locale: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface ChannelSubscribersDrawerProps {
  channel: DistributionChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChannelSubscribersDrawer({
  channel,
  open,
  onOpenChange,
}: ChannelSubscribersDrawerProps) {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: subscribers = [], isLoading } = useChannelSubscribers(
    open && channel ? channel.id : null,
    activeTenantId
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
            {channel?.name ?? t.distributionChannels.subscribers}
          </SheetTitle>
          <SheetDescription>
            {subscribers.length} {t.distributionChannels.subscribers.toLowerCase()}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            {locale === 'fr' ? 'Aucun abonné sur ce canal.' : 'No subscribers on this channel.'}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <ul className="divide-y">
              {subscribers.map((sub) => (
                <li key={sub.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[oklch(0.55_0.18_250/0.10)] text-[oklch(0.55_0.18_250)]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1D141F]">{sub.email}</p>
                    {sub.name && (
                      <p className="truncate text-xs text-muted-foreground">{sub.name}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {locale === 'fr' ? 'Inscrit le' : 'Subscribed'}{' '}
                      {formatDate(sub.createdAt, locale)}
                    </p>
                    {(sub.city || sub.country) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[sub.city, sub.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {sub.metadata?.context?.pageUrl && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground" title={sub.metadata.context.pageUrl}>
                        {sub.metadata.context.pageUrl}
                      </p>
                    )}
                    {sub.consentNewsletter && (
                      <p className="mt-0.5 text-xs text-emerald-600">
                        {locale === 'fr' ? 'Consentement OK' : 'Consent OK'}
                        {sub.consentTextVersion ? ` (${sub.consentTextVersion})` : ''}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[sub.status]}
                  >
                    {statusLabels[sub.status][locale === 'fr' ? 'fr' : 'en']}
                  </Badge>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

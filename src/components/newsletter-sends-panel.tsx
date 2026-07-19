'use client';

import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNewsletterSends } from '@/hooks/use-content';
import type { NewsletterSendDetail } from '@/lib/types';
import { MapPin, MousePointerClick, Mail, Clock } from 'lucide-react';

function formatLocalDateTime(iso: string, locale: 'fr' | 'en'): string {
  return new Date(iso).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHourOfDay(iso: string, locale: 'fr' | 'en'): string {
  return new Date(iso).toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NewsletterSendsPanel({ contentId }: { contentId: string }) {
  const { t } = useTranslation();
  const locale = useAppStore((s) => s.locale) as 'fr' | 'en';
  const { data, isLoading, isError } = useNewsletterSends(contentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <span className="text-sm text-muted-foreground">
          {locale === 'fr' ? 'Chargement…' : 'Loading…'}
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <span className="text-sm text-rose-600">
          {locale === 'fr' ? 'Impossible de charger les statistiques.' : 'Unable to load statistics.'}
        </span>
      </div>
    );
  }

  const opened = data.sends.filter((s) => s.openedAt);

  return (
    <ScrollArea className="flex-1 px-5">
      <div className="space-y-4 pb-4">
        {/* Résumé */}
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard label={t.newsletterSends.sent} value={data.total} icon={<Mail className="h-3.5 w-3.5" />} />
          <SummaryCard label={t.newsletterSends.opened} value={data.opened} icon={<Clock className="h-3.5 w-3.5" />} />
          <SummaryCard label={t.newsletterSends.clicked} value={data.clicked} icon={<MousePointerClick className="h-3.5 w-3.5" />} />
        </div>

        {/* Liste des ouvertures avec ville + heure */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.newsletterSends.openings}
            </span>
          </div>

          {opened.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              {locale === 'fr' ? 'Aucune ouverture enregistrée pour le moment.' : 'No openings recorded yet.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {opened.map((send) => (
                <SendRow key={send.id} send={send} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground/70 mb-1">
        {icon}
      </div>
      <div className="text-xl font-semibold text-foreground tabular-nums">{value}</div>
      <div className="text-[0.7rem] text-muted-foreground/70 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function SendRow({ send, locale }: { send: NewsletterSendDetail; locale: 'fr' | 'en' }) {
  const location = [send.city, send.country].filter(Boolean).join(', ') || '—';
  const openedLabel = send.openedAt
    ? formatLocalDateTime(send.openedAt, locale)
    : '';
  const hourLabel = send.openedAt ? formatHourOfDay(send.openedAt, locale) : '';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {send.name || send.email}
        </p>
        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {location}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-foreground flex items-center justify-end gap-1">
          <Clock className="h-3 w-3 text-muted-foreground/60" />
          {hourLabel}
        </p>
        <p className="text-[0.7rem] text-muted-foreground/70">{openedLabel}</p>
      </div>
    </div>
  );
}

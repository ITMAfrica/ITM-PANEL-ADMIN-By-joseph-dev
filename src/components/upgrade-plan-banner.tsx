'use client';

import { Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export type UpgradePlanVariant =
  | 'library'
  | 'editorialCalendar'
  | 'statistics'
  | 'reports'
  | 'media'
  | 'templates'
  | 'drafts'
  | 'published'
  | 'archive';

export function UpgradePlanBanner({ variant }: { variant: UpgradePlanVariant }) {
  const { t } = useTranslation();
  const copy = t.upgradePlan[variant];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white">
      <div className="relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E2F343]">
            <Gem className="h-5 w-5 text-[#1D141F]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1D141F] sm:text-base">{copy.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {copy.description}
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 self-start rounded-full bg-[#1D141F] px-5 text-sm font-semibold text-[#E2F343] hover:opacity-90 sm:self-center"
        >
          {copy.cta}
        </Button>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 sm:block"
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#E2F343]/50" />
        <div className="absolute inset-2 rounded-full border-2 border-[#E2F343]/35" />
        <div className="absolute inset-4 rounded-full border-2 border-[#E2F343]/20" />
      </div>
    </div>
  );
}

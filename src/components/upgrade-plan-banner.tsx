'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { getIllustration, type ItmIllustrationId } from '@/lib/itm-illustrations';
import { getIllustration2, type ItmIllustration2Id } from '@/lib/itm-illustrations-2';

export type UpgradePlanVariant =
  | 'library'
  | 'editorialCalendar'
  | 'dashboard'
  | 'reports'
  | 'media'
  | 'templates'
  | 'drafts'
  | 'published'
  | 'archive';

const VARIANT_ART: Record<
  UpgradePlanVariant,
  { series1?: ItmIllustrationId; series2?: ItmIllustration2Id }
> = {
  library: { series1: 'library' },
  editorialCalendar: { series2: 'city-editorial-desk' },
  dashboard: { series2: 'orbit-workspace' },
  reports: { series2: 'data-constellation' },
  media: { series2: 'media-galaxy' },
  templates: { series1: 'compose-newsletter' },
  drafts: { series1: 'drafts' },
  published: { series1: 'success-grow' },
  archive: { series1: 'archive' },
};

const FALLBACK_COPY = {
  title: 'Unlock more features',
  description: 'Upgrade your plan to access additional capabilities.',
  cta: 'Update your plan',
};

export function UpgradePlanBanner({ variant }: { variant: UpgradePlanVariant }) {
  const { t } = useTranslation();
  const copy = t.upgradePlan[variant] ?? FALLBACK_COPY;
  const artRef = VARIANT_ART[variant];
  const art = artRef.series2
    ? getIllustration2(artRef.series2)
    : getIllustration(artRef.series1!);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white">
      <div className="relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-xl sm:block md:h-[4.5rem] md:w-28">
            <Image
              src={art.path}
              alt=""
              fill
              className="object-cover"
              sizes="112px"
              aria-hidden
            />
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
        className="pointer-events-none absolute -right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 opacity-40 sm:block"
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#E2F343]/50" />
        <div className="absolute inset-2 rounded-full border-2 border-[#E2F343]/35" />
        <div className="absolute inset-4 rounded-full border-2 border-[#E2F343]/20" />
      </div>
    </div>
  );
}

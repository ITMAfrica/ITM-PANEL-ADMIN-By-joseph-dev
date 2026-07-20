'use client';

import Image from 'next/image';
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
  { series1?: ItmIllustrationId; series2?: ItmIllustration2Id; stitch?: string }
> = {
  library: { series1: 'library' },
  editorialCalendar: { stitch: '/assets/upgrade/calendar-3d.png' },
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

function TitleWithAccent({ title, accent }: { title: string; accent?: string }) {
  if (!accent || !title.includes(accent)) {
    return <>{title}</>;
  }

  const start = title.indexOf(accent);
  const before = title.slice(0, start);
  const after = title.slice(start + accent.length);

  return (
    <>
      {before}
      <span className="text-[#C5E012]">{accent}</span>
      {after}
    </>
  );
}

export function UpgradePlanBanner({ variant }: { variant: UpgradePlanVariant }) {
  const { t } = useTranslation();
  const copy = t.upgradePlan[variant] ?? FALLBACK_COPY;
  const titleAccent =
    'titleAccent' in copy && typeof copy.titleAccent === 'string'
      ? copy.titleAccent
      : undefined;
  const artRef = VARIANT_ART[variant];
  const artSrc = artRef.stitch
    ? artRef.stitch
    : artRef.series2
      ? getIllustration2(artRef.series2).path
      : getIllustration(artRef.series1!).path;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E8ECEF] bg-[#F4F8F9] shadow-[0_8px_24px_rgba(29,20,31,0.04)]">
      <div className="relative z-10 flex flex-col items-center gap-5 px-5 py-5 sm:flex-row sm:gap-6 sm:px-8 sm:py-6">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-18%] rounded-full bg-[#E2F343]/35 blur-2xl"
            />
            <Image
              src={artSrc}
              alt=""
              width={80}
              height={80}
              className="relative z-10 h-16 w-16 object-contain drop-shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]"
              aria-hidden
            />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-tight tracking-tight text-[#1D141F] sm:text-lg">
              <TitleWithAccent title={copy.title} accent={titleAccent} />
            </p>
            <p className="mt-1.5 max-w-[540px] text-sm leading-relaxed text-[#6B7280]">
              {copy.description}
            </p>
          </div>
        </div>
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

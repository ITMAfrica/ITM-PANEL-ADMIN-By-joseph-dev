'use client';

import type { ReactNode } from 'react';
import type { NewsletterSection } from '@/lib/types';

const COLORS = {
  bg: '#F5F1E9',
  blobGreen: '#41F28B',
  blobPink: '#F98AF3',
  text: '#2D2D2D',
  button: '#E9E1D7',
  band: '#2D2D2D',
  footer: '#2D2D2D',
  footerMuted: '#A8A29A',
  white: '#FFFFFF',
};

function CtaPill({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full px-7 py-3.5 text-[15px] font-medium leading-none"
      style={{ background: COLORS.button, color: COLORS.text }}
    >
      {label || 'Bouton'}
    </span>
  );
}

function HeroBlock({
  section,
  cta,
}: {
  section: Extract<NewsletterSection, { type: 'hero' }>;
  cta?: Extract<NewsletterSection, { type: 'cta' }>;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: COLORS.bg }}
    >
      {/* Blob vert — bas gauche */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-[240px] w-[240px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%]"
        style={{ background: COLORS.blobGreen }}
      />
      {/* Blob rose — haut droit */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-16 h-[220px] w-[220px] rounded-[60%_40%_30%_70%/50%_60%_40%_50%]"
        style={{ background: COLORS.blobPink }}
      />

      <div className="relative z-10 px-8 pb-16 pt-16 text-center sm:px-10 sm:pt-[4.5rem]">
        {section.label?.trim() ? (
          <p
            className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: COLORS.text }}
          >
            {section.label}
          </p>
        ) : null}

        {section.title?.trim() ? (
          <h1
            className="mx-auto mb-4 max-w-[20ch] text-[1.85rem] font-bold leading-[1.15] tracking-tight sm:text-[2.15rem]"
            style={{ color: COLORS.text }}
          >
            {section.title}
          </h1>
        ) : (
          <h1 className="mb-4 text-[1.85rem] font-bold text-[#B0B3B8]">Titre</h1>
        )}

        {section.subtitle?.trim() ? (
          <p
            className="mx-auto max-w-[36ch] text-[15px] font-normal leading-relaxed sm:text-base"
            style={{ color: COLORS.text }}
          >
            {section.subtitle}
          </p>
        ) : (
          <p className="text-sm text-[#B0B3B8]">Sous-titre</p>
        )}

        {cta ? (
          <div className="mt-7">
            <CtaPill label={cta.label} />
          </div>
        ) : null}

        {section.imageUrl ? (
          <img
            src={section.imageUrl}
            alt={section.title}
            className="mx-auto mt-7 w-full max-w-[480px] rounded-xl"
          />
        ) : null}
      </div>
    </div>
  );
}

function Block({ section }: { section: NewsletterSection }) {
  switch (section.type) {
    case 'hero':
      return <HeroBlock section={section} />;
    case 'band':
      return (
        <div
          className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white"
          style={{ background: COLORS.band }}
        >
          {section.label || 'Bandeau'}
        </div>
      );
    case 'article':
      return (
        <div className="bg-white">
          {section.imageUrl ? (
            <img src={section.imageUrl} alt={section.title} className="w-full rounded-lg px-4 pt-3" />
          ) : null}
          {section.title ? (
            <p className="px-6 pt-3 text-[17px] font-bold" style={{ color: COLORS.text }}>
              {section.title}
            </p>
          ) : null}
          <p className="px-6 pb-4 pt-1 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: COLORS.text }}>
            {section.text}
          </p>
        </div>
      );
    case 'cta':
      return (
        <div className="bg-white py-4 text-center">
          <CtaPill label={section.label} />
        </div>
      );
    case 'calendar':
      return (
        <div className="bg-white">
          <div
            className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white"
            style={{ background: COLORS.band }}
          >
            Calendrier des formations
          </div>
          <ul className="space-y-1 px-6 py-3 text-sm" style={{ color: COLORS.text }}>
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case 'footer':
      return (
        <div
          className="px-4 py-4 text-center text-xs leading-relaxed"
          style={{ background: COLORS.footer, color: COLORS.footerMuted }}
        >
          {section.text}
        </div>
      );
    default:
      return null;
  }
}

export function NewsletterSectionsPreview({ sections }: { sections: NewsletterSection[] }) {
  if (sections.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-[#DADDE1] bg-[#F8F9FA] px-4 py-6 text-center">
        <p className="text-sm italic text-[#B0B3B8]">
          Aucune section. Ajoutez des blocs pour composer votre newsletter.
        </p>
      </div>
    );
  }

  const blocks: ReactNode[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.type === 'hero') {
      const next = sections[i + 1];
      if (next?.type === 'cta') {
        blocks.push(<HeroBlock key={i} section={section} cta={next} />);
        i += 1;
        continue;
      }
      blocks.push(<HeroBlock key={i} section={section} />);
      continue;
    }
    blocks.push(<Block key={i} section={section} />);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E8E2D8]" style={{ background: COLORS.bg }}>
      <div className="bg-white">{blocks}</div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { getIllustration2, type ItmIllustration2Id } from '@/lib/itm-illustrations-2';

interface ComposerSectionBreakProps {
  /** Illustration série 2 — défaut : chaîne d'assemblage newsletter. */
  illustrationId?: ItmIllustration2Id;
  stepLabel?: string;
  title?: string;
  hint?: string;
  heroAlt?: string;
}

/**
 * Visual chapter break between template selection and body fields.
 * Magazine-style split: series-2 illustration + copy.
 * Utilisé pour newsletter, article et communication (props par type).
 */
export function NewsletterComposerSectionBreak({
  illustrationId = 'newsletter-assembly-line',
  stepLabel,
  title,
  hint,
  heroAlt,
}: ComposerSectionBreakProps = {}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const reduceMotion = useReducedMotion();
  const art = getIllustration2(illustrationId);

  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white shadow-[0_1px_2px_rgba(29,20,31,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <motion.div
          className="relative shrink-0 overflow-hidden sm:w-[12.5rem] md:w-[15rem]"
          initial={reduceMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:h-full sm:min-h-[9rem]">
            <Image
              src={art.path}
              alt={heroAlt ?? pc.newsletterHeroAlt ?? art.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 240px"
              priority={false}
            />
          </div>
        </motion.div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 border-t border-[#E8ECEF] px-4 py-4 sm:border-t-0 sm:border-l sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B939E]">
            {stepLabel ?? pc.newsletterContentStep ?? 'Étape 2'}
          </p>
          <p className="text-sm font-semibold tracking-tight text-[#1D141F] sm:text-base">
            {title ?? pc.newsletterContentTitle ?? 'Composez votre newsletter'}
          </p>
          <p className="max-w-md text-xs leading-relaxed text-[#5C6470] sm:text-[13px]">
            {hint ??
              pc.newsletterContentHint ??
              'Titre, objet, sections et canaux — le cœur éditorial de votre envoi.'}
          </p>
        </div>
      </div>
    </div>
  );
}

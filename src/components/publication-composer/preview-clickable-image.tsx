'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { PreviewImageLightbox } from './preview-image-lightbox';

interface PreviewClickableImageProps {
  src: string;
  className?: string;
}

export function PreviewClickableImage({ src, className }: PreviewClickableImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { t } = useTranslation();
  const viewLabel = t.publicationComposer.viewImageFullscreen;

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full overflow-hidden text-left"
        aria-label={viewLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className={cn('w-full object-cover transition-opacity group-hover:opacity-95', className)}
        />
        <span className="pointer-events-none absolute inset-0 bg-[#1D141F]/0 transition-colors group-hover:bg-[#1D141F]/5" />
      </button>

      <PreviewImageLightbox
        src={src}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

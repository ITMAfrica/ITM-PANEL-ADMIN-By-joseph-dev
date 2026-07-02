'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ComposerCloseButton } from './composer-close-button';
import { useTranslation } from '@/lib/i18n';

interface PreviewImageLightboxProps {
  src: string;
  open: boolean;
  onClose: () => void;
}

export function PreviewImageLightbox({ src, open, onClose }: PreviewImageLightboxProps) {
  const { t } = useTranslation();
  const closeLabel = t.publicationComposer.close;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#1D141F]/95"
      role="dialog"
      aria-modal="true"
      aria-label={closeLabel}
    >
      <header className="flex shrink-0 items-center justify-end border-b border-[#E8ECEF] bg-white px-5 py-3.5">
        <ComposerCloseButton label={closeLabel} onClose={onClose} />
      </header>

      <button
        type="button"
        className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
        onClick={onClose}
        aria-label={closeLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="max-h-[calc(100vh-5rem)] max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      </button>
    </div>,
    document.body
  );
}

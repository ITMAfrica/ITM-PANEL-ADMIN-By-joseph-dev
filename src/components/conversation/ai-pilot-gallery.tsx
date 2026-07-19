'use client';

import dynamic from 'next/dynamic';
import { Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { AI_PILOTS, type AiPilotId } from '@/lib/ai-pilots';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AiPilotMascot = dynamic(
  () =>
    import('@/components/conversation/pilots').then((m) => m.AiPilotMascot),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[110px] w-full items-center justify-center" aria-hidden>
        <div className="h-16 w-16 animate-pulse rounded-full bg-[#E8ECEF]" />
      </div>
    ),
  }
);

export type AiPilotGalleryProps = {
  activePilotId: AiPilotId;
  onSelect: (id: AiPilotId) => void;
  onClose: () => void;
};

export function AiPilotGallery({ activePilotId, onSelect, onClose }: AiPilotGalleryProps) {
  const { t } = useTranslation();
  const pilotsCopy = t.conversation.ai.pilots;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-[#E8ECEF] px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1D141F]">{t.conversation.ai.galleryTitle}</p>
          <p className="mt-0.5 text-xs text-[#8B939E]">{t.conversation.ai.gallerySubtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8B939E] hover:bg-[#F3F6F8] hover:text-[#1D141F]"
          aria-label={t.conversation.ai.galleryClose}
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {AI_PILOTS.map((pilot) => {
            const copy = pilotsCopy[pilot.id];
            const isActive = pilot.id === activePilotId;
            return (
              <button
                key={pilot.id}
                type="button"
                onClick={() => onSelect(pilot.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border text-left transition-all',
                  isActive
                    ? 'border-[#1D141F] ring-2 ring-[#1D141F]/15'
                    : 'border-[#E8ECEF] hover:border-[#D0D5DD] hover:shadow-sm'
                )}
                style={{ background: pilot.surface }}
              >
                {isActive && (
                  <span className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[#1D141F] px-2 py-0.5 text-[10px] font-semibold text-[#E2F343]">
                    <Check className="h-3 w-3" />
                    {t.conversation.ai.galleryActive}
                  </span>
                )}
                <div className="px-2 pt-2">
                  <AiPilotMascot
                    pilotId={pilot.id}
                    compact
                    showLabel={false}
                    label={copy.name}
                  />
                </div>
                <div className="space-y-1 border-t border-black/5 bg-white/70 px-3 py-2.5 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: pilot.accent }}
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-[#1D141F]">{copy.name}</p>
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: pilot.accent }}>
                    {copy.specialty}
                  </p>
                  <p className="text-[11px] leading-snug text-[#8B939E]">{copy.personality}</p>
                  <p className="text-[10px] italic leading-snug text-[#A0A8B0]">{copy.role}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-[#E8ECEF] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-9 w-full rounded-lg border-[#E8ECEF] text-sm"
        >
          {t.conversation.ai.galleryClose}
        </Button>
      </footer>
    </div>
  );
}

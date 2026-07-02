'use client';

import { ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useMedia } from '@/hooks/use-media';
import type { MediaItem } from '@/lib/types';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
  filterType?: 'image' | 'video';
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  filterType,
}: MediaPickerDialogProps) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: media = [], isLoading } = useMedia(activeTenantId);

  const filtered = media.filter((item) => {
    if (!filterType) return item.type === 'image' || item.type === 'video';
    return item.type === filterType;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-[#E8ECEF] px-5 py-4">
          <DialogTitle className="text-base font-semibold text-[#1D141F]">
            {pc.selectFromLibrary}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-[#8B939E]">{t.media.uploading}</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8B939E]">{pc.noMediaFound}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onOpenChange(false);
                  }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-[#E8ECEF] bg-[#F5F7F9] transition-colors hover:border-[#D4DEE6] hover:ring-2 hover:ring-[oklch(0.55_0.18_250/0.2)]"
                >
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.alt || item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-[#5C6470]">
                      <ImageIcon className="h-6 w-6" />
                      <span className="line-clamp-2 text-[10px] font-medium">{item.name}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2',
                      'opacity-0 transition-opacity group-hover:opacity-100'
                    )}
                  >
                    <p className="truncate text-[10px] font-medium text-white">{item.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { FileText, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { MediaItem } from '@/lib/types';

interface MediaPreviewDialogProps {
  item: MediaItem | null;
  onOpenChange: (open: boolean) => void;
}

export function MediaPreviewDialog({ item, onOpenChange }: MediaPreviewDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        {item && (
          <>
            <DialogHeader className="border-b border-[#E8ECEF] px-5 py-4">
              <DialogTitle className="truncate pr-8 text-base font-semibold text-[#1D141F]">
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex max-h-[70vh] flex-col items-center justify-center gap-4 overflow-auto p-5">
              {item.type === 'image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.alt || item.name}
                  className="max-h-[60vh] w-auto max-w-full rounded-lg object-contain"
                />
              )}
              {item.type === 'video' && (
                <video
                  src={item.url}
                  controls
                  className="max-h-[60vh] w-full rounded-lg bg-black"
                />
              )}
              {item.type === 'audio' && (
                <div className="flex w-full flex-col items-center gap-4 py-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                    <Music className="h-10 w-10" />
                  </div>
                  <audio src={item.url} controls className="w-full max-w-md" />
                </div>
              )}
              {(item.type === 'document' || item.type === 'other') && (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                    <FileText className="h-10 w-10" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.mimeType}</p>
                  <Button asChild variant="outline">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {t.media.view}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { BrandPrimaryButton } from '@/components/view-layout';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { Plus } from 'lucide-react';

interface CreatePublicationMenuProps {
  scheduledAt?: Date;
  className?: string;
  /** Pre-select these channels when opening the composer (calendar filter). */
  initialChannelIds?: string[];
}

export function CreatePublicationMenu({
  scheduledAt,
  className,
  initialChannelIds,
}: CreatePublicationMenuProps) {
  const { t } = useTranslation();
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);

  return (
    <BrandPrimaryButton
      className={className}
      onClick={() => openPublicationComposer({ scheduledAt, initialChannelIds })}
    >
      <Plus className="h-4 w-4" />
      {t.editorialCalendar.createPublication}
    </BrandPrimaryButton>
  );
}

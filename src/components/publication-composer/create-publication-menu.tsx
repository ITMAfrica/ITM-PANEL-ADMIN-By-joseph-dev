'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BrandPrimaryButton } from '@/components/view-layout';
import { publicationTypes, type PublicationComposerType } from '@/lib/publication-composer';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { Plus, ChevronDown } from 'lucide-react';

interface CreatePublicationMenuProps {
  scheduledAt?: Date;
  className?: string;
}

export function CreatePublicationMenu({ scheduledAt, className }: CreatePublicationMenuProps) {
  const { t } = useTranslation();
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);

  const openWithType = (type: PublicationComposerType) => {
    openPublicationComposer({
      type,
      scheduledAt,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BrandPrimaryButton className={className}>
          <Plus className="h-4 w-4" />
          {t.editorialCalendar.createPublication}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </BrandPrimaryButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t.topbar.quickCreate}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {publicationTypes.map(({ type, icon: Icon, labelKey }) => (
          <DropdownMenuItem
            key={type}
            className="cursor-pointer"
            onClick={() => openWithType(type)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {t.createContent[labelKey as keyof typeof t.createContent] ?? type}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { publicationTypes, type PublicationComposerType } from '@/lib/publication-composer';

interface ComposerTypeBarProps {
  type: PublicationComposerType;
}

export function ComposerTypeBar({ type }: ComposerTypeBarProps) {
  const { t } = useTranslation();
  const typeConfig = publicationTypes.find((item) => item.type === type);

  if (!typeConfig) return null;

  const Icon = typeConfig.icon;
  const label =
    typeConfig.labelKey === 'social'
      ? t.createContent.social
      : t.createContent[typeConfig.labelKey as keyof typeof t.createContent];
  const desc =
    typeConfig.descKey === 'typeSocial'
      ? t.createContent.typeSocial
      : t.createContent[typeConfig.descKey as keyof typeof t.createContent];

  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-[#E8ECEF] bg-[#F5F7F9] px-2 py-1.5">
        <Icon className={cn('h-4 w-4', typeConfig.color)} />
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#1D141F]">
            {label}
          </span>
          <span className="text-[10px] leading-tight text-[#8B939E]">{desc}</span>
        </div>
      </div>
    </div>
  );
}

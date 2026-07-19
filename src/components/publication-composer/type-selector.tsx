'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { publicationTypes, type PublicationComposerType } from '@/lib/publication-composer';

interface TypeSelectorProps {
  selectedType: PublicationComposerType;
  onTypeSelect: (type: PublicationComposerType) => void;
  disabled?: boolean;
}

export function TypeSelector({ selectedType, onTypeSelect, disabled = false }: TypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-wrap items-center gap-x-1 gap-y-1"
      role="radiogroup"
      aria-label={t.createContent.selectType}
    >
      {publicationTypes.map((ct, index) => {
        const isSelected = selectedType === ct.type;
        const label =
          ct.labelKey === 'social'
            ? t.createContent.social
            : t.createContent[ct.labelKey as keyof typeof t.createContent];

        return (
          <div key={ct.type} className="flex items-center">
            {index > 0 && <span className="mx-1 h-3.5 w-px shrink-0 bg-[#E8ECEF]" aria-hidden />}
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !disabled && onTypeSelect(ct.type)}
              disabled={disabled}
              className={cn(
                'rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150',
                disabled ? 'cursor-default opacity-80' : 'cursor-pointer',
                isSelected
                  ? 'bg-[#1D141F] text-white'
                  : 'text-[#5C6470] hover:bg-[#F5F7F9] hover:text-[#1D141F]'
              )}
            >
              {label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

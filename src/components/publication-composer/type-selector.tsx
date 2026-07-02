'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { publicationTypes, type PublicationComposerType } from '@/lib/publication-composer';

interface TypeSelectorProps {
  selectedType: PublicationComposerType;
  onTypeSelect: (type: PublicationComposerType) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
};

export function TypeSelector({ selectedType, onTypeSelect }: TypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-visible"
      role="radiogroup"
      aria-label={t.createContent.selectType}
    >
      {publicationTypes.map((ct) => {
        const Icon = ct.icon;
        const isSelected = selectedType === ct.type;
        const label =
          ct.labelKey === 'social'
            ? t.createContent.social
            : t.createContent[ct.labelKey as keyof typeof t.createContent];
        const desc =
          ct.descKey === 'typeSocial'
            ? t.createContent.typeSocial
            : t.createContent[ct.descKey as keyof typeof t.createContent];

        return (
          <motion.button
            key={ct.type}
            type="button"
            role="radio"
            aria-checked={isSelected}
            variants={itemVariants}
            whileHover={isSelected ? undefined : { y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTypeSelect(ct.type)}
            className={cn(
              'group relative flex min-w-[108px] flex-1 snap-start flex-col items-center overflow-hidden rounded-xl border p-3 transition-all duration-200 cursor-pointer lg:min-w-0',
              isSelected
                ? cn('border shadow-md', ct.borderColor, ct.bgColor)
                : 'border-[#E8ECEF] bg-white hover:border-[#D4DEE6] hover:shadow-sm'
            )}
          >
            {isSelected && (
              <div
                className={cn('pointer-events-none absolute inset-0 bg-gradient-to-b', ct.gradientFrom, ct.gradientTo)}
                aria-hidden
              />
            )}

            <div className="relative z-[1] flex w-full flex-col items-center gap-2 pt-0.5">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200',
                  isSelected ? ct.bgColor : 'bg-[#F5F7F9] group-hover:bg-[#EEF1F4]'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors duration-200',
                    isSelected ? ct.color : 'text-[#8B939E] group-hover:text-[#5C6470]'
                  )}
                />
              </div>

              <div className="w-full text-center">
                <p
                  className={cn(
                    'text-xs font-semibold leading-tight tracking-tight',
                    isSelected ? ct.color : 'text-[#1D141F]'
                  )}
                >
                  {label}
                </p>
                <p
                  className={cn(
                    'mt-1 line-clamp-2 text-[10px] leading-snug',
                    isSelected ? 'text-[#5C6470]' : 'text-[#8B939E]'
                  )}
                >
                  {desc}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

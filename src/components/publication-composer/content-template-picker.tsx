'use client';

import { useState } from 'react';
import { Check, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useTemplates } from '@/hooks/use-templates';
import type { ContentTemplate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DEFAULT_PLACEHOLDERS, type TemplatePlaceholders } from './newsletter-template-picker';

/** Types de contenu CMS composés par sections (hors newsletter). */
export type SectionContentType = 'article' | 'announcement';

function placeholdersForTemplate(template: ContentTemplate): TemplatePlaceholders {
  return {
    ...DEFAULT_PLACEHOLDERS,
    title: `Titre — ${template.name}...`,
  };
}

function TemplateThumbnail({
  template,
  isSelected,
}: {
  template: ContentTemplate;
  isSelected: boolean;
}) {
  if (template.thumbnail) {
    return (
      <div
        className={cn(
          'relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#FAFBFC]',
          isSelected ? 'border-[#E2F343]/70' : 'border-[#E8ECEF]'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={template.thumbnail} alt="" className="h-full w-full object-cover" />
        {isSelected ? (
          <span className="absolute inset-0 flex items-center justify-center bg-[#1D141F]/35">
            <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
    );
  }

  const Icon = isSelected ? Check : LayoutTemplate;
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_1px_3px_rgba(29,20,31,0.06)]',
        isSelected ? 'bg-[#E2F343]' : 'bg-[#E2F343]/90'
      )}
    >
      <Icon className="h-4 w-4 text-[#1D141F]" strokeWidth={isSelected ? 2.5 : 2} />
    </div>
  );
}

interface ContentTemplatePickerProps {
  tenantId?: string;
  /** Filtre les modèles par type de contenu ('article' | 'announcement'). */
  type: SectionContentType;
  selectedId?: string | null;
  onSelect: (template: ContentTemplate | null, placeholders: TemplatePlaceholders) => void;
  /** Notifie le parent quand le dropdown s'ouvre/ferme. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Sélecteur de modèle pour articles & communications — même approche que
 * NewsletterTemplatePicker : dropdown, vignettes, sélection/désélection.
 * Toujours utilisé en mode "embedded" : le parent fournit la carte et le titre.
 */
export function ContentTemplatePicker({
  tenantId,
  type,
  selectedId,
  onSelect,
  onOpenChange,
}: ContentTemplatePickerProps) {
  const { t } = useTranslation();
  const { data: allTemplates = [], isLoading } = useTemplates(tenantId);
  const templates = allTemplates.filter((template) => template.type === type);
  const [open, setOpen] = useState(false);

  const handlePick = (template: ContentTemplate) => {
    if (selectedId === template.id) {
      onSelect(null, DEFAULT_PLACEHOLDERS);
      setOpen(false);
      onOpenChange?.(false);
      return;
    }
    onSelect(template, placeholdersForTemplate(template));
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[#E8ECEF] bg-white px-3 py-2.5 text-left text-sm text-[#1D141F] transition-colors hover:bg-[#F7F9FC]"
      >
        <LayoutTemplate className="h-4 w-4 text-[#5C6470]" />
        <span className="flex-1 truncate">
          {selectedId
            ? templates.find((tpl) => tpl.id === selectedId)?.name ?? t.common.select ?? 'Sélectionner'
            : t.common.select ?? 'Sélectionner un modèle'}
        </span>
        <span className="text-xs text-[#8B939E]">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {isLoading ? (
                <p className="px-1 py-2 text-xs text-[#8B939E]">
                  {t.common.loading ?? 'Chargement...'}
                </p>
              ) : templates.length === 0 ? (
                <p className="px-1 py-2 text-xs text-[#8B939E]">
                  {t.common.noResults ?? 'Aucun modèle disponible'}
                </p>
              ) : (
                templates.map((template) => {
                  const isSelected = template.id === selectedId;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handlePick(template)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200',
                        isSelected
                          ? 'border-[#E2F343]/45 bg-[#E2F343]/08 shadow-[0_1px_3px_rgba(226,243,67,0.12)]'
                          : 'border-[#E8ECEF] bg-white hover:border-[#D4DEE6] hover:bg-[#FAFBFC] hover:shadow-sm'
                      )}
                    >
                      <TemplateThumbnail template={template} isSelected={isSelected} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#1D141F]">
                          {template.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs leading-relaxed text-[#8B939E]">
                          {template.description}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

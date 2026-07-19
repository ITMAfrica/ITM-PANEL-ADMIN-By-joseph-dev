'use client';

import { useState } from 'react';
import { Check, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { useNewsletterTemplates } from '@/hooks/use-newsletter-templates';
import type { NewsletterTemplate } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface TemplatePlaceholders {
  title: string;
  emailSubject: string;
  summary: string;
  body: string;
}

const DEFAULT_PLACEHOLDERS: TemplatePlaceholders = {
  title: 'Entrez le titre...',
  emailSubject: 'Objet de la newsletter...',
  summary: 'Décrivez brièvement le contenu...',
  body: 'Rédigez le contenu principal...',
};

function placeholdersForTemplate(template: NewsletterTemplate): TemplatePlaceholders {
  const base = template.name;
  return {
    title: `Titre — ${base}...`,
    emailSubject: `Objet — ${base}...`,
    summary: 'Décrivez brièvement le contenu...',
    body: 'Rédigez le contenu principal...',
  };
}

function isAcademyTemplate(template: NewsletterTemplate) {
  return template.name === 'ITM HR Academy';
}

function TemplateOptionIcon({
  variant,
  isSelected,
}: {
  variant: 'yellow' | 'academy';
  isSelected: boolean;
}) {
  const Icon = isSelected ? Check : LayoutTemplate;

  if (variant === 'academy') {
    return (
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_2px_8px_rgba(217,88,0,0.28)]',
          isSelected ? 'bg-[#D95800]' : 'bg-[#D95800]/90'
        )}
      >
        <Icon className="h-4 w-4 text-white" strokeWidth={isSelected ? 2.5 : 2} />
      </div>
    );
  }

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

function TemplateThumbnail({
  template,
  isSelected,
  variant,
}: {
  template: NewsletterTemplate;
  isSelected: boolean;
  variant: 'yellow' | 'academy';
}) {
  if (template.thumbnail) {
    return (
      <div
        className={cn(
          'relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#FAFBFC]',
          isSelected
            ? variant === 'academy'
              ? 'border-[#D95800]/50'
              : 'border-[#E2F343]/70'
            : 'border-[#E8ECEF]'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.thumbnail}
          alt=""
          className="h-full w-full object-cover"
        />
        {isSelected ? (
          <span className="absolute inset-0 flex items-center justify-center bg-[#1D141F]/35">
            <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
    );
  }

  return <TemplateOptionIcon variant={variant} isSelected={isSelected} />;
}

interface NewsletterTemplatePickerProps {
  tenantId?: string;
  selectedId?: string | null;
  onSelect: (template: NewsletterTemplate | null, placeholders: TemplatePlaceholders) => void;
  /** Quand true, supprime le wrapper externe (bordure, ombre, padding) — le parent le fournit. */
  embedded?: boolean;
  /** Notifie le parent quand le dropdown s'ouvre/ferme. */
  onOpenChange?: (open: boolean) => void;
}

export function NewsletterTemplatePicker({
  tenantId,
  selectedId,
  onSelect,
  embedded = false,
  onOpenChange,
}: NewsletterTemplatePickerProps) {
  const { t } = useTranslation();
  const { data: templates = [], isLoading } = useNewsletterTemplates(tenantId);
  const [open, setOpen] = useState(false);

  const handlePick = (template: NewsletterTemplate) => {
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

  const inner = (
    <>
      {/* En mode standalone, le titre est à l'intérieur ; en mode embedded, le parent le fournit */}
      {!embedded && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold tracking-tight text-[#1D141F]">
            {t.publicationComposer.templateLabel ?? 'Modèle de newsletter'}
          </p>
          {selectedId && (
            <button
              type="button"
              onClick={() => onSelect(null, DEFAULT_PLACEHOLDERS)}
              className="text-xs font-medium text-[oklch(0.55_0.18_250)] hover:underline"
            >
              {t.common.reset ?? 'Réinitialiser'}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => { const next = !open; setOpen(next); onOpenChange?.(next); }}
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
                  const variant = isAcademyTemplate(template) ? 'academy' : 'yellow';
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handlePick(template)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200',
                        isSelected
                          ? variant === 'academy'
                            ? 'border-[#D95800]/40 bg-[#D95800]/08 shadow-[0_1px_3px_rgba(217,88,0,0.14)]'
                            : 'border-[#E2F343]/45 bg-[#E2F343]/08 shadow-[0_1px_3px_rgba(226,243,67,0.12)]'
                          : 'border-[#E8ECEF] bg-white hover:border-[#D4DEE6] hover:bg-[#FAFBFC] hover:shadow-sm'
                      )}
                    >
                      {variant === 'academy' && isSelected ? (
                        <span
                          aria-hidden
                          className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-[#D95800]"
                        />
                      ) : null}
                      <TemplateThumbnail
                        template={template}
                        isSelected={isSelected}
                        variant={variant}
                      />
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

  if (embedded) return inner;

  return (
    <div className="mb-5 rounded-xl border border-[#E8ECEF] bg-linear-to-b from-[#FAFBFC] to-white p-4 shadow-[0_1px_2px_rgba(29,20,31,0.04)]">
      {inner}
    </div>
  );
}

export { DEFAULT_PLACEHOLDERS };

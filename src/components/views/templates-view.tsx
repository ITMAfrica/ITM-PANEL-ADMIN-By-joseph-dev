'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useTemplates } from '@/hooks/use-templates';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  type ViewTab,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableCheckboxHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableCheckboxCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

type TemplateTab = 'all' | 'newsletter' | 'article' | 'announcement' | 'communique';

function getTemplateTypeColor(type: string) {
  switch (type) {
    case 'newsletter':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'article':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'announcement':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'communique':
      return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export function TemplatesView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: templates = [] } = useTemplates(activeTenantId);

  const [activeTab, setActiveTab] = useState<TemplateTab>('all');
  const [search, setSearch] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);

  const filtered = useMemo(() => {
    let result = templates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (tp) =>
          tp.name.toLowerCase().includes(q) ||
          tp.description.toLowerCase().includes(q) ||
          tp.category.toLowerCase().includes(q)
      );
    }
    if (activeTab !== 'all') {
      result = result.filter((tp) => tp.type === activeTab);
    }
    return result;
  }, [templates, search, activeTab]);

  const tabs: ViewTab<TemplateTab>[] = [
    { id: 'all', label: t.templates.all },
    { id: 'newsletter', label: t.templates.newsletter },
    { id: 'article', label: t.templates.article },
    { id: 'announcement', label: t.templates.announcement },
    { id: 'communique', label: 'Communiqué' },
  ];

  const formatDate = (dateStr: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ViewShell>
      <UpgradePlanBanner variant="templates" />
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <ViewTabPanel>
        <ViewToolbar>
          <ViewSearchInput
            value={search}
            onChange={setSearch}
            placeholder={t.templates.search}
          />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">Type</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">Catégorie</ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">Usages</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.editorialCalendar.columns.date}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filtered.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={7}
                message={t.templates.noResults}
                illustrationId="compose-newsletter"
              />
            ) : (
              filtered.map((template) => {
                const typeLabel =
                  t.templates[template.type as keyof typeof t.templates] || template.type;
                const typeColor = getTemplateTypeColor(template.type);
                return (
                  <ViewDataTableRow key={template.id}>
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {template.description}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell">
                      <ViewStatusText label={typeLabel} className={cn(typeColor)} />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {template.category}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {template.usageCount}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {formatDate(template.createdAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={template.isPremium ? t.templates.premium : 'Standard'}
                        className={
                          template.isPremium
                            ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                            : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                        }
                      />
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>
      </ViewTabPanel>
    </ViewShell>
  );
}

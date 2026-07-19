'use client';

import { useState, useMemo } from 'react';
import { Archive, Mail, FileText, Megaphone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useContent } from '@/hooks/use-content';
import { stripMediaMarkdown } from '@/lib/media-insert';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewContentSurface,
  type ViewTab,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

type CombinedContent = ContentItem & { contentType: 'newsletter' | 'article' | 'announcement' };
type ArchiveTab = 'all' | 'newsletter' | 'article' | 'announcement';

function getContentTypeColor(type: string) {
  switch (type) {
    case 'newsletter':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'article':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'announcement':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export function ArchiveView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const { data: archivedItems = [] } = useContent({ tenantId: activeTenantId, status: 'archived' });
  const { getUserName } = useUserLookup(activeTenantId);

  const [activeTab, setActiveTab] = useState<ArchiveTab>('all');
  const [search, setSearch] = useState('');

  const archived: CombinedContent[] = useMemo(
    () =>
      archivedItems.map((item) => ({
        ...item,
        contentType: item.type as CombinedContent['contentType'],
      })),
    [archivedItems]
  );

  const filtered = useMemo(() => {
    let result = archived;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.excerpt.toLowerCase().includes(q)
      );
    }

    if (activeTab !== 'all') {
      result = result.filter((c) => c.contentType === activeTab);
    }

    return result;
  }, [archived, search, activeTab]);

  const tabs: ViewTab<ArchiveTab>[] = [
    { id: 'all', label: t.archive.originalType, icon: <Archive className="h-3.5 w-3.5" /> },
    { id: 'newsletter', label: t.nav.newsletters, icon: <Mail className="h-3.5 w-3.5" /> },
    { id: 'article', label: t.nav.articles, icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'announcement', label: t.nav.announcements, icon: <Megaphone className="h-3.5 w-3.5" /> },
  ];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <ViewShell>
      <UpgradePlanBanner variant="archive" />
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <ViewTabPanel>
        <ViewToolbar>
          <ViewSearchInput value={search} onChange={setSearch} placeholder={t.archive.search} />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {locale === 'fr' ? 'Type' : 'Type'}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.archive.archivedDate}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.newsletters.author}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell text-right">
              {locale === 'fr' ? 'Actions' : 'Actions'}
            </ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filtered.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={5}
                message={t.archive.noResults}
                illustrationId="archive"
              />
            ) : (
              filtered.map((content) => {
                const typeColor = getContentTypeColor(content.contentType);
                return (
                  <ViewDataTableRow
                    key={content.id}
                    onClick={() =>
                      setSelectedContent(content as unknown as Record<string, unknown>)
                    }
                  >
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{stripMediaMarkdown(content.excerpt) || '—'}</p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell">
                      <ViewStatusText
                        label={t.nav[content.contentType as keyof typeof t.nav] || content.contentType}
                        className={cn(typeColor)}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {formatDate(content.updatedAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {getUserName(content.authorId)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-right">
                      <div
                        className="flex items-center justify-end gap-3 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="text-[oklch(0.55_0.18_250)] hover:underline font-medium"
                        >
                          {t.archive.restore}
                        </button>
                        <button
                          type="button"
                          className="text-rose-600 hover:underline font-medium"
                        >
                          {t.archive.delete}
                        </button>
                      </div>
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>

        {filtered.length > 0 && (
          <ViewContentSurface className="border-rose-500/20 bg-rose-500/[0.02] px-4 py-3">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
              {locale === 'fr' ? 'Zone de danger' : 'Danger Zone'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'fr'
                ? 'La suppression permanente est irréversible. Les contenus supprimés ne pourront pas être récupérés.'
                : 'Permanent deletion is irreversible. Deleted content cannot be recovered.'}
            </p>
          </ViewContentSurface>
        )}
      </ViewTabPanel>
    </ViewShell>
  );
}

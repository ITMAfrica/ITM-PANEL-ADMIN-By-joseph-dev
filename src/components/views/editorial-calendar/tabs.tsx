import { useMemo, useState } from 'react';
import {
  ViewDataTable,
  ViewDataTableBody,
  ViewDataTableCell,
  ViewDataTableEmpty,
  ViewDataTableHead,
  ViewDataTableHeader,
  ViewDataTableRow,
} from '@/components/view-data-table';
import { useContent } from '@/hooks/use-content';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { ContentItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { stripMediaMarkdown } from '@/lib/media-insert';
import { ViewSearchInput, ViewTabPanel, ViewToolbar } from '@/components/view-layout';

export function ArchivedPublicationsTab() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);
  const { data: archivedItems = [] } = useContent({ tenantId: activeTenantId, status: 'archived' });
  const { getUserName } = useUserLookup(activeTenantId);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return archivedItems;
    return archivedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query)
    );
  }, [archivedItems, search]);

  const openContent = (content: ContentItem) => {
    setSelectedContent(content as unknown as Record<string, unknown>);
    setContentDetailOpen(true);
  };

  return (
    <ViewTabPanel>
      <ViewToolbar>
        <ViewSearchInput
          value={search}
          onChange={setSearch}
          placeholder={t.archive.search}
        />
      </ViewToolbar>
      <ViewDataTable transparent={false}>
        <ViewDataTableHeader>
          <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
          <ViewDataTableHead className="hidden md:table-cell">Type</ViewDataTableHead>
          <ViewDataTableHead className="hidden sm:table-cell">{t.archive.archivedDate}</ViewDataTableHead>
          <ViewDataTableHead className="hidden lg:table-cell">{t.newsletters.author}</ViewDataTableHead>
        </ViewDataTableHeader>
        <ViewDataTableBody>
          {filtered.length === 0 ? (
            <ViewDataTableEmpty
              colSpan={4}
              message={t.editorialCalendar.noArchived}
              illustrationId="archive"
            />
          ) : (
            filtered.map((content) => (
              <ViewDataTableRow key={content.id} onClick={() => openContent(content)}>
                <ViewDataTableCell>
                  <p className="font-medium truncate">{content.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {stripMediaMarkdown(content.excerpt) || '—'}
                  </p>
                </ViewDataTableCell>
                <ViewDataTableCell className="hidden md:table-cell text-xs capitalize text-muted-foreground">
                  {content.type}
                </ViewDataTableCell>
                <ViewDataTableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {new Date(content.updatedAt).toLocaleDateString(
                    locale === 'fr' ? 'fr-FR' : 'en-US',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )}
                </ViewDataTableCell>
                <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                  {getUserName(content.authorId)}
                </ViewDataTableCell>
              </ViewDataTableRow>
            ))
          )}
        </ViewDataTableBody>
      </ViewDataTable>
    </ViewTabPanel>
  );
}

export function LibraryPublicationsTab() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const { data: publishedItems = [] } = useContent({ tenantId: activeTenantId, status: 'published' });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return publishedItems;
    return publishedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query)
    );
  }, [publishedItems, search]);

  const openContent = (content: ContentItem) => {
    setSelectedContent(content as unknown as Record<string, unknown>);
    setContentDetailOpen(true);
  };

  return (
    <ViewTabPanel>
      <ViewToolbar>
        <ViewSearchInput
          value={search}
          onChange={setSearch}
          placeholder={t.library.search}
        />
      </ViewToolbar>
      <ViewDataTable transparent={false}>
        <ViewDataTableHeader>
          <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
          <ViewDataTableHead className="hidden sm:table-cell">{t.published.publishedDate}</ViewDataTableHead>
          <ViewDataTableHead className="hidden md:table-cell">Type</ViewDataTableHead>
          <ViewDataTableHead className="hidden lg:table-cell text-right">
            {locale === 'fr' ? 'Actions' : 'Actions'}
          </ViewDataTableHead>
        </ViewDataTableHeader>
        <ViewDataTableBody>
          {filtered.length === 0 ? (
            <ViewDataTableEmpty
              colSpan={4}
              message={t.editorialCalendar.noLibrary}
              illustrationId="library"
            />
          ) : (
            filtered.map((content) => (
              <ViewDataTableRow key={content.id} onClick={() => openContent(content)}>
                <ViewDataTableCell>
                  <p className="font-medium truncate">{content.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {stripMediaMarkdown(content.excerpt) || '—'}
                  </p>
                </ViewDataTableCell>
                <ViewDataTableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {content.publishedAt
                    ? new Date(content.publishedAt).toLocaleDateString(
                        locale === 'fr' ? 'fr-FR' : 'en-US',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )
                    : '—'}
                </ViewDataTableCell>
                <ViewDataTableCell className="hidden md:table-cell text-xs capitalize text-muted-foreground">
                  {content.type}
                </ViewDataTableCell>
                <ViewDataTableCell className="hidden lg:table-cell text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-[oklch(0.55_0.18_250)] hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      const composerType =
                        content.type === 'newsletter' ||
                        content.type === 'article' ||
                        content.type === 'announcement'
                          ? content.type
                          : 'article';
                      openPublicationComposer({ type: composerType });
                    }}
                  >
                    {t.editorialCalendar.reuse}
                  </button>
                </ViewDataTableCell>
              </ViewDataTableRow>
            ))
          )}
        </ViewDataTableBody>
      </ViewDataTable>
    </ViewTabPanel>
  );
}

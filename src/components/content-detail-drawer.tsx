'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NewsletterSendsPanel } from '@/components/newsletter-sends-panel';
import { NewsletterSectionsPreview } from '@/components/publication-composer/newsletter-sections-preview';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Mail,
  FileText,
  Megaphone,
  Newspaper,
  Clock,
  Calendar,
  Tag,
  Eye,
  Pencil,
  Trash2,
  ArrowRightCircle,
  ThumbsUp,
  ThumbsDown,
  CalendarClock,
  Archive,
  Target,
  Loader2,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ContentItem, ContentType, NewsletterSection } from '@/lib/types';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { BRAND_DARK, BRAND_YELLOW, editorialClasses } from '@/lib/editorial-design';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { formatContentPreview } from '@/lib/media-insert';
import type { PublicationComposerType } from '@/lib/publication-composer';
import {
  useApproveContent,
  useContentById,
  useDeleteContent,
  useRejectContent,
  useSubmitContentForReview,
} from '@/hooks/use-content';

const contentTypeConfig: Record<
  ContentType,
  { icon: React.ElementType; label: Record<string, string> }
> = {
  newsletter: {
    icon: Mail,
    label: { fr: 'Newsletter', en: 'Newsletter' },
  },
  article: {
    icon: FileText,
    label: { fr: 'Article', en: 'Article' },
  },
  announcement: {
    icon: Megaphone,
    label: { fr: 'Communication', en: 'Communication' },
  },
  communique: {
    icon: Newspaper,
    label: { fr: 'Communiqué', en: 'Press Release' },
  },
  campaign: {
    icon: Target,
    label: { fr: 'Campagne', en: 'Campaign' },
  },
};

function parseNewsletterSections(body: string): NewsletterSection[] {
  try {
    const parsed = JSON.parse(body) as unknown;
    return Array.isArray(parsed) ? (parsed as NewsletterSection[]) : [];
  } catch {
    return [];
  }
}

/** Newsletter, article et communication partagent l'éditeur de sections (body JSON). */
function isSectionsContentType(type: ContentType): boolean {
  return type === 'newsletter' || type === 'article' || type === 'announcement';
}

function MetaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E8ECEF] bg-[#F8FAFB] px-3.5 py-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#8B939E]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8B939E]">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug text-[#1D141F]">{value}</p>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
  trailing,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#8B939E]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B939E]">
          {children}
        </span>
      </div>
      {trailing}
    </div>
  );
}

export function ContentDetailDrawer() {
  const contentDetailOpen = useAppStore((s) => s.contentDetailOpen);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);
  const selectedContent = useAppStore((s) => s.selectedContent);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const openPublicationComposer = useAppStore((s) => s.openPublicationComposer);
  const locale = useAppStore((s) => s.locale);
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { getUserName, getUserInitials } = useUserLookup(activeTenantId);
  const approveContent = useApproveContent();
  const rejectContent = useRejectContent();
  const submitForReview = useSubmitContentForReview();
  const deleteContent = useDeleteContent();

  const content = selectedContent as ContentItem | null;
  const contentId = content?.id;

  const {
    data: detail,
    isLoading: isLoadingDetail,
  } = useContentById(contentId, contentDetailOpen && !!contentId);

  const contentType = content?.type || 'article';
  const typeConfig = contentTypeConfig[contentType] || contentTypeConfig.article;
  const TypeIcon = typeConfig.icon;

  const statusColor = content ? contentStatusColors[content.status] : null;
  const statusLabel = content
    ? contentStatusLabels[locale]?.[content.status] || content.status
    : '';
  const authorName = content ? getUserName(content.authorId) : '';
  const authorInitials = content ? getUserInitials(content.authorId) : '';

  // Body JSON de sections (newsletter, article, communication) : le détail
  // affiche le rendu blocs. Un body texte classique garde l'aperçu texte.
  const isSectionsBody =
    isSectionsContentType(contentType) && (detail?.body ?? '').trim().startsWith('[');
  const contentSections = useMemo(() => {
    if (!isSectionsContentType(contentType) || !detail?.body) return [];
    return parseNewsletterSections(detail.body);
  }, [contentType, detail?.body]);

  const emailSubject =
    contentType === 'newsletter' && detail?.metadata
      ? String(detail.metadata.emailSubject ?? '')
      : contentType === 'newsletter' && 'subject' in (content ?? {})
        ? String((content as { subject?: string }).subject ?? '')
        : '';

  const preview = useMemo(() => {
    if (isSectionsBody) {
      return { text: '', imageUrl: null as string | null };
    }
    const source = detail?.body || content?.excerpt || '';
    return formatContentPreview(source);
  }, [isSectionsBody, detail?.body, content?.excerpt]);

  const wordCount =
    contentType !== 'newsletter' && preview.text
      ? preview.text.split(/\s+/).filter(Boolean).length
      : 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleWorkflowAction = async (action: 'submitReview' | 'approve' | 'reject') => {
    if (!content) return;

    try {
      let updated: ContentItem;
      if (action === 'submitReview') {
        updated = await submitForReview.mutateAsync(content.id);
        toast.success(t.contentDetail.submitReview);
      } else if (action === 'approve') {
        updated = await approveContent.mutateAsync(content.id);
        toast.success(t.contentDetail.approve);
      } else {
        updated = await rejectContent.mutateAsync({ id: content.id });
        toast.success(t.contentDetail.reject);
      }
      setSelectedContent(updated as unknown as Record<string, unknown>);
    } catch {
      toast.error(
        locale === 'fr'
          ? 'Action impossible pour ce contenu'
          : 'Unable to perform this action on the content'
      );
    }
  };

  const handleDelete = async () => {
    if (!content) return;

    const confirmed = window.confirm(
      locale === 'fr'
        ? `Supprimer « ${content.title} » ? Cette action est irréversible.`
        : `Delete "${content.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteContent.mutateAsync(content.id);
      setContentDetailOpen(false);
      setTimeout(() => setSelectedContent(null), 300);
      toast.success(t.contentDetail.contentDeleted);
    } catch {
      toast.error(
        locale === 'fr'
          ? 'Échec de la suppression du contenu'
          : 'Failed to delete content'
      );
    }
  };

  const handleEdit = () => {
    if (!content) return;

    if (content.type === 'campaign') {
      toast.error(t.publicationComposer.editNotSupported);
      return;
    }

    const composerType = content.type as PublicationComposerType;
    setContentDetailOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
    openPublicationComposer({
      type: composerType,
      editContentId: content.id,
      scheduledAt: content.scheduledAt ? new Date(content.scheduledAt) : undefined,
    });
  };

  const handleAction = (action: string) => {
    toast.success(action);
  };

  const detailBody = content ? (
    <ScrollArea className="flex-1 px-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-5 pb-5 pt-1"
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <MetaCard
            icon={Calendar}
            label={t.contentDetail.createdAt}
            value={formatDate(content.createdAt)}
          />
          <MetaCard
            icon={Clock}
            label={t.contentDetail.modifiedAt}
            value={formatDate(content.updatedAt)}
          />
          {content.status === 'scheduled' && content.scheduledAt && (
            <MetaCard
              icon={CalendarClock}
              label={t.contentDetail.scheduledAt}
              value={formatDate(content.scheduledAt)}
            />
          )}
          {emailSubject ? (
            <MetaCard icon={Mail} label={t.contentDetail.emailSubject} value={emailSubject} />
          ) : null}
        </div>

        {content.tags && content.tags.length > 0 && (
          <div>
            <SectionLabel icon={Tag}>{t.contentDetail.tags}</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {content.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-lg border border-[#E8ECEF] bg-white px-2.5 py-0.5 text-xs font-medium text-[#5C6470]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionLabel
            icon={isSectionsBody ? Layers : Eye}
            trailing={
              isSectionsBody && contentSections.length > 0 ? (
                <span className="rounded-full bg-[#1D141F] px-2 py-0.5 text-[10px] font-semibold text-[#E2F343]">
                  {t.contentDetail.sectionsCount.replace(
                    '{count}',
                    String(contentSections.length)
                  )}
                </span>
              ) : wordCount > 0 ? (
                <span className="rounded-full border border-[#E8ECEF] bg-[#F5F7F9] px-2 py-0.5 text-[10px] font-medium text-[#8B939E]">
                  {wordCount} {t.contentDetail.wordCount}
                </span>
              ) : null
            }
          >
            {t.contentDetail.preview}
          </SectionLabel>

          {isSectionsBody ? (
            isLoadingDetail ? (
              <div className="flex min-h-[140px] items-center justify-center gap-2 rounded-xl border border-[#E8ECEF] bg-[#F8FAFB] text-sm text-[#8B939E]">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.contentDetail.loadingPreview}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E8ECEF] bg-white shadow-sm">
                <NewsletterSectionsPreview sections={contentSections} />
              </div>
            )
          ) : (
            <div className="space-y-3 rounded-xl border border-[#E8ECEF] bg-[#F8FAFB] p-4">
              {isLoadingDetail && !preview.text && !preview.imageUrl ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#8B939E]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.contentDetail.loadingPreview}
                </div>
              ) : preview.text ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1D141F]/90">
                  {preview.text.length > 600
                    ? `${preview.text.slice(0, 600).trim()}…`
                    : preview.text}
                </p>
              ) : !preview.imageUrl ? (
                <p className="py-6 text-center text-sm italic text-[#8B939E]">
                  {t.contentDetail.noPreview}
                </p>
              ) : null}
              {preview.imageUrl ? (
                <div className="overflow-hidden rounded-lg border border-[#E8ECEF]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.imageUrl}
                    alt=""
                    className="max-h-56 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
    </ScrollArea>
  ) : null;

  return (
    <Sheet
      open={contentDetailOpen}
      onOpenChange={(open) => {
        setContentDetailOpen(open);
        if (!open) {
          setTimeout(() => setSelectedContent(null), 300);
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-hidden border-l border-[#E8ECEF] bg-white p-0 sm:max-w-lg"
      >
        {content ? (
          <>
            <SheetHeader className="space-y-0 border-b border-[#E8ECEF] bg-gradient-to-b from-[#F8FAFB] to-white p-0">
              <div className="flex items-start gap-3 px-5 pb-5 pt-6 pr-12">
                <div className={cn(editorialClasses.iconBox, 'mt-0.5')}>
                  <TypeIcon className={cn('h-5 w-5', editorialClasses.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B939E]">
                      {typeConfig.label[locale] || typeConfig.label.fr}
                    </span>
                    {statusColor && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                          statusColor.bg,
                          statusColor.text,
                          statusColor.border
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel}
                      </span>
                    )}
                  </div>

                  <SheetTitle className="text-left text-xl font-bold leading-snug tracking-tight text-[#1D141F]">
                    {content.title}
                  </SheetTitle>

                  <div className="mt-3.5 flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 border border-[#E8ECEF] shadow-sm">
                      <AvatarFallback className="bg-[#1D141F] text-[0.65rem] font-semibold text-[#E2F343]">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1D141F]">{authorName}</p>
                      <p className="text-xs text-[#8B939E]">{t.contentDetail.author}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <SheetDescription className="sr-only">
              {t.contentDetail.title} - {content.title}
            </SheetDescription>

            {content.type === 'newsletter' ? (
              <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-[#E8ECEF] px-5 pt-3">
                  <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
                    <TabsTrigger
                      value="details"
                      className={cn(
                        'relative rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1 text-sm shadow-none',
                        'data-[state=active]:border-[#1D141F] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#1D141F]',
                        'data-[state=inactive]:font-normal data-[state=inactive]:text-[#8B939E]'
                      )}
                    >
                      {t.newsletterSends.details}
                    </TabsTrigger>
                    <TabsTrigger
                      value="openings"
                      className={cn(
                        'relative rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-1 text-sm shadow-none',
                        'data-[state=active]:border-[#1D141F] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#1D141F]',
                        'data-[state=inactive]:font-normal data-[state=inactive]:text-[#8B939E]'
                      )}
                    >
                      {t.newsletterSends.openings}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent
                  value="details"
                  className="mt-0 flex min-h-0 flex-col data-[state=inactive]:hidden"
                >
                  {detailBody}
                </TabsContent>
                <TabsContent
                  value="openings"
                  className="mt-0 flex min-h-0 flex-col data-[state=inactive]:hidden"
                >
                  <NewsletterSendsPanel contentId={content.id} />
                </TabsContent>
              </Tabs>
            ) : (
              detailBody
            )}

            <div className="space-y-2 border-t border-[#E8ECEF] bg-white/95 p-4 backdrop-blur-sm">
              <div className="flex gap-2">
                {content.status === 'draft' && (
                  <Button
                    className="h-9 flex-1 gap-1.5 rounded-lg font-semibold text-white shadow-sm hover:opacity-90"
                    style={{ backgroundColor: '#D97706' }}
                    size="sm"
                    onClick={() => handleWorkflowAction('submitReview')}
                  >
                    <ArrowRightCircle className="h-3.5 w-3.5" />
                    {t.contentDetail.submitReview}
                  </Button>
                )}
                {content.status === 'review' && (
                  <>
                    <Button
                      className="h-9 flex-1 gap-1.5 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                      size="sm"
                      onClick={() => handleWorkflowAction('approve')}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {t.contentDetail.approve}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 flex-1 gap-1.5 rounded-lg border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                      size="sm"
                      onClick={() => handleWorkflowAction('reject')}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      {t.contentDetail.reject}
                    </Button>
                  </>
                )}
                {content.status === 'approved' && (
                  <Button
                    className="h-9 flex-1 gap-1.5 rounded-lg font-semibold shadow-sm hover:opacity-90"
                    style={{ backgroundColor: BRAND_DARK, color: BRAND_YELLOW }}
                    size="sm"
                    onClick={() => handleAction(t.contentDetail.schedule)}
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    {t.contentDetail.schedule}
                  </Button>
                )}
                {content.status === 'published' && (
                  <Button
                    variant="outline"
                    className="h-9 flex-1 gap-1.5 rounded-lg border-[#E8ECEF] text-[#5C6470] hover:bg-[#F8FAFB]"
                    size="sm"
                    onClick={() => handleAction(t.contentDetail.archive)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {t.contentDetail.archive}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="h-9 flex-1 gap-1.5 rounded-lg font-semibold shadow-sm hover:opacity-90"
                  style={{ backgroundColor: BRAND_DARK, color: BRAND_YELLOW }}
                  size="sm"
                  onClick={handleEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t.contentDetail.edit}
                </Button>
                <Button
                  variant="outline"
                  className="h-9 gap-1.5 rounded-lg border-rose-500/30 text-rose-600 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-600"
                  size="sm"
                  disabled={deleteContent.isPending}
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.contentDetail.delete}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
            <div className={editorialClasses.iconBox}>
              <FileText className={cn('h-5 w-5', editorialClasses.iconColor)} />
            </div>
            <p className="text-center text-sm text-[#8B939E]">{t.contentDetail.noContent}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

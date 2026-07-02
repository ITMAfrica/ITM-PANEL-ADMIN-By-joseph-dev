'use client';

import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  User,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ContentItem, ContentType } from '@/lib/types';
import { contentStatusColors, contentStatusLabels } from '@/lib/ui-constants';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { formatContentPreview } from '@/lib/media-insert';

// ─── Content type config ─────────────────────────────────────────────────
const contentTypeConfig: Record<ContentType, { icon: React.ElementType; label: Record<string, string>; gradient: string; color: string }> = {
  newsletter: {
    icon: Mail,
    label: { fr: 'Newsletter', en: 'Newsletter' },
    gradient: 'from-[oklch(0.55_0.18_250)] to-[oklch(0.50_0.15_160)]',
    color: '[oklch(0.55_0.18_250)]',
  },
  article: {
    icon: FileText,
    label: { fr: 'Article', en: 'Article' },
    gradient: 'from-emerald-500 to-teal-500',
    color: 'emerald-500',
  },
  announcement: {
    icon: Megaphone,
    label: { fr: 'Annonce', en: 'Announcement' },
    gradient: 'from-amber-500 to-orange-500',
    color: 'amber-500',
  },
  communique: {
    icon: Newspaper,
    label: { fr: 'Communiqué', en: 'Press Release' },
    gradient: 'from-rose-500 to-pink-500',
    color: 'rose-500',
  },
  campaign: {
    icon: Target,
    label: { fr: 'Campagne', en: 'Campaign' },
    gradient: 'from-cyan-500 to-blue-500',
    color: 'cyan-500',
  },
};

// ─── Notification type icons ──────────────────────────────────────────────
function getRelativeTimeFR(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "à l'instant";
  if (diffMinutes < 60) return `il y a ${diffMinutes}m`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getRelativeTimeEN(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function getRelativeTime(timestamp: string, locale: 'fr' | 'en'): string {
  return locale === 'fr' ? getRelativeTimeFR(timestamp) : getRelativeTimeEN(timestamp);
}

// ─── Component ────────────────────────────────────────────────────────────
export function ContentDetailDrawer() {
  const contentDetailOpen = useAppStore((s) => s.contentDetailOpen);
  const setContentDetailOpen = useAppStore((s) => s.setContentDetailOpen);
  const selectedContent = useAppStore((s) => s.selectedContent);
  const setSelectedContent = useAppStore((s) => s.setSelectedContent);
  const locale = useAppStore((s) => s.locale);
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { getUserName, getUserInitials } = useUserLookup(activeTenantId);

  const content = selectedContent as ContentItem | null;

  // Derived data from the content item
  const contentType = content?.type || 'article';
  const typeConfig = contentTypeConfig[contentType] || contentTypeConfig.article;
  const TypeIcon = typeConfig.icon;

  const statusColor = content ? contentStatusColors[content.status] : null;
  const statusLabel = content ? (contentStatusLabels[locale]?.[content.status] || content.status) : '';
  const authorName = content ? getUserName(content.authorId) : '';
  const authorInitials = content ? getUserInitials(content.authorId) : '';

  const preview = content ? formatContentPreview(content.excerpt) : { text: '', imageUrl: null };

  const wordCount = preview.text
    ? preview.text.split(/\s+/).filter(Boolean).length
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAction = (action: string) => {
    toast.success(action);
  };

  return (
    <Sheet
      open={contentDetailOpen}
      onOpenChange={(open) => {
        setContentDetailOpen(open);
        if (!open) {
          // Delay clearing content to allow close animation
          setTimeout(() => setSelectedContent(null), 300);
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 gap-0 overflow-hidden"
      >
        {content ? (
          <>
            {/* Gradient top border */}
            <div className={cn('h-1.5 bg-gradient-to-r', typeConfig.gradient)} />

            {/* Header */}
            <SheetHeader className="p-5 pb-3 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'p-2 rounded-xl border',
                    contentType === 'newsletter' && 'bg-[oklch(0.55_0.18_250/0.1)] border-[oklch(0.55_0.18_250/0.2)]',
                    contentType === 'article' && 'bg-emerald-500/10 border-emerald-500/20',
                    contentType === 'announcement' && 'bg-amber-500/10 border-amber-500/20',
                    contentType === 'communique' && 'bg-rose-500/10 border-rose-500/20',
                    contentType === 'campaign' && 'bg-cyan-500/10 border-cyan-500/20',
                  )}>
                    <TypeIcon className={cn(
                      'h-4 w-4',
                      contentType === 'newsletter' && 'text-[oklch(0.55_0.18_250)]',
                      contentType === 'article' && 'text-emerald-600',
                      contentType === 'announcement' && 'text-amber-600',
                      contentType === 'communique' && 'text-rose-600',
                      contentType === 'campaign' && 'text-cyan-600',
                    )} />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-2 py-0.5 gap-1 font-medium',
                      contentType === 'newsletter' && 'bg-[oklch(0.55_0.18_250/0.08)] text-[oklch(0.55_0.18_250)] border-[oklch(0.55_0.18_250/0.2)]',
                      contentType === 'article' && 'bg-emerald-500/8 text-emerald-600 border-emerald-500/20',
                      contentType === 'announcement' && 'bg-amber-500/8 text-amber-600 border-amber-500/20',
                      contentType === 'communique' && 'bg-rose-500/8 text-rose-600 border-rose-500/20',
                      contentType === 'campaign' && 'bg-cyan-500/8 text-cyan-600 border-cyan-500/20',
                    )}
                  >
                    {typeConfig.label[locale] || typeConfig.label.fr}
                  </Badge>
                </div>
                {/* Close button is handled by Sheet */}
              </div>

              <SheetTitle className="text-lg font-bold tracking-tight text-left">
                {content.title}
              </SheetTitle>

              {statusColor && (
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      'text-xs px-2.5 py-1 gap-1.5 font-medium border',
                      statusColor.bg,
                      statusColor.text,
                      statusColor.border
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {statusLabel}
                  </Badge>
                </div>
              )}
            </SheetHeader>

            <SheetDescription className="sr-only">
              {t.contentDetail.title} - {content.title}
            </SheetDescription>

            {/* Scrollable content */}
            <ScrollArea className="flex-1 px-5">
              <div className="space-y-5 pb-4">
                {/* ─── Metadata section ─────────────────────────────── */}
                <div className="space-y-3">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/50">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-[oklch(0.55_0.18_250/0.1)] text-[oklch(0.55_0.18_250)] font-medium">
                          {authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{authorName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">{t.contentDetail.author}</span>
                  </div>

                  {/* Created date */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/50">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground flex-1">{formatDate(content.createdAt)}</span>
                    <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">{t.contentDetail.createdAt}</span>
                  </div>

                  {/* Modified date */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/50">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground flex-1">{formatDate(content.updatedAt)}</span>
                    <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">{t.contentDetail.modifiedAt}</span>
                  </div>

                  {/* Scheduled date (if status === 'scheduled') */}
                  {content.status === 'scheduled' && content.scheduledAt && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10">
                        <CalendarClock className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <span className="text-sm text-violet-600 font-medium flex-1">{formatDate(content.scheduledAt)}</span>
                      <span className="text-xs text-violet-500/60 uppercase tracking-wider font-medium">{t.contentDetail.scheduledAt}</span>
                    </div>
                  )}
                </div>

                {/* ─── Tags ─────────────────────────────────────────── */}
                {content.tags && content.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.contentDetail.tags}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {content.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2.5 py-0.5 bg-muted/50 hover:bg-muted text-muted-foreground font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── Content Preview ──────────────────────────────── */}
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.contentDetail.preview}</span>
                    </div>
                    {wordCount > 0 && (
                      <span className="text-xs text-muted-foreground/50 font-medium">
                        {wordCount} {t.contentDetail.wordCount}
                      </span>
                    )}
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    {preview.text ? (
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {preview.text}
                      </p>
                    ) : !preview.imageUrl ? (
                      <p className="text-sm text-muted-foreground italic">
                        {locale === 'fr' ? 'Aucun aperçu disponible' : 'No preview available'}
                      </p>
                    ) : null}
                    {preview.imageUrl ? (
                      <div className="overflow-hidden rounded-lg border border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview.imageUrl}
                          alt=""
                          className="max-h-48 w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* ─── Workflow Actions (sticky bottom) ──────────────────── */}
            <div className="border-t bg-background/95 backdrop-blur-sm p-4 space-y-2">
              {/* Workflow-specific actions */}
              <div className="flex gap-2">
                {content.status === 'draft' && (
                  <Button
                    className="flex-1 gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
                    size="sm"
                    onClick={() => handleAction(t.contentDetail.submitReview)}
                  >
                    <ArrowRightCircle className="h-3.5 w-3.5" />
                    {t.contentDetail.submitReview}
                  </Button>
                )}
                {content.status === 'review' && (
                  <>
                    <Button
                      className="flex-1 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm"
                      size="sm"
                      onClick={() => handleAction(t.contentDetail.approve)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {t.contentDetail.approve}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-1.5 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                      size="sm"
                      onClick={() => handleAction(t.contentDetail.reject)}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      {t.contentDetail.reject}
                    </Button>
                  </>
                )}
                {content.status === 'approved' && (
                  <Button
                    className="flex-1 gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-sm"
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
                    className="flex-1 gap-1.5 border-slate-500/30 text-slate-600 hover:bg-slate-500/10"
                    size="sm"
                    onClick={() => handleAction(t.contentDetail.archive)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {t.contentDetail.archive}
                  </Button>
                )}
              </div>

              {/* Edit + Delete always visible */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  size="sm"
                  onClick={() => handleAction(t.contentDetail.edit)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t.contentDetail.edit}
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/50"
                  size="sm"
                  onClick={() => {
                    setContentDetailOpen(false);
                    setTimeout(() => setSelectedContent(null), 300);
                    toast.success(locale === 'fr' ? 'Contenu supprimé' : 'Content deleted');
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.contentDetail.delete}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state when no content selected */
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground text-center">{t.contentDetail.noContent}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

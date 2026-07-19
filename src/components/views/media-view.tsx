'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ImageIcon,
  Grid3X3,
  List,
  FileText,
  Film,
  Music,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Copy,
  File,
  Upload,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useMedia } from '@/hooks/use-media';
import { useUploadMedia } from '@/hooks/use-upload-media';
import { useDeleteMedia } from '@/hooks/use-delete-media';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { MediaPreviewDialog } from '@/components/media/media-preview-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UpgradePlanBanner } from '@/components/upgrade-plan-banner';
import { EmptyStateIllustration } from '@/components/empty-state-illustration';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewOutlineButton,
  BrandPrimaryButton,
  type ViewTab,
} from '@/components/view-layout';
import type { MediaItem } from '@/lib/types';

type MediaTab = 'all' | 'image' | 'video' | 'document' | 'audio';
type SortKey = 'name' | 'type' | 'size' | 'createdAt';
type SortDir = 'asc' | 'desc';

const MEDIA_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/aac';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function getMediaTypeIcon(type: string) {
  switch (type) {
    case 'image': return ImageIcon;
    case 'video': return Film;
    case 'document': return FileText;
    case 'audio': return Music;
    default: return File;
  }
}

function getMediaTypeColor(type: string) {
  switch (type) {
    case 'image': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
    case 'video': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'document': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'audio': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

function getMediaTypeGradient(type: string) {
  switch (type) {
    case 'image': return 'from-pink-500/10 to-pink-500/5';
    case 'video': return 'from-amber-500/10 to-amber-500/5';
    case 'document': return 'from-blue-500/10 to-blue-500/5';
    case 'audio': return 'from-blue-500/10 to-blue-500/5';
    default: return 'from-slate-500/10 to-slate-500/5';
  }
}

function getMediaTypeLabel(type: string, t: ReturnType<typeof useTranslation>['t']) {
  const key = type as keyof typeof t.media;
  if (key in t.media && typeof t.media[key] === 'string') {
    return t.media[key] as string;
  }
  return type;
}

function downloadMedia(item: MediaItem) {
  const anchor = document.createElement('a');
  anchor.href = item.url;
  anchor.download = item.name;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function MediaView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const { data: tenantMedia = [], isLoading, isError, refetch } = useMedia(activeTenantId);
  const uploadMedia = useUploadMedia(activeTenantId);
  const deleteMedia = useDeleteMedia(activeTenantId);
  const { getUserName, getUserInitials } = useUserLookup(activeTenantId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<MediaTab>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      for (const file of list) {
        try {
          await uploadMedia.mutateAsync(file);
          toast.success(t.media.uploadComplete);
        } catch (error) {
          const message = error instanceof Error ? error.message : t.media.uploadFailed;
          toast.error(message);
        }
      }
    },
    [uploadMedia, t.media.uploadComplete, t.media.uploadFailed]
  );

  const handleShare = useCallback(
    async (item: MediaItem) => {
      try {
        await navigator.clipboard.writeText(item.url);
        toast.success(t.media.linkCopied);
      } catch {
        toast.error(t.media.uploadFailed);
      }
    },
    [t.media.linkCopied, t.media.uploadFailed]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia.mutateAsync(deleteTarget.id);
      toast.success(t.media.deleteSuccess);
      setDeleteTarget(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.media.deleteFailed;
      toast.error(message);
    }
  }, [deleteTarget, deleteMedia, t.media.deleteSuccess, t.media.deleteFailed]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'name' ? 'asc' : 'desc');
  }, [sortKey]);

  const filtered = useMemo(() => {
    let result = tenantMedia;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (activeTab !== 'all') {
      result = result.filter((m) => m.type === activeTab);
    }

    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'size':
          cmp = a.size - b.size;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [tenantMedia, search, activeTab, sortKey, sortDir]);

  const tabs: ViewTab<MediaTab>[] = [
    { id: 'all', label: t.media.all, icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { id: 'image', label: t.media.images, icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { id: 'video', label: t.media.videos, icon: <Film className="h-3.5 w-3.5" /> },
    { id: 'document', label: t.media.documents, icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'audio', label: t.media.audio, icon: <Music className="h-3.5 w-3.5" /> },
  ];

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const renderSortButton = (label: string, key: SortKey, className?: string) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className={cn(
        'inline-flex items-center gap-1 text-left font-semibold transition-colors hover:text-foreground',
        sortKey === key ? 'text-foreground' : 'text-muted-foreground',
        className
      )}
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', sortKey === key && 'text-[#1D141F]')} />
    </button>
  );

  return (
    <ViewShell>
      <UpgradePlanBanner variant="media" />
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <ViewTabPanel>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={MEDIA_ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <ViewToolbar
          actions={
            <BrandPrimaryButton
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
            >
              {uploadMedia.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {t.media.upload}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={search}
            onChange={setSearch}
            placeholder={t.media.search}
          />
          <div className="flex items-center overflow-hidden rounded-lg border border-[#E8ECEF] bg-white">
            <ViewOutlineButton
              icon={<Grid3X3 className="h-4 w-4" />}
              className={cn('rounded-none border-0', viewMode === 'grid' && 'bg-[#1D141F] text-[#E2F343] hover:opacity-90')}
              onClick={() => setViewMode('grid')}
            />
            <ViewOutlineButton
              icon={<List className="h-4 w-4" />}
              className={cn('rounded-none border-0', viewMode === 'list' && 'bg-[#1D141F] text-[#E2F343] hover:opacity-90')}
              onClick={() => setViewMode('list')}
            />
          </div>
        </ViewToolbar>

        {isLoading ? (
          <Card className="overflow-hidden dark-card-glow">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t.common.loading}</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="overflow-hidden dark-card-glow">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <EmptyStateIllustration illustrationId="error-server" size="sm" />
              <p className="text-sm text-muted-foreground">{t.media.loadError}</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                {t.common.refresh}
              </Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="overflow-hidden dark-card-glow">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <EmptyStateIllustration series2Id="media-galaxy" size="md" />
              <p className="text-sm text-muted-foreground">{t.media.noFiles}</p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <AnimatePresence>
              {filtered.map((media, idx) => {
                const Icon = getMediaTypeIcon(media.type);
                const typeColor = getMediaTypeColor(media.type);
                const gradient = getMediaTypeGradient(media.type);
                return (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                      <div className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${gradient}`}>
                        {media.type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.thumbnailUrl || media.url}
                            alt={media.alt || media.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`rounded-2xl border p-3 ${typeColor}`}>
                            <Icon className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/30 group-hover:opacity-100">
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 rounded-full p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewItem(media);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 rounded-full p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadMedia(media);
                              }}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 rounded-full p-0 text-rose-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(media);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="truncate text-sm font-medium" title={media.name}>{media.name}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="outline" className={`${typeColor} h-5 px-1.5 py-0 text-xs`}>
                            {getMediaTypeLabel(media.type, t)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatFileSize(media.size)}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {new Date(media.createdAt).toLocaleDateString(dateLocale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="p-3 text-left">{renderSortButton(t.media.fileName, 'name')}</th>
                    <th className="hidden p-3 text-left sm:table-cell">{renderSortButton(t.media.fileType, 'type')}</th>
                    <th className="hidden p-3 text-left md:table-cell">{renderSortButton(t.media.fileSize, 'size')}</th>
                    <th className="hidden p-3 text-left lg:table-cell">{renderSortButton(t.media.added, 'createdAt')}</th>
                    <th className="hidden p-3 text-left lg:table-cell">{t.media.owner}</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((media, idx) => {
                    const Icon = getMediaTypeIcon(media.type);
                    const typeColor = getMediaTypeColor(media.type);
                    return (
                      <motion.tr
                        key={media.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.25 }}
                        className="group cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/30"
                        onClick={() => setPreviewItem(media)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {media.type === 'image' ? (
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border/40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={media.thumbnailUrl || media.url}
                                  alt={media.alt || media.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className={`rounded-lg border p-1.5 ${typeColor}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                            )}
                            <span className="max-w-[200px] truncate font-medium">{media.name}</span>
                          </div>
                        </td>
                        <td className="hidden p-3 sm:table-cell">
                          <Badge variant="outline" className={`${typeColor} h-5 px-1.5 py-0 text-sm`}>
                            {getMediaTypeLabel(media.type, t)}
                          </Badge>
                        </td>
                        <td className="hidden p-3 font-mono text-xs text-muted-foreground md:table-cell">
                          {formatFileSize(media.size)}
                        </td>
                        <td className="hidden p-3 text-xs text-muted-foreground lg:table-cell">
                          {new Date(media.createdAt).toLocaleDateString(dateLocale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="hidden p-3 lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.55_0.18_250/0.1)] text-xs font-semibold text-[oklch(0.55_0.18_250)]">
                              {getUserInitials(media.uploadedBy)}
                            </div>
                            <span className="text-xs text-muted-foreground">{getUserName(media.uploadedBy)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewItem(media);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" /> {t.media.preview}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadMedia(media);
                                }}
                              >
                                <Download className="h-3.5 w-3.5" /> {t.media.download}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleShare(media);
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" /> {t.media.share}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-rose-600 focus:text-rose-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(media);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> {t.common.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </ViewTabPanel>

      <MediaPreviewDialog
        item={previewItem}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.delete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.media.deleteConfirm.replace('{name}', deleteTarget?.name ?? '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deleteMedia.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
            >
              {deleteMedia.isPending ? t.common.loading : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ViewShell>
  );
}

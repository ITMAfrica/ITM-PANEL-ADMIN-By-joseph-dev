'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ImageIcon,
  Upload,
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
  HardDrive,
  File,
  CloudUpload,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useMedia } from '@/hooks/use-media';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  BrandPrimaryButton,
  ViewOutlineButton,
  type ViewTab,
} from '@/components/view-layout';

type MediaTab = 'all' | 'image' | 'video' | 'document' | 'audio';

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

export function MediaView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);
  const { data: tenantMedia = [] } = useMedia(activeTenantId);
  const { getUserName, getUserInitials } = useUserLookup(activeTenantId);

  const [activeTab, setActiveTab] = useState<MediaTab>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);

  const filtered = useMemo(() => {
    let result = tenantMedia;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (activeTab !== 'all') {
      result = result.filter((m) => m.type === activeTab);
    }
    return result;
  }, [tenantMedia, search, activeTab]);

  const totalStorage = 100 * 1024 * 1024 * 1024;
  const usedStorage = tenantMedia.reduce((sum, m) => sum + m.size, 0);
  const storagePercent = Math.round((usedStorage / totalStorage) * 100);

  const tabs: ViewTab<MediaTab>[] = [
    { id: 'all', label: t.media.all, icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { id: 'image', label: t.media.images, icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { id: 'video', label: t.media.videos, icon: <Film className="h-3.5 w-3.5" /> },
    { id: 'document', label: t.media.documents, icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'audio', label: t.media.audio, icon: <Music className="h-3.5 w-3.5" /> },
  ];

  return (
    <ViewShell>
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <ViewTabPanel>
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[oklch(0.55_0.18_250)] to-[oklch(0.65_0.18_250)]" />
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[oklch(0.55_0.18_250/0.1)] border border-[oklch(0.55_0.18_250/0.15)]">
                  <HardDrive className="h-4 w-4 text-[oklch(0.55_0.18_250)]" />
                </div>
                <span className="text-sm font-medium">{t.media.storageUsage}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(usedStorage)} / {formatFileSize(totalStorage)}
              </span>
            </div>
            <Progress value={storagePercent} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-[oklch(0.55_0.18_250)] [&>div]:to-[oklch(0.65_0.18_250)]" />
            <p className="text-xs text-muted-foreground mt-1.5">{storagePercent}% {t.media.storageUsage.toLowerCase()}</p>
          </CardContent>
        </Card>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300',
            isDragging
              ? 'border-[oklch(0.55_0.18_250)] bg-[oklch(0.55_0.18_250/0.05)] scale-[1.01]'
              : 'border-border/50 hover:border-[oklch(0.55_0.18_250/0.3)] hover:bg-muted/20'
          )}
        >
          <motion.div
            animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={cn('p-3 rounded-2xl transition-colors', isDragging ? 'bg-[oklch(0.55_0.18_250/0.15)]' : 'bg-muted/50')}>
              <CloudUpload className={cn('h-6 w-6', isDragging ? 'text-[oklch(0.55_0.18_250)]' : 'text-muted-foreground')} />
            </div>
            <p className="text-sm font-medium">{t.media.dropFilesHere}</p>
            <p className="text-xs text-muted-foreground">{t.media.orClick}</p>
          </motion.div>
        </div>

        <ViewToolbar
          actions={
            <BrandPrimaryButton>
              <Upload className="h-4 w-4" />
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

        {filtered.length === 0 ? (
          <Card className="overflow-hidden dark-card-glow">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50">
                <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">{t.media.noFiles}</p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`relative aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        {media.type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.thumbnailUrl || media.url}
                            alt={media.alt || media.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`p-3 rounded-2xl ${typeColor} border`}>
                            <Icon className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="secondary" className="h-7 w-7 p-0 rounded-full">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-7 w-7 p-0 rounded-full">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-7 w-7 p-0 rounded-full text-rose-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate" title={media.name}>{media.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className={`${typeColor} text-xs px-1.5 py-0 h-5`}>
                            {t.media[media.type as keyof typeof t.media] || media.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatFileSize(media.size)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5">
                          {new Date(media.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left font-semibold p-3">{t.media.fileName}</th>
                    <th className="text-left font-semibold p-3 hidden sm:table-cell">{t.media.fileType}</th>
                    <th className="text-left font-semibold p-3 hidden md:table-cell">{t.media.fileSize}</th>
                    <th className="text-left font-semibold p-3 hidden lg:table-cell">{t.media.modified}</th>
                    <th className="text-left font-semibold p-3 hidden lg:table-cell">{t.media.owner}</th>
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
                        className="group border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
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
                              <div className={`p-1.5 rounded-lg ${typeColor} border`}>
                                <Icon className="h-4 w-4" />
                              </div>
                            )}
                            <span className="font-medium truncate max-w-[200px]">{media.name}</span>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <Badge variant="outline" className={`${typeColor} text-sm px-1.5 py-0 h-5`}>
                            {t.media[media.type as keyof typeof t.media] || media.type}
                          </Badge>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                          {formatFileSize(media.size)}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                          {new Date(media.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-[oklch(0.55_0.18_250/0.1)] flex items-center justify-center text-xs font-semibold text-[oklch(0.55_0.18_250)]">
                              {getUserInitials(media.uploadedBy)}
                            </div>
                            <span className="text-xs text-muted-foreground">{getUserName(media.uploadedBy)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> {t.media.preview}</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2"><Download className="h-3.5 w-3.5" /> {t.media.download}</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2"><Copy className="h-3.5 w-3.5" /> {t.media.share}</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600"><Trash2 className="h-3.5 w-3.5" /> {t.common.delete}</DropdownMenuItem>
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
    </ViewShell>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Send,
  CalendarClock,
  Eye,
  CheckCircle,
  Mail,
  FileText,
  Megaphone,
  Zap,
  Clock,
  Radio,
  ChevronRight,
  Globe,
} from 'lucide-react';
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  mockChannels,
  getUserName,
  contentStatusColors,
  contentStatusLabels,
} from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTypeIcon(type: string) {
  switch (type) {
    case 'newsletter': return Mail;
    case 'article': return FileText;
    case 'announcement': return Megaphone;
    default: return FileText;
  }
}

function getChannelNames(channelIds: string[]): string[] {
  return channelIds.map(id => mockChannels.find(c => c.id === id)?.name || id);
}

function getChannelIcons(channelIds: string[]) {
  return channelIds.map(id => mockChannels.find(c => c.id === id)?.icon || '📡');
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function PublishingView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; content: ContentItem | null; action: 'publish' | 'schedule' }>({
    open: false,
    content: null,
    action: 'publish',
  });
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());

  // Approved content (ready to publish) for active tenant
  const approvedContent = useMemo(() => {
    const all: (ContentItem & { channelIds?: string[] })[] = [
      ...mockNewsletters.filter(n => n.status === 'approved' && n.tenantId === activeTenantId),
      ...mockArticles.filter(a => a.status === 'approved' && a.tenantId === activeTenantId),
      ...mockAnnouncements.filter(a => a.status === 'approved' && a.tenantId === activeTenantId),
    ];
    return all;
  }, [activeTenantId]);

  // Recently published content
  const recentlyPublished = useMemo(() => {
    const all: (ContentItem & { channelIds?: string[] })[] = [
      ...mockNewsletters.filter(n => n.status === 'published' && n.tenantId === activeTenantId),
      ...mockArticles.filter(a => a.status === 'published' && a.tenantId === activeTenantId),
      ...mockAnnouncements.filter(a => a.status === 'published' && a.tenantId === activeTenantId),
    ];
    return all
      .filter(c => c.publishedAt)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 5);
  }, [activeTenantId]);

  const statusLabel = (status: string) => {
    return contentStatusLabels.fr[status] || status;
  };

  const toggleBulkSelect = (id: string) => {
    setSelectedForBulk(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openConfirm = (content: ContentItem, action: 'publish' | 'schedule') => {
    setConfirmDialog({ open: true, content, action });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.publishing.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Publiez vos contenus approuvés vers les canaux de diffusion
          </p>
        </div>
        {approvedContent.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedForBulk.size > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-[oklch(0.55_0.15_160)] text-[oklch(0.55_0.15_160)]"
                onClick={() => {
                  // Bulk publish simulation
                  setSelectedForBulk(new Set());
                }}
              >
                <Zap className="h-3.5 w-3.5" />
                Publier {selectedForBulk.size} contenu{selectedForBulk.size > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ─── Approved Content ────────────────────────────────────────────── */}
      {approvedContent.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun contenu en attente de publication</p>
              <p className="text-xs text-muted-foreground">Les contenus approuvés apparaîtront ici</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {approvedContent.map((content, idx) => {
              const TypeIcon = getTypeIcon(content.type);
              const channels = 'channelIds' in content ? getChannelNames((content as any).channelIds || []) : [];
              const channelIcons = 'channelIds' in content ? getChannelIcons((content as any).channelIds || []) : [];
              const isSelected = selectedForBulk.has(content.id);

              return (
                <motion.div
                  key={content.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={cn(
                    'overflow-hidden border hover:shadow-md transition-all duration-200 group',
                    isSelected && 'ring-2 ring-[oklch(0.55_0.15_160)] border-[oklch(0.55_0.15_160)]',
                  )}>
                    {/* Top accent bar */}
                    <div className="h-1 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />
                    <CardContent className="p-4">
                      {/* Header row */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.15_160/0.15)] to-[oklch(0.55_0.15_160/0.05)] border border-[oklch(0.55_0.15_160/0.2)] flex items-center justify-center flex-shrink-0 cursor-pointer"
                          onClick={() => toggleBulkSelect(content.id)}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
                          ) : (
                            <TypeIcon className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate">{content.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                              {content.type}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">par {getUserName(content.authorId)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Channels */}
                      {channels.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-medium">{t.publishing.publishingTo}</p>
                          <div className="flex flex-wrap gap-1">
                            {channels.map((ch, i) => (
                              <Badge key={ch} variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                                <span>{channelIcons[i]}</span> {ch}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Excerpt */}
                      {content.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{content.excerpt}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] text-white h-8 text-xs"
                          onClick={() => openConfirm(content, 'publish')}
                        >
                          <Send className="h-3.5 w-3.5" /> {t.publishing.publishNow}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5 h-8 text-xs"
                          onClick={() => openConfirm(content, 'schedule')}
                        >
                          <CalendarClock className="h-3.5 w-3.5" /> {t.publishing.schedule}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Recently Published ──────────────────────────────────────────── */}
      {recentlyPublished.length > 0 && (
        <motion.div variants={item}>
          <Card className="overflow-hidden border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Récemment publiés</CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Derniers contenus publiés avec succès</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:bg-emerald-500/5">
                  Voir tout <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentlyPublished.map((content, idx) => {
                  const TypeIcon = getTypeIcon(content.type);
                  const statusColor = contentStatusColors[content.status] || contentStatusColors.published;
                  return (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{content.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{content.type}</span>
                          <span>•</span>
                          <span>{getUserName(content.authorId)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] text-muted-foreground">
                          {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                        </p>
                        <Badge className={cn('text-[9px] px-1.5 py-0 border-0', statusColor.bg, statusColor.text)}>
                          {statusLabel(content.status)}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Publish Confirmation Dialog ─────────────────────────────────── */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'publish' ? (
                <Send className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              ) : (
                <CalendarClock className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              )}
              {t.publishing.confirmPublish}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'publish'
                ? 'Ce contenu sera publié immédiatement sur les canaux sélectionnés.'
                : 'Ce contenu sera ajouté à la file de planification.'}
            </DialogDescription>
          </DialogHeader>
          {confirmDialog.content && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium">{confirmDialog.content.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                    {confirmDialog.content.type}
                  </Badge>
                  <span>par {getUserName(confirmDialog.content.authorId)}</span>
                </div>
              </div>
              {'channelIds' in confirmDialog.content && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t.publishing.publishingTo}</p>
                  <div className="flex flex-wrap gap-1">
                    {getChannelNames((confirmDialog.content as any).channelIds || []).map(ch => (
                      <Badge key={ch} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              {t.publishing.cancel}
            </Button>
            <Button
              className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] text-white"
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            >
              {confirmDialog.action === 'publish' ? (
                <>
                  <Send className="h-4 w-4" /> {t.publishing.publishNow}
                </>
              ) : (
                <>
                  <CalendarClock className="h-4 w-4" /> {t.publishing.schedule}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

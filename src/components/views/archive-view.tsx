'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Archive,
  Search,
  Mail,
  FileText,
  Megaphone,
  RotateCcw,
  Trash2,
  Calendar,
  ChevronDown,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  getUserName,
  getUserInitials,
} from '@/lib/mock-data';
import type { ContentItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

type CombinedContent = ContentItem & { contentType: 'newsletter' | 'article' | 'announcement' };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getContentTypeIcon(type: string) {
  switch (type) {
    case 'newsletter': return Mail;
    case 'article': return FileText;
    case 'announcement': return Megaphone;
    default: return FileText;
  }
}

function getContentTypeColor(type: string) {
  switch (type) {
    case 'newsletter': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'article': return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
    case 'announcement': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export function ArchiveView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Combine all content with status 'archived'
  const archived: CombinedContent[] = useMemo(() => {
    const newsletters = mockNewsletters
      .filter((n) => n.tenantId === activeTenantId && n.status === 'archived')
      .map((n) => ({ ...n, contentType: 'newsletter' as const }));
    const articles = mockArticles
      .filter((a) => a.tenantId === activeTenantId && a.status === 'archived')
      .map((a) => ({ ...a, contentType: 'article' as const }));
    const announcements = mockAnnouncements
      .filter((a) => a.tenantId === activeTenantId && a.status === 'archived')
      .map((a) => ({ ...a, contentType: 'announcement' as const }));
    return [...newsletters, ...articles, ...announcements];
  }, [activeTenantId]);

  const filtered = useMemo(() => {
    let result = archived;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.excerpt.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((c) => c.contentType === typeFilter);
    }

    return result;
  }, [archived, search, typeFilter]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                <Archive className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              </div>
              {t.archive.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {t.archive.title.toLowerCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.archive.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/30 border-border/50 focus:border-[oklch(0.55_0.15_160/0.5)] focus:ring-[oklch(0.55_0.15_160/0.1)]"
                />
              </div>

              {/* Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 border-border/50">
                    <Filter className="h-3.5 w-3.5" />
                    {typeFilter === 'all' ? t.archive.originalType : t.nav[typeFilter as keyof typeof t.nav] || typeFilter}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>{t.archive.originalType}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('newsletter')}>{t.nav.newsletters}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('article')}>{t.nav.articles}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('announcement')}>{t.nav.announcements}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Archive List */}
      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50">
                <Archive className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">{t.archive.noResults}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((content, idx) => {
              const Icon = getContentTypeIcon(content.contentType);
              const typeColor = getContentTypeColor(content.contentType);
              return (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  whileHover={{ x: 4, scale: 1.005 }}
                >
                  <Card className="border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Type icon */}
                        <div className={`p-2.5 rounded-xl ${typeColor} border flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm truncate">{content.title}</h3>
                            <Badge variant="outline" className={`${typeColor} text-[10px] px-1.5 py-0 h-5 flex-shrink-0`}>
                              {t.nav[content.contentType as keyof typeof t.nav] || content.contentType}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{content.excerpt}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {t.archive.archivedDate}: {new Date(content.updatedAt).toLocaleDateString(
                                locale === 'fr' ? 'fr-FR' : 'en-US',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="h-4 w-4 rounded-full bg-muted/50 flex items-center justify-center text-[8px] font-semibold">
                                {getUserInitials(content.authorId)}
                              </div>
                              {getUserName(content.authorId)}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 border-[oklch(0.55_0.15_160/0.3)] text-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160/0.1)] hover:text-[oklch(0.55_0.15_160)]"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t.archive.restore}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t.archive.delete}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Danger Zone Warning */}
          <motion.div variants={item}>
            <Card className="border-2 border-rose-500/20 bg-rose-500/[0.02] overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-400" />
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                      {locale === 'fr' ? 'Zone de danger' : 'Danger Zone'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {locale === 'fr'
                        ? 'La suppression permanente est irréversible. Les contenus supprimés ne pourront pas être récupérés.'
                        : 'Permanent deletion is irreversible. Deleted content cannot be recovered.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

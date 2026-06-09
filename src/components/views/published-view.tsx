'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  Search,
  Mail,
  FileText,
  Megaphone,
  Eye,
  TrendingUp,
  Calendar,
  ArrowUpDown,
  BarChart3,
  Users,
  SortAsc,
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

function getEngagementRate(content: CombinedContent): number {
  if (content.type === 'newsletter') {
    return content.openRate || 0;
  }
  if (content.type === 'article') {
    const article = content as ContentItem & { likeCount: number; commentCount: number; shareCount: number; viewCount: number };
    return article.viewCount > 0 ? Math.round(((article.likeCount + article.commentCount + article.shareCount) / article.viewCount) * 100) : 0;
  }
  if (content.type === 'announcement') {
    const ann = content as ContentItem & { acknowledgedCount: number; totalRecipients: number };
    return ann.totalRecipients > 0 ? Math.round((ann.acknowledgedCount / ann.totalRecipients) * 100) : 0;
  }
  return 0;
}

export function PublishedView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'engagement'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Combine all content with status 'published'
  const published: CombinedContent[] = useMemo(() => {
    const newsletters = mockNewsletters
      .filter((n) => n.tenantId === activeTenantId && n.status === 'published')
      .map((n) => ({ ...n, contentType: 'newsletter' as const }));
    const articles = mockArticles
      .filter((a) => a.tenantId === activeTenantId && a.status === 'published')
      .map((a) => ({ ...a, contentType: 'article' as const }));
    const announcements = mockAnnouncements
      .filter((a) => a.tenantId === activeTenantId && a.status === 'published')
      .map((a) => ({ ...a, contentType: 'announcement' as const }));
    return [...newsletters, ...articles, ...announcements];
  }, [activeTenantId]);

  const filtered = useMemo(() => {
    let result = published;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.excerpt.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        const aDate = a.publishedAt || a.updatedAt;
        const bDate = b.publishedAt || b.updatedAt;
        cmp = new Date(bDate).getTime() - new Date(aDate).getTime();
      } else if (sortBy === 'views') {
        cmp = b.viewCount - a.viewCount;
      } else {
        cmp = getEngagementRate(b) - getEngagementRate(a);
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [published, search, sortBy, sortAsc]);

  // Stats
  const totalViews = published.reduce((sum, c) => sum + c.viewCount, 0);
  const avgEngagement = published.length > 0
    ? Math.round(published.reduce((sum, c) => sum + getEngagementRate(c), 0) / published.length)
    : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                <CheckCircle className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              </div>
              {t.published.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {t.published.title.toLowerCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: t.published.title,
              value: published.length,
              icon: CheckCircle,
              gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
              iconBg: 'bg-emerald-500/15',
              iconColor: 'text-emerald-600',
              borderAccent: 'border-emerald-500/20',
            },
            {
              label: t.published.viewCount,
              value: totalViews.toLocaleString(),
              icon: Eye,
              gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
              iconBg: 'bg-teal-500/15',
              iconColor: 'text-teal-600',
              borderAccent: 'border-teal-500/20',
            },
            {
              label: t.published.engagement,
              value: `${avgEngagement}%`,
              icon: TrendingUp,
              gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
              iconBg: 'bg-amber-500/15',
              iconColor: 'text-amber-600',
              borderAccent: 'border-amber-500/20',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`} />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-extrabold tracking-tight mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-2xl ${stat.iconBg} border border-white/10`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                  placeholder={t.published.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/30 border-border/50 focus:border-[oklch(0.55_0.15_160/0.5)] focus:ring-[oklch(0.55_0.15_160/0.1)]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/50"
                onClick={() => { setSortBy(sortBy === 'date' ? 'views' : sortBy === 'views' ? 'engagement' : 'date'); setSortAsc(!sortAsc); }}
              >
                <SortAsc className="h-3.5 w-3.5" />
                {sortBy === 'date' ? t.published.publishedDate : sortBy === 'views' ? t.published.viewCount : t.published.engagement}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Table */}
      <motion.div variants={item}>
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold">Titre</TableHead>
                  <TableHead className="font-semibold">{t.published.publishedDate}</TableHead>
                  <TableHead className="font-semibold">{t.published.viewCount}</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">{t.published.engagement}</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">{t.newsletters.author}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50">
                          <CheckCircle className="h-7 w-7 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground text-sm">{t.published.noResults}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((content, idx) => {
                    const Icon = getContentTypeIcon(content.contentType);
                    const engagement = getEngagementRate(content);
                    return (
                      <TableRow key={content.id} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${getContentTypeColor(content.contentType)} border`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[220px]">{content.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{content.excerpt}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(content.publishedAt || content.updatedAt).toLocaleDateString(
                              locale === 'fr' ? 'fr-FR' : 'en-US',
                              { day: 'numeric', month: 'short', year: 'numeric' }
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-sm">{content.viewCount.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)] rounded-full"
                                style={{ width: `${Math.min(engagement, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{engagement}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[oklch(0.55_0.15_160/0.1)] flex items-center justify-center text-[10px] font-semibold text-[oklch(0.55_0.15_160)]">
                              {getUserInitials(content.authorId)}
                            </div>
                            <span className="text-sm text-muted-foreground">{getUserName(content.authorId)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

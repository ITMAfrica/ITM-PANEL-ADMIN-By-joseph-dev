'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileText,
  Plus,
  Search,
  LayoutGrid,
  List,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { mockArticles, getUserName, getUserInitials, contentStatusColors, contentStatusLabels } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation Variants ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ─── Status & Category Filters ───────────────────────────────────────────────
const statusTabs = ['all', 'draft', 'review', 'approved', 'scheduled', 'published'] as const;
type StatusTab = typeof statusTabs[number];

// ─── Main Component ──────────────────────────────────────────────────────────
export function ArticlesView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter articles by tenant
  const tenantArticles = useMemo(
    () => mockArticles.filter((ar) => ar.tenantId === activeTenantId),
    [activeTenantId]
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(tenantArticles.map((ar) => ar.category)));
    return ['all', ...cats];
  }, [tenantArticles]);

  // Filter by status, category, and search
  const filteredArticles = useMemo(() => {
    let result = tenantArticles;
    if (activeStatus !== 'all') {
      result = result.filter((ar) => ar.status === activeStatus);
    }
    if (activeCategory !== 'all') {
      result = result.filter((ar) => ar.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ar) =>
          ar.title.toLowerCase().includes(q) ||
          ar.excerpt.toLowerCase().includes(q) ||
          getUserName(ar.authorId).toLowerCase().includes(q)
      );
    }
    return result;
  }, [tenantArticles, activeStatus, activeCategory, searchQuery]);

  // Stats
  const totalArticles = tenantArticles.length;
  const publishedCount = tenantArticles.filter((ar) => ar.status === 'published').length;
  const avgReadingTime = tenantArticles.length > 0
    ? Math.round(tenantArticles.reduce((sum, ar) => sum + ar.readingTime, 0) / tenantArticles.length)
    : 0;
  const totalEngagement = tenantArticles.reduce((sum, ar) => sum + ar.likeCount + ar.commentCount + ar.shareCount, 0);

  const statusLabel = (status: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return contentStatusLabels[locale]?.[status] || status;
  };

  const getStatusTabLabel = (tab: StatusTab): string => {
    if (tab === 'all') return t.articles.all;
    return statusLabel(tab);
  };

  const stats = [
    {
      title: t.articles.title,
      value: totalArticles,
      icon: FileText,
      gradient: 'from-[oklch(0.55_0.15_160/0.1)] via-[oklch(0.55_0.15_160/0.05)] to-transparent',
      iconBg: 'bg-[oklch(0.55_0.15_160/0.15)]',
      iconColor: 'text-[oklch(0.55_0.15_160)]',
      borderAccent: 'border-[oklch(0.55_0.15_160/0.2)]',
    },
    {
      title: t.articles.published,
      value: publishedCount,
      icon: CheckCircle,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.articles.readingTime,
      value: `${avgReadingTime} min`,
      icon: Clock,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
    {
      title: 'Engagement',
      value: totalEngagement,
      icon: TrendingUp,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
    },
  ];

  const categoryColorMap: Record<string, string> = {
    'Stratégie': 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    'Guide': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Finance': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Conformité': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'Événement': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    'Produit': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.articles.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalArticles} {t.articles.title.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 transition-colors',
                viewMode === 'grid' ? 'bg-[oklch(0.55_0.15_160)] text-white' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 transition-colors',
                viewMode === 'list' ? 'bg-[oklch(0.55_0.15_160)] text-white' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
          >
            <Plus className="h-4 w-4" />
            {t.articles.newArticle}
          </Button>
        </div>
      </div>

      {/* ─── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="relative group">
                <Card className={cn('relative overflow-hidden border shadow-md hover:shadow-lg transition-shadow duration-300', stat.borderAccent)}>
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity duration-500', stat.gradient)} />
                  <CardContent className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                      </div>
                      <div className={cn('p-2 rounded-xl border border-white/10 shadow-sm', stat.iconBg)}>
                        <IconComp className={cn('h-4 w-4', stat.iconColor)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Search & Filters ───────────────────────────────────────────── */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.articles.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatus(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                activeStatus === tab
                  ? 'bg-[oklch(0.55_0.15_160)] text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {getStatusTabLabel(tab)}
            </button>
          ))}
          <span className="text-muted-foreground/30 mx-1">|</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-[oklch(0.55_0.15_160)] text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {cat === 'all' ? t.articles.all : cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Articles Grid/List ──────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t.articles.noResults}</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredArticles.map((article, idx) => {
              const statusColor = contentStatusColors[article.status];
              const authorName = getUserName(article.authorId);
              const authorInitials = getUserInitials(article.authorId);
              const catColor = categoryColorMap[article.category] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
              return (
                <motion.div key={article.id} variants={item}>
                  <motion.div variants={cardHover} initial="rest" whileHover="hover">
                    <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      {/* Category strip */}
                      <div className="h-1 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border', catColor)}>
                            {article.category}
                          </Badge>
                          <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border', statusColor.bg, statusColor.text, statusColor.border)}>
                            {statusLabel(article.status)}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold mb-1 group-hover:text-[oklch(0.55_0.15_160)] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                          {article.excerpt}
                        </p>
                        {/* Metrics */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{article.likeCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{article.commentCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            <span>{article.shareCount}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" />
                            <span>{article.readingTime} min</span>
                          </div>
                        </div>
                        {/* Author */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[9px] bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] font-medium">
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{authorName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredArticles.map((article, idx) => {
              const statusColor = contentStatusColors[article.status];
              const authorName = getUserName(article.authorId);
              const authorInitials = getUserInitials(article.authorId);
              const catColor = categoryColorMap[article.category] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                >
                  <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)] flex-shrink-0">
                        <FileText className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold truncate group-hover:text-[oklch(0.55_0.15_160)] transition-colors">
                            {article.title}
                          </h3>
                          <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border', catColor)}>
                            {article.category}
                          </Badge>
                          <Badge className={cn('text-[10px] px-2 py-0.5 font-medium border', statusColor.bg, statusColor.text, statusColor.border)}>
                            {statusLabel(article.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingTime} min</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{article.likeCount}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{article.commentCount}</span>
                          <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{article.shareCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[9px] bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] font-medium">
                            {authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground hidden lg:inline">{authorName}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

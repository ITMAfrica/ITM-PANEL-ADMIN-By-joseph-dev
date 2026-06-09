'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  Plus,
  Search,
  Eye,
  Send,
  Copy,
  Trash2,
  MoreHorizontal,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
import { mockNewsletters, mockUsers, getUserName, getUserInitials, contentStatusColors, contentStatusLabels } from '@/lib/mock-data';
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
  hover: { scale: 1.01, y: -2, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ─── Status Tabs ──────────────────────────────────────────────────────────────
const statusTabs = ['all', 'draft', 'review', 'approved', 'scheduled', 'published', 'archived'] as const;
type StatusTab = typeof statusTabs[number];

// ─── Main Component ──────────────────────────────────────────────────────────
export function NewslettersView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');

  // Filter newsletters by tenant
  const tenantNewsletters = useMemo(
    () => mockNewsletters.filter((nl) => nl.tenantId === activeTenantId),
    [activeTenantId]
  );

  // Filter by status and search
  const filteredNewsletters = useMemo(() => {
    let result = tenantNewsletters;
    if (activeStatus !== 'all') {
      result = result.filter((nl) => nl.status === activeStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (nl) =>
          nl.title.toLowerCase().includes(q) ||
          nl.subject.toLowerCase().includes(q) ||
          getUserName(nl.authorId).toLowerCase().includes(q)
      );
    }
    return result;
  }, [tenantNewsletters, activeStatus, searchQuery]);

  // Stats
  const totalNewsletters = tenantNewsletters.length;
  const publishedCount = tenantNewsletters.filter((nl) => nl.status === 'published').length;
  const avgOpenRate = tenantNewsletters.filter((nl) => nl.openRate > 0).length > 0
    ? Math.round(tenantNewsletters.filter((nl) => nl.openRate > 0).reduce((sum, nl) => sum + nl.openRate, 0) / tenantNewsletters.filter((nl) => nl.openRate > 0).length * 10) / 10
    : 0;
  const pendingReviews = tenantNewsletters.filter((nl) => nl.status === 'review').length;

  const statusLabel = (status: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return contentStatusLabels[locale]?.[status] || status;
  };

  const getStatusTabLabel = (tab: StatusTab): string => {
    if (tab === 'all') return t.newsletters.all;
    return statusLabel(tab);
  };

  const stats = [
    {
      title: t.newsletters.title,
      value: totalNewsletters,
      icon: Mail,
      gradient: 'from-[oklch(0.55_0.15_160/0.1)] via-[oklch(0.55_0.15_160/0.05)] to-transparent',
      iconBg: 'bg-[oklch(0.55_0.15_160/0.15)]',
      iconColor: 'text-[oklch(0.55_0.15_160)]',
      borderAccent: 'border-[oklch(0.55_0.15_160/0.2)]',
    },
    {
      title: t.newsletters.published,
      value: publishedCount,
      icon: CheckCircle,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.newsletters.openRate,
      value: `${avgOpenRate}%`,
      icon: TrendingUp,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
    {
      title: t.newsletters.review,
      value: pendingReviews,
      icon: Clock,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
    },
  ];

  const formatDate = (dateStr: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.newsletters.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalNewsletters} {t.newsletters.title.toLowerCase()}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Plus className="h-4 w-4" />
          {t.newsletters.newNewsletter}
        </Button>
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

      {/* ─── Search & Filter ────────────────────────────────────────────── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.newsletters.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatus(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200',
                activeStatus === tab
                  ? 'bg-[oklch(0.55_0.15_160)] text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {getStatusTabLabel(tab)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Newsletter List ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNewsletters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
                <Mail className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t.newsletters.noResults}</p>
            </motion.div>
          ) : (
            filteredNewsletters.map((newsletter, idx) => {
              const statusColor = contentStatusColors[newsletter.status];
              const authorName = getUserName(newsletter.authorId);
              const authorInitials = getUserInitials(newsletter.authorId);
              return (
                <motion.div
                  key={newsletter.id}
                  variants={item}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                >
                  <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Left: Icon + Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)] flex-shrink-0">
                            <Mail className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold truncate group-hover:text-[oklch(0.55_0.15_160)] transition-colors">
                                {newsletter.title}
                              </h3>
                              <Badge
                                className={cn(
                                  'text-[10px] px-2 py-0.5 gap-1 font-medium border',
                                  statusColor.bg,
                                  statusColor.text,
                                  statusColor.border
                                )}
                              >
                                {statusLabel(newsletter.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {newsletter.subject}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Metrics */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground sm:ml-auto">
                          <div className="flex items-center gap-1.5" title={t.newsletters.recipients}>
                            <Users className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{newsletter.recipientCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title={t.newsletters.openRate}>
                            <Eye className="h-3.5 w-3.5" />
                            <span className={cn('font-medium', newsletter.openRate > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
                              {newsletter.openRate > 0 ? `${newsletter.openRate}%` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5" title={t.newsletters.clickRate}>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className={cn('font-medium', newsletter.clickRate > 0 ? 'text-amber-600' : 'text-muted-foreground')}>
                              {newsletter.clickRate > 0 ? `${newsletter.clickRate}%` : '—'}
                            </span>
                          </div>
                          {newsletter.scheduledAt && (
                            <div className="flex items-center gap-1.5" title={t.newsletters.lastModified}>
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatDate(newsletter.scheduledAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Author + Actions */}
                        <div className="flex items-center gap-2 sm:ml-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] font-medium">
                                {authorInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground hidden lg:inline">{authorName}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" />
                                {t.newsletters.preview}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Send className="h-4 w-4" />
                                {t.newsletters.sendTest}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Copy className="h-4 w-4" />
                                {t.newsletters.duplicate}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-500/10">
                                <Trash2 className="h-4 w-4" />
                                {t.newsletters.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

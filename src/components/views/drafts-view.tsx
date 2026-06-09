'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FilePen,
  Search,
  Mail,
  FileText,
  Megaphone,
  Clock,
  PenLine,
  Trash2,
  SortAsc,
  ChevronDown,
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
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getRelativeTime(dateStr: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'fr') {
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

export function DraftsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'modified' | 'title'>('modified');
  const [sortAsc, setSortAsc] = useState(false);

  // Combine all content with status 'draft'
  const drafts: CombinedContent[] = useMemo(() => {
    const newsletters = mockNewsletters
      .filter((n) => n.tenantId === activeTenantId && n.status === 'draft')
      .map((n) => ({ ...n, contentType: 'newsletter' as const }));
    const articles = mockArticles
      .filter((a) => a.tenantId === activeTenantId && a.status === 'draft')
      .map((a) => ({ ...a, contentType: 'article' as const }));
    const announcements = mockAnnouncements
      .filter((a) => a.tenantId === activeTenantId && a.status === 'draft')
      .map((a) => ({ ...a, contentType: 'announcement' as const }));
    return [...newsletters, ...articles, ...announcements];
  }, [activeTenantId]);

  const filtered = useMemo(() => {
    let result = drafts;

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
      if (sortBy === 'modified') {
        cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        cmp = a.title.localeCompare(b.title);
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [drafts, search, sortBy, sortAsc]);

  // Stats
  const today = new Date();
  const updatedToday = drafts.filter((d) => {
    const dDate = new Date(d.updatedAt);
    return dDate.toDateString() === today.toDateString();
  }).length;

  const avgDraftAge = drafts.length > 0
    ? Math.round(
        drafts.reduce((sum, d) => {
          const created = new Date(d.createdAt);
          const diffDays = Math.floor((today.getTime() - created.getTime()) / 86400000);
          return sum + diffDays;
        }, 0) / drafts.length
      )
    : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                <FilePen className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              </div>
              {t.drafts.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {t.drafts.title.toLowerCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item}>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: t.drafts.title,
              value: drafts.length,
              gradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
              iconBg: 'bg-slate-500/15',
              iconColor: 'text-slate-600',
              borderAccent: 'border-slate-500/20',
            },
            {
              label: locale === 'fr' ? 'Mis à jour aujourd\'hui' : 'Updated today',
              value: updatedToday,
              gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
              iconBg: 'bg-emerald-500/15',
              iconColor: 'text-emerald-600',
              borderAccent: 'border-emerald-500/20',
            },
            {
              label: locale === 'fr' ? 'Âge moyen (jours)' : 'Avg age (days)',
              value: avgDraftAge,
              gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
              iconBg: 'bg-amber-500/15',
              iconColor: 'text-amber-600',
              borderAccent: 'border-amber-500/20',
            },
          ].map((stat, i) => (
            <Card key={i} className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`} />
              <CardContent className="relative p-4">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-extrabold tracking-tight mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
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
                  placeholder={t.drafts.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/30 border-border/50 focus:border-[oklch(0.55_0.15_160/0.5)] focus:ring-[oklch(0.55_0.15_160/0.1)]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/50"
                onClick={() => { setSortBy(sortBy === 'modified' ? 'title' : 'modified'); setSortAsc(!sortAsc); }}
              >
                <SortAsc className="h-3.5 w-3.5" />
                {sortBy === 'modified' ? t.drafts.lastModified : 'Titre'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Drafts Card Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50">
                <FilePen className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">{t.drafts.noResults}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((draft, idx) => {
              const Icon = getContentTypeIcon(draft.contentType);
              const typeColor = getContentTypeColor(draft.contentType);
              return (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all">
                    {/* Left accent strip */}
                    <div className="h-1 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`${typeColor} text-[10px] px-1.5 py-0 h-5`}>
                              <Icon className="h-3 w-3 mr-1" />
                              {t.nav[draft.contentType as keyof typeof t.nav] || draft.contentType}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-1">{draft.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{draft.excerpt}</p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[oklch(0.55_0.15_160/0.1)] flex items-center justify-center text-[10px] font-semibold text-[oklch(0.55_0.15_160)]">
                            {getUserInitials(draft.authorId)}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium">{getUserName(draft.authorId)}</p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              {getRelativeTime(draft.updatedAt, locale)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160/0.9)] text-white text-xs h-8"
                          size="sm"
                        >
                          <PenLine className="h-3.5 w-3.5 mr-1" />
                          {t.drafts.continueWriting}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
    </motion.div>
  );
}

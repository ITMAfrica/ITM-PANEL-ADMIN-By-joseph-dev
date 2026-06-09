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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Search,
  Filter,
  SortAsc,
  Mail,
  FileText,
  Megaphone,
  MoreHorizontal,
  Edit3,
  Eye,
  Archive,
  Trash2,
  ChevronDown,
  Calendar,
  Tag,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import {
  mockNewsletters,
  mockArticles,
  mockAnnouncements,
  getUserName,
  getUserInitials,
  contentStatusColors,
  contentStatusLabels,
} from '@/lib/mock-data';
import type { ContentItem } from '@/lib/types';
import { motion } from 'framer-motion';

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

export function LibraryView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const locale = useAppStore((s) => s.locale);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Combine all content types
  const allContent: CombinedContent[] = useMemo(() => {
    const newsletters = mockNewsletters
      .filter((n) => n.tenantId === activeTenantId)
      .map((n) => ({ ...n, contentType: 'newsletter' as const }));
    const articles = mockArticles
      .filter((a) => a.tenantId === activeTenantId)
      .map((a) => ({ ...a, contentType: 'article' as const }));
    const announcements = mockAnnouncements
      .filter((a) => a.tenantId === activeTenantId)
      .map((a) => ({ ...a, contentType: 'announcement' as const }));
    return [...newsletters, ...articles, ...announcements];
  }, [activeTenantId]);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = allContent;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.excerpt.toLowerCase().includes(q) ||
          c.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((c) => c.contentType === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = a.status.localeCompare(b.status);
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [allContent, search, typeFilter, statusFilter, sortBy, sortAsc]);

  const statusLabels = contentStatusLabels[locale] || contentStatusLabels.fr;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                <BookOpen className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              </div>
              {t.library.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {t.library.allContent.toLowerCase()}
            </p>
          </div>
          <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160/0.9)] text-white shadow-md hover:shadow-lg transition-all">
            <FileText className="h-4 w-4 mr-1.5" />
            {t.common.create}
          </Button>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div variants={item}>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.library.search}
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
                    {typeFilter === 'all' ? t.library.allContent : t.nav[typeFilter as keyof typeof t.nav] || typeFilter}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>{t.library.allContent}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('newsletter')}>{t.nav.newsletters}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('article')}>{t.nav.articles}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('announcement')}>{t.nav.announcements}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 border-border/50">
                    <Tag className="h-3.5 w-3.5" />
                    {statusFilter === 'all' ? t.newsletters.status : statusLabels[statusFilter] || statusFilter}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>{t.library.allContent}</DropdownMenuItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>{label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 border-border/50">
                    <SortAsc className="h-3.5 w-3.5" />
                    {sortBy === 'date' ? t.newsletters.lastModified : sortBy === 'title' ? 'Titre' : t.newsletters.status}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortBy('date'); setSortAsc(!sortAsc); }}>{t.newsletters.lastModified}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('title'); setSortAsc(!sortAsc); }}>Titre</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('status'); setSortAsc(!sortAsc); }}>{t.newsletters.status}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <TableHead className="font-semibold">{t.newsletters.status}</TableHead>
                  <TableHead className="font-semibold">{t.newsletters.author}</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">{t.newsletters.lastModified}</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Tags</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50">
                          <BookOpen className="h-7 w-7 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground text-sm">{t.library.noResults}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((content) => {
                    const Icon = getContentTypeIcon(content.contentType);
                    const colors = contentStatusColors[content.status] || contentStatusColors.draft;
                    return (
                      <TableRow key={content.id} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${getContentTypeColor(content.contentType)} border`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[250px]">{content.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[250px]">{content.excerpt}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} text-[11px] font-medium`}>
                            {statusLabels[content.status] || content.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[oklch(0.55_0.15_160/0.1)] flex items-center justify-center text-[10px] font-semibold text-[oklch(0.55_0.15_160)]">
                              {getUserInitials(content.authorId)}
                            </div>
                            <span className="text-sm text-muted-foreground hidden sm:inline">{getUserName(content.authorId)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(content.updatedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-1 flex-wrap">
                            {content.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50">
                                {tag}
                              </Badge>
                            ))}
                            {content.tags.length > 2 && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50">
                                +{content.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem className="gap-2"><Edit3 className="h-3.5 w-3.5" /> {t.common.edit}</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> {t.common.view}</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2"><Archive className="h-3.5 w-3.5" /> {t.archive.title}</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600"><Trash2 className="h-3.5 w-3.5" /> {t.common.delete}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LayoutTemplate,
  Search,
  Users,
  Sparkles,
  Mail,
  FileText,
  Megaphone,
  Newspaper,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { mockTemplates } from '@/lib/mock-data';
import type { ContentType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getTemplateTypeIcon(type: string) {
  switch (type) {
    case 'newsletter': return Mail;
    case 'article': return FileText;
    case 'announcement': return Megaphone;
    case 'communique': return Newspaper;
    default: return LayoutTemplate;
  }
}

function getTemplateTypeColor(type: string) {
  switch (type) {
    case 'newsletter': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'article': return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
    case 'announcement': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'communique': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export function TemplatesView() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = mockTemplates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (tp) =>
          tp.name.toLowerCase().includes(q) ||
          tp.description.toLowerCase().includes(q) ||
          tp.category.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((tp) => tp.type === typeFilter);
    }
    return result;
  }, [search, typeFilter]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)]">
                <LayoutTemplate className="h-5 w-5 text-[oklch(0.55_0.15_160)]" />
              </div>
              {t.templates.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} {t.templates.all.toLowerCase()} {t.templates.title.toLowerCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div variants={item}>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.templates.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/30 border-border/50 focus:border-[oklch(0.55_0.15_160/0.5)] focus:ring-[oklch(0.55_0.15_160/0.1)]"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'newsletter', 'article', 'announcement', 'communique'].map((type) => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(type)}
                    className={
                      typeFilter === type
                        ? 'bg-[oklch(0.55_0.15_160)] text-white hover:bg-[oklch(0.55_0.15_160/0.9)]'
                        : 'border-border/50'
                    }
                  >
                    {type === 'all'
                      ? t.templates.all
                      : t.templates[type as keyof typeof t.templates] || type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50">
                <LayoutTemplate className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">{t.templates.noResults}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((template, idx) => {
              const Icon = getTemplateTypeIcon(template.type);
              const typeColor = getTemplateTypeColor(template.type);
              return (
                <motion.div
                  key={template.id}
                  variants={item}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-all ${
                    template.isPremium
                      ? 'border-[oklch(0.55_0.15_160/0.3)] ring-1 ring-[oklch(0.55_0.15_160/0.1)]'
                      : 'border-border/50'
                  }`}>
                    {/* Premium top strip */}
                    {template.isPremium && (
                      <div className="h-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)]" />
                    )}

                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        {/* Emoji thumbnail */}
                        <div className={`text-3xl p-3 rounded-2xl bg-muted/30 border border-border/30 flex-shrink-0 ${
                          template.isPremium ? 'bg-[oklch(0.55_0.15_160/0.08)] border-[oklch(0.55_0.15_160/0.15)]' : ''
                        }`}>
                          {template.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                            {template.isPremium && (
                              <Badge className="bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)] text-white text-[10px] px-1.5 py-0 h-5 border-0">
                                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                {t.templates.premium}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                        </div>
                      </div>

                      {/* Type badge + Usage count */}
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="outline" className={`${typeColor} text-[11px] px-2 py-0.5 h-6`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {t.templates[template.type as keyof typeof t.templates] || template.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {template.usageCount} {template.usageCount > 1 ? 'usages' : 'usage'}
                        </div>
                      </div>

                      {/* Use Template Button */}
                      <Button
                        className={`w-full mt-4 ${
                          template.isPremium
                            ? 'bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.65_0.16_160)] text-white shadow-md hover:shadow-lg'
                            : 'bg-muted/50 hover:bg-[oklch(0.55_0.15_160/0.1)] hover:text-[oklch(0.55_0.15_160)] text-foreground border border-border/50'
                        }`}
                        variant={template.isPremium ? 'default' : 'outline'}
                      >
                        {template.isPremium && <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                        {t.templates.useTemplate}
                      </Button>
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

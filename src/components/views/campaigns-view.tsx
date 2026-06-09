'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Plus,
  Search,
  Calendar,
  Eye,
  TrendingUp,
  ArrowUpRight,
  Radio,
  Users,
  Pause,
  CheckCircle2,
  FileEdit,
  Clock,
} from 'lucide-react';
import { mockCampaigns, mockChannels } from '@/lib/mock-data';
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

// ─── Campaign Status Config ──────────────────────────────────────────────────
const campaignStatusConfig: Record<string, {
  bg: string;
  text: string;
  border: string;
  dot: string;
  icon: React.ElementType;
}> = {
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20', dot: 'bg-slate-400', icon: FileEdit },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500', icon: Radio },
  paused: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', dot: 'bg-amber-500', icon: Pause },
  completed: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20', dot: 'bg-cyan-500', icon: CheckCircle2 },
};

// ─── Status Filters ──────────────────────────────────────────────────────────
const statusTabs = ['all', 'draft', 'active', 'paused', 'completed'] as const;
type StatusTab = typeof statusTabs[number];

// ─── Main Component ──────────────────────────────────────────────────────────
export function CampaignsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');

  // Filter campaigns by tenant
  const tenantCampaigns = useMemo(
    () => mockCampaigns.filter((cp) => cp.tenantId === activeTenantId),
    [activeTenantId]
  );

  // Filter by status and search
  const filteredCampaigns = useMemo(() => {
    let result = tenantCampaigns;
    if (activeStatus !== 'all') {
      result = result.filter((cp) => cp.status === activeStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (cp) =>
          cp.name.toLowerCase().includes(q) ||
          cp.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tenantCampaigns, activeStatus, searchQuery]);

  // Stats
  const totalCampaigns = tenantCampaigns.length;
  const activeCampaigns = tenantCampaigns.filter((cp) => cp.status === 'active').length;
  const totalReach = tenantCampaigns.reduce((sum, cp) => sum + cp.totalReach, 0);
  const campaignsWitData = tenantCampaigns.filter((cp) => cp.avgOpenRate > 0);
  const avgEngagement = campaignsWitData.length > 0
    ? Math.round(campaignsWitData.reduce((sum, cp) => sum + cp.avgClickRate, 0) / campaignsWitData.length * 10) / 10
    : 0;

  const getCampaignStatusLabel = (status: string): string => {
    switch (status) {
      case 'draft': return t.campaigns.draft;
      case 'active': return t.campaigns.active;
      case 'paused': return t.campaigns.paused;
      case 'completed': return t.campaigns.completed;
      default: return status;
    }
  };

  const getStatusTabLabel = (tab: StatusTab): string => {
    if (tab === 'all') return t.campaigns.all;
    return getCampaignStatusLabel(tab);
  };

  const formatDate = (dateStr: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getChannelName = (channelId: string) => {
    return mockChannels.find((ch) => ch.id === channelId)?.name || channelId;
  };

  const formatReach = (reach: number): string => {
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}k`;
    return reach.toString();
  };

  const stats = [
    {
      title: t.campaigns.title,
      value: totalCampaigns,
      icon: Target,
      gradient: 'from-[oklch(0.55_0.15_160/0.1)] via-[oklch(0.55_0.15_160/0.05)] to-transparent',
      iconBg: 'bg-[oklch(0.55_0.15_160/0.15)]',
      iconColor: 'text-[oklch(0.55_0.15_160)]',
      borderAccent: 'border-[oklch(0.55_0.15_160/0.2)]',
    },
    {
      title: t.campaigns.active,
      value: activeCampaigns,
      icon: Radio,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.campaigns.reach,
      value: formatReach(totalReach),
      icon: Users,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
    {
      title: 'Engagement',
      value: `${avgEngagement}%`,
      icon: TrendingUp,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.campaigns.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCampaigns} {t.campaigns.title.toLowerCase()}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Plus className="h-4 w-4" />
          {t.campaigns.newCampaign}
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
            placeholder={t.campaigns.search}
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

      {/* ─── Campaign Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCampaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 col-span-full"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
                <Target className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t.campaigns.noResults}</p>
            </motion.div>
          ) : (
            filteredCampaigns.map((campaign, idx) => {
              const statusConf = campaignStatusConfig[campaign.status] || campaignStatusConfig.draft;
              const StatusIcon = statusConf.icon;
              const progressPercent = campaign.contentCount > 0
                ? Math.round((campaign.publishedCount / campaign.contentCount) * 100)
                : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                >
                  <motion.div variants={cardHover} initial="rest" whileHover="hover">
                    <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      {/* Color strip */}
                      <div className="h-1.5" style={{ backgroundColor: campaign.color }} />
                      <CardContent className="p-4 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm"
                              style={{ backgroundColor: campaign.color + '20', color: campaign.color }}
                            >
                              <Target className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold truncate group-hover:text-[oklch(0.55_0.15_160)] transition-colors">
                                {campaign.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">{campaign.description}</p>
                            </div>
                          </div>
                          <Badge className={cn('text-[10px] px-2 py-0.5 gap-1 font-medium border flex-shrink-0', statusConf.bg, statusConf.text, statusConf.border)}>
                            <div className={cn('w-1.5 h-1.5 rounded-full', statusConf.dot)} />
                            {getCampaignStatusLabel(campaign.status)}
                          </Badge>
                        </div>

                        {/* Date range */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">
                              {campaign.publishedCount}/{campaign.contentCount} contenus
                            </span>
                            <span className="font-semibold" style={{ color: campaign.color }}>{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${campaign.color}, ${campaign.color}cc)` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                            <span className="text-[10px] text-muted-foreground">{t.campaigns.reach}</span>
                            <span className="text-sm font-bold">{formatReach(campaign.totalReach)}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                            <span className="text-[10px] text-muted-foreground">{t.campaigns.openRate}</span>
                            <span className="text-sm font-bold">{campaign.avgOpenRate > 0 ? `${campaign.avgOpenRate}%` : '—'}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                            <span className="text-[10px] text-muted-foreground">{t.campaigns.clickRate}</span>
                            <span className="text-sm font-bold">{campaign.avgClickRate > 0 ? `${campaign.avgClickRate}%` : '—'}</span>
                          </div>
                        </div>

                        {/* Channels */}
                        <div className="flex items-center gap-1.5 mt-auto flex-wrap">
                          {campaign.channels.slice(0, 3).map((channelId) => {
                            const channel = mockChannels.find((ch) => ch.id === channelId);
                            return channel ? (
                              <span
                                key={channelId}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50"
                              >
                                {channel.icon} {channel.name.split(' - ')[0]}
                              </span>
                            ) : null;
                          })}
                          {campaign.channels.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{campaign.channels.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

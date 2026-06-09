'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Radio,
  Mail,
  Globe,
  Building2,
  Smartphone,
  Bell,
  MessageSquare,
  Search,
  Settings,
  Users,
  Send,
  Clock,
  Filter,
} from 'lucide-react';
import { mockChannels } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import type { DistributionChannel } from '@/lib/types';
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

// ─── Channel type config ────────────────────────────────────────────────────
const channelTypeConfig: Record<string, { icon: typeof Mail; color: string; bg: string; label: string }> = {
  email: { icon: Mail, color: 'text-teal-600', bg: 'bg-teal-500/10', label: 'E-mail' },
  web: { icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Web' },
  intranet: { icon: Building2, color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Intranet' },
  social: { icon: Smartphone, color: 'text-rose-600', bg: 'bg-rose-500/10', label: 'Réseaux sociaux' },
  push: { icon: Bell, color: 'text-cyan-600', bg: 'bg-cyan-500/10', label: 'Push' },
  sms: { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'SMS' },
};

const channelTypes = ['all', 'email', 'web', 'intranet', 'social', 'push', 'sms'] as const;

// ─── Main Component ──────────────────────────────────────────────────────────
export function ChannelsView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [channelStates, setChannelStates] = useState<Record<string, boolean>>(
    Object.fromEntries(mockChannels.map(c => [c.id, c.isActive]))
  );

  // Filter channels
  const filteredChannels = useMemo(() => {
    return mockChannels.filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || ch.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  // Stats
  const totalChannels = mockChannels.length;
  const activeChannels = Object.values(channelStates).filter(Boolean).length;
  const totalSubscribers = mockChannels.reduce((sum, ch) => sum + ch.subscriberCount, 0);

  const toggleChannel = (id: string) => {
    setChannelStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatLastSent = (dateStr?: string) => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Il y a moins d\'une heure';
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hier';
    return `Il y a ${days}j`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.distributionChannels.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configurez et gérez vos canaux de diffusion
          </p>
        </div>
      </div>

      {/* ─── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total canaux',
            value: totalChannels,
            icon: Radio,
            color: 'text-[oklch(0.55_0.15_160)]',
            bg: 'bg-[oklch(0.55_0.15_160/0.1)]',
            border: 'border-[oklch(0.55_0.15_160/0.2)]',
          },
          {
            label: 'Canaux actifs',
            value: activeChannels,
            icon: Send,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Total abonnés',
            value: totalSubscribers.toLocaleString('fr-FR'),
            icon: Users,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <Card className={cn('overflow-hidden border', stat.border)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Search & Filter ─────────────────────────────────────────────── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un canal..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {channelTypes.map(type => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 text-xs whitespace-nowrap',
                filterType === type && 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.50_0.15_165)] text-white',
              )}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'Tous' : channelTypeConfig[type]?.label || type}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* ─── Channel Cards ───────────────────────────────────────────────── */}
      {filteredChannels.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Radio className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t.distributionChannels.noChannels}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredChannels.map((channel, idx) => {
              const config = channelTypeConfig[channel.type] || channelTypeConfig.email;
              const TypeIcon = config.icon;
              const isActive = channelStates[channel.id];

              return (
                <motion.div
                  key={channel.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={cn(
                    'overflow-hidden border hover:shadow-md transition-all duration-200 group',
                    !isActive && 'opacity-60',
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {/* Channel icon */}
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center text-lg border',
                          config.bg,
                          isActive ? 'border-border/50' : 'border-border/20',
                        )}>
                          {channel.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate">{channel.name}</h3>
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-1', config.color)}>
                            <TypeIcon className="h-2.5 w-2.5 mr-0.5" />
                            {config.label}
                          </Badge>
                        </div>
                        {/* Toggle */}
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleChannel(channel.id)}
                          className="data-[state=checked]:bg-[oklch(0.55_0.15_160)]"
                        />
                      </div>

                      <div className="space-y-2 pt-3 border-t border-border/50">
                        {/* Subscribers */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {t.distributionChannels.subscribers}
                          </span>
                          <span className="font-medium">{channel.subscriberCount.toLocaleString('fr-FR')}</span>
                        </div>
                        {/* Last sent */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t.distributionChannels.lastSent}
                          </span>
                          <span className="font-medium">{formatLastSent(channel.lastSentAt)}</span>
                        </div>
                        {/* Status indicator */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Statut</span>
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            )} />
                            <span className={cn('font-medium', isActive ? 'text-emerald-600' : 'text-slate-500')}>
                              {isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Configure button */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 h-8 text-xs">
                          <Settings className="h-3 w-3" /> Configurer
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

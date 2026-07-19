'use client';

import { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { useSubscriberCount } from '@/hooks/use-content';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewStatGrid,
  ViewStatCard,
  type ViewTab,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableCheckboxHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableCheckboxCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

const channelTypeConfig: Record<string, { color: string; label: string }> = {
  email: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'E-mail' },
  web: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Web' },
  intranet: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Intranet' },
  social: { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', label: 'Réseaux sociaux' },
  push: { color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', label: 'Push' },
  sms: { color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', label: 'SMS' },
};

const statusColors = {
  active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

type ChannelTab = 'all' | 'email' | 'web' | 'intranet' | 'social' | 'push' | 'sms';

const EMPTY_ARRAY: never[] = [];

export function ChannelsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: channels = EMPTY_ARRAY } = useDistributionChannels(activeTenantId);
  const { data: liveSubscriberCount } = useSubscriberCount(activeTenantId);
  const [activeTab, setActiveTab] = useState<ChannelTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelOverrides, setChannelOverrides] = useState<Record<string, boolean>>({});
  const [selectedAll, setSelectedAll] = useState(false);

  const channelStates = useMemo(() => {
    const base = Object.fromEntries(channels.map((c) => [c.id, c.isActive]));
    return { ...base, ...channelOverrides };
  }, [channels, channelOverrides]);

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeTab === 'all' || ch.type === activeTab;
      return matchesSearch && matchesType;
    });
  }, [channels, searchQuery, activeTab]);

  const totalChannels = channels.length;
  const activeChannels = Object.values(channelStates).filter(Boolean).length;
  const totalSubscribers =
    liveSubscriberCount ?? channels.reduce((sum, ch) => sum + ch.subscriberCount, 0);

  const toggleChannel = (id: string) => {
    setChannelOverrides((prev) => ({ ...prev, [id]: !channelStates[id] }));
  };

  const formatLastSent = (dateStr?: string) => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Il y a moins d'une heure";
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hier';
    return `Il y a ${days}j`;
  };

  const tabs: ViewTab<ChannelTab>[] = [
    { id: 'all', label: 'Tous' },
    ...(['email', 'web', 'intranet', 'social', 'push', 'sms'] as const).map((type) => ({
      id: type,
      label: channelTypeConfig[type]?.label || type,
    })),
  ];

  return (
    <ViewShell>
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <ViewTabPanel>
        <ViewStatGrid cols={3}>
          <ViewStatCard label="Total canaux" value={totalChannels} />
          <ViewStatCard label="Canaux actifs" value={activeChannels} />
          <ViewStatCard
            label="Total abonnés"
            value={totalSubscribers.toLocaleString('fr-FR')}
          />
        </ViewStatGrid>

        <ViewToolbar>
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un canal..."
          />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">Type</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.distributionChannels.subscribers}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.distributionChannels.lastSent}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
            <ViewDataTableHead className="w-16">Actif</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredChannels.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={7}
                message={t.distributionChannels.noChannels}
                illustrationId="channels"
              />
            ) : (
              filteredChannels.map((channel) => {
                const config = channelTypeConfig[channel.type] || channelTypeConfig.email;
                const isActive = channelStates[channel.id];
                return (
                  <ViewDataTableRow key={channel.id} className={cn(!isActive && 'opacity-60')}>
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{channel.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {channel.icon} {config.label}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell">
                      <ViewStatusText label={config.label} className={config.color} />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {channel.subscriberCount.toLocaleString('fr-FR')}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {formatLastSent(channel.lastSentAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={isActive ? 'Actif' : 'Inactif'}
                        className={isActive ? statusColors.active : statusColors.inactive}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleChannel(channel.id)}
                          className="data-[state=checked]:bg-[oklch(0.55_0.18_250)]"
                        />
                      </div>
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>
      </ViewTabPanel>
    </ViewShell>
  );
}

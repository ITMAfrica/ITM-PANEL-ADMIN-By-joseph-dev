'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  BrandPrimaryButton,
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

const campaignStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
  active: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  paused: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  completed: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20' },
};

const statusTabs = ['all', 'draft', 'active', 'paused', 'completed'] as const;
type StatusTab = typeof statusTabs[number];

export function CampaignsView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: tenantCampaigns = [] } = useCampaigns(activeTenantId);
  const { data: channels = [] } = useDistributionChannels(activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [selectedAll, setSelectedAll] = useState(false);

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

  const navTabs = useMemo(
    () => statusTabs.map((tab) => ({ id: tab, label: getStatusTabLabel(tab) })),
    [t]
  );

  const formatDate = (dateStr: string) => {
    const locale = useAppStore.getState().locale as 'fr' | 'en';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatReach = (reach: number): string => {
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}k`;
    return reach.toString();
  };

  const getChannelNames = (channelIds: string[]): string => {
    const names = channelIds
      .map((id) => channels.find((ch) => ch.id === id)?.name.split(' - ')[0])
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '—';
  };

  return (
    <ViewShell>
      <ViewSubNav tabs={navTabs} activeTab={activeStatus} onTabChange={setActiveStatus} />
      <ViewTabPanel>
        <ViewToolbar
          actions={
            <BrandPrimaryButton>
              <Plus className="h-4 w-4" />
              {t.campaigns.newCampaign}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.campaigns.search}
          />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">
              {t.editorialCalendar.columns.date}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.campaigns.reach}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.campaigns.openRate}
            </ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.editorialCalendar.columns.networks}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredCampaigns.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={7}
                message={t.campaigns.noResults}
                illustrationId="compose-social"
              />
            ) : (
              filteredCampaigns.map((campaign) => {
                const statusColor = campaignStatusColors[campaign.status] || campaignStatusColors.draft;
                const progressPercent = campaign.contentCount > 0
                  ? Math.round((campaign.publishedCount / campaign.contentCount) * 100)
                  : 0;
                return (
                  <ViewDataTableRow key={campaign.id}>
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {campaign.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {campaign.publishedCount}/{campaign.contentCount} · {progressPercent}%
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatReach(campaign.totalReach)}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {campaign.avgOpenRate > 0 ? `${campaign.avgOpenRate}%` : '—'}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs truncate max-w-[160px]">
                      {getChannelNames(campaign.channels)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={getCampaignStatusLabel(campaign.status)}
                        className={cn(
                          statusColor.bg,
                          statusColor.text,
                          statusColor.border
                        )}
                      />
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

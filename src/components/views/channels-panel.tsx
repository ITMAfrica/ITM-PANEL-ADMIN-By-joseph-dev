'use client';

import { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { useDistributionChannels, useUpdateDistributionChannel, useCreateDistributionChannel } from '@/hooks/use-distribution-channels';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChannelSubscribersDrawer } from '@/components/channel-subscribers-drawer';
import type { DistributionChannel } from '@/lib/types';
import {
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewStatGrid,
  ViewStatCard,
} from '@/components/view-layout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

const EMPTY_ARRAY: never[] = [];

export function ChannelsPanel() {
  const { t, locale } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: channels = EMPTY_ARRAY } = useDistributionChannels(activeTenantId);
  const updateChannel = useUpdateDistributionChannel();
  const createChannel = useCreateDistributionChannel();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('email');
  const [newIcon, setNewIcon] = useState('mail');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [detailChannel, setDetailChannel] = useState<DistributionChannel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) =>
      ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const totalChannels = channels.length;
  const activeChannels = channels.filter((c) => c.isActive).length;
  const totalSubscribers = channels.reduce((sum, ch) => sum + ch.subscriberCount, 0);

  const toggleChannel = (id: string, isActive: boolean) => {
    updateChannel.mutate({ id, data: { isActive: !isActive } });
  };

  const handleCreate = () => {
    if (!newName.trim() || !activeTenantId) return;
    createChannel.mutate(
      { name: newName.trim(), type: newType, icon: newIcon, tenantId: activeTenantId },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setNewName('');
          setNewType('email');
          setNewIcon('mail');
          toast.success(locale === 'fr' ? 'Canal créé' : 'Channel created');
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : locale === 'fr'
                ? 'Échec de la création du canal'
                : 'Failed to create channel'
          );
        },
      }
    );
  };

  const formatLastSent = (dateStr?: string) => {
    if (!dateStr) return locale === 'fr' ? 'Jamais' : 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return locale === 'fr' ? "Il y a moins d'une heure" : 'Less than an hour ago';
    if (hours < 24) return locale === 'fr' ? `Il y a ${hours}h` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return locale === 'fr' ? 'Hier' : 'Yesterday';
    return locale === 'fr' ? `Il y a ${days}j` : `${days}d ago`;
  };

  return (
    <ViewTabPanel>
      <ViewStatGrid cols={3}>
        <ViewStatCard label={t.dashboard.metrics.totalChannels} value={totalChannels} />
        <ViewStatCard label={t.dashboard.metrics.activeChannels} value={activeChannels} />
        <ViewStatCard
          label={t.dashboard.metrics.subscribers}
          value={totalSubscribers.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}
        />
      </ViewStatGrid>

      <ViewToolbar
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-9 gap-2"
                style={{ backgroundColor: '#1D141F', color: '#E2F343' }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'fr' ? 'Nouveau canal' : 'New Channel'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle className="text-[#1D141F]">
                  {locale === 'fr' ? 'Créer un canal de diffusion' : 'Create Distribution Channel'}
                </DialogTitle>
                <DialogDescription>
                  {locale === 'fr'
                    ? 'Un canal représente une liste de diffusion. Il pourra être connecté à vos sites web.'
                    : 'A channel represents a mailing list. It can be connected to your websites.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1D141F]">
                    {locale === 'fr' ? 'Nom du canal' : 'Channel Name'}
                  </Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={locale === 'fr' ? 'Ex: Newsletter ITM' : 'Ex: ITM Newsletter'}
                    className="h-10 rounded-lg border-[#E8ECEF] bg-white"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1D141F]">Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="h-10 w-full rounded-lg border-[#E8ECEF] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="intranet">Intranet</SelectItem>
                      <SelectItem value="social">{locale === 'fr' ? 'Réseaux sociaux' : 'Social'}</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1D141F]">
                    {locale === 'fr' ? 'Icône (optionnel)' : 'Icon (optional)'}
                  </Label>
                  <Input
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="mail"
                    className="h-10 rounded-lg border-[#E8ECEF] bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="h-9 border-[#E8ECEF] bg-white text-sm">
                  {locale === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim() || createChannel.isPending}
                  className="h-9 gap-2 text-sm"
                  style={{ backgroundColor: '#1D141F', color: '#E2F343' }}
                >
                  {createChannel.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {locale === 'fr' ? 'Créer' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <ViewSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={locale === 'fr' ? 'Rechercher un canal...' : 'Search channels...'}
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
          <ViewDataTableHead className="w-16">
            {locale === 'fr' ? 'Actif' : 'Active'}
          </ViewDataTableHead>
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
              const isActive = channel.isActive;
              return (
                <ViewDataTableRow
                  key={channel.id}
                  className={cn(!isActive && 'opacity-60', 'cursor-pointer')}
                  onClick={() => {
                    setDetailChannel(channel);
                    setDrawerOpen(true);
                  }}
                >
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
                    {channel.subscriberCount.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                  </ViewDataTableCell>
                  <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                    {formatLastSent(channel.lastSentAt)}
                  </ViewDataTableCell>
                  <ViewDataTableCell>
                    <ViewStatusText
                      label={isActive ? (locale === 'fr' ? 'Actif' : 'Active') : (locale === 'fr' ? 'Inactif' : 'Inactive')}
                      className={isActive ? statusColors.active : statusColors.inactive}
                    />
                  </ViewDataTableCell>
                  <ViewDataTableCell>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleChannel(channel.id, isActive)}
                        disabled={updateChannel.isPending}
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

      <ChannelSubscribersDrawer
        channel={detailChannel}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </ViewTabPanel>
  );
}

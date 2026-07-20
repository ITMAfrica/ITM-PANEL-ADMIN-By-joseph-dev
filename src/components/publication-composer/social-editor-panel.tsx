'use client';

import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { FacebookIcon } from '@/components/social/facebook-icon';
import { FACEBOOK_CHAR_LIMIT } from '@/lib/publication-composer';
import type { DistributionChannel } from '@/lib/types';
import { ComposerContentEditor } from './composer-content-editor';

interface SocialEditorPanelProps {
  text: string;
  onTextChange: (value: string) => void;
  /** Canaux de type 'social' actifs (Pages Facebook connectées). */
  channels: DistributionChannel[];
  selectedChannelIds: string[];
  onToggleChannel: (channelId: string) => void;
}

export function SocialEditorPanel({
  text,
  onTextChange,
  channels,
  selectedChannelIds,
  onToggleChannel,
}: SocialEditorPanelProps) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const setActivePage = useAppStore((s) => s.setActivePage);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#E8ECEF] bg-[#F5F7F9] px-2 py-1.5">
          <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
          <Select defaultValue="publication">
            <SelectTrigger className="h-7 w-auto min-w-[120px] border-0 bg-transparent px-1 text-xs font-semibold uppercase tracking-wide shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publication">{pc.publication}</SelectItem>
              <SelectItem value="story">{pc.story}</SelectItem>
              <SelectItem value="reel">{pc.reel}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-[#E8ECEF] bg-white"
          title={pc.addPlatform}
          onClick={() => setActivePage('settings')}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {channels.length === 0 ? (
        <p className="mb-4 text-xs text-muted-foreground">{pc.noConnectedPages}</p>
      ) : (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{pc.publishTo}:</span>
          {channels.map((channel) => {
            const selected = selectedChannelIds.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => onToggleChannel(channel.id)}
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? 'border-[#1877F2] bg-[#1877F2]/10 text-[#1877F2]'
                    : 'border-[#E8ECEF] bg-white text-muted-foreground hover:bg-muted/40'
                )}
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                {channel.name}
                {selected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}

      <ComposerContentEditor
        value={text}
        onChange={onTextChange}
        placeholder={pc.placeholderSocial}
        charLimit={FACEBOOK_CHAR_LIMIT}
        counterIcon={<FacebookIcon className="h-3.5 w-3.5 text-[#1877F2]" />}
      />
    </div>
  );
}

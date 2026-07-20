'use client';

import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useUsers } from '@/hooks/use-users';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import type { PublicationComposerType } from '@/lib/publication-composer';
import { publicationTypes, ANNOUNCEMENT_TYPES } from '@/lib/publication-composer';
import { ComposerContentEditor } from './composer-content-editor';
import type { TemplatePlaceholders } from './newsletter-template-picker';
import type { ReactNode } from 'react';

export interface CmsFormState {
  title: string;
  body: string;
  authorId: string;
  tags: string[];
  tagInput: string;
  selectedChannels: string[];
  emailSubject: string;
  urgency: 'info' | 'warning' | 'critical';
  category: string;
}

interface CmsEditorFieldsProps {
  type: PublicationComposerType;
  form: CmsFormState;
  onChange: <K extends keyof CmsFormState>(key: K, value: CmsFormState[K]) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  onToggleChannel: (channelId: string) => void;
  placeholders?: Partial<TemplatePlaceholders>;
  sectionsEditor?: ReactNode;
}

const ARTICLE_CATEGORIES = ['Stratégie', 'Guide', 'Finance', 'Conformité', 'Événement', 'Produit'];

export function CmsEditorFields({
  type,
  form,
  onChange,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  onToggleChannel,
  placeholders,
  sectionsEditor,
}: CmsEditorFieldsProps) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: users = [] } = useUsers(activeTenantId);
  const { data: channels = [] } = useDistributionChannels(activeTenantId);
  const typeConfig = publicationTypes.find((item) => item.type === type);
  const TypeIcon = typeConfig?.icon;
  const selectedChannelItems = channels.filter((channel) =>
    form.selectedChannels.includes(channel.id)
  );
  const channelsTriggerLabel =
    selectedChannelItems.length === 0
      ? '—'
      : selectedChannelItems.length === 1
        ? selectedChannelItems[0].name
        : `${selectedChannelItems[0].name} +${selectedChannelItems.length - 1}`;

  const ph = {
    title: placeholders?.title ?? cc.titlePlaceholder,
    emailSubject: placeholders?.emailSubject ?? pc.emailSubjectPlaceholder,
    body: placeholders?.body ?? pc.bodyPlaceholder,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="composer-title" className="text-sm font-medium text-[#1D141F]">
            {cc.titleLabel}
          </Label>
          <Input
            id="composer-title"
            placeholder={ph.title}
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="h-10 border-[#E8ECEF] bg-[#FAFBFC] text-sm focus:border-[oklch(0.55_0.18_250)]"
          />
        </div>

        {type === 'newsletter' && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="composer-email-subject" className="text-sm font-medium text-[#1D141F]">
              {pc.emailSubjectLabel}
            </Label>
            <Input
              id="composer-email-subject"
              placeholder={ph.emailSubject}
              value={form.emailSubject}
              onChange={(e) => onChange('emailSubject', e.target.value)}
              className="h-10 border-[#E8ECEF] bg-[#FAFBFC] text-sm"
            />
          </div>
        )}

        {type === 'announcement' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1D141F]">{pc.urgencyLabel}</Label>
            <Select value={form.urgency} onValueChange={(v) => onChange('urgency', v as CmsFormState['urgency'])}>
              <SelectTrigger className="h-10 border-[#E8ECEF] bg-[#FAFBFC] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{pc.urgencyInfo}</SelectItem>
                <SelectItem value="warning">{pc.urgencyWarning}</SelectItem>
                <SelectItem value="critical">{pc.urgencyCritical}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {type === 'announcement' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1D141F]">{pc.announcementTypeLabel}</Label>
            <Select value={form.category} onValueChange={(v) => onChange('category', v)}>
              <SelectTrigger className="h-10 border-[#E8ECEF] bg-[#FAFBFC] text-sm">
                <SelectValue placeholder={pc.announcementTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {ANNOUNCEMENT_TYPES.map((announcementType) => (
                  <SelectItem key={announcementType.id} value={announcementType.id}>
                    {pc.announcementTypes[announcementType.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {type === 'article' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1D141F]">{pc.categoryLabel}</Label>
            <Select value={form.category} onValueChange={(v) => onChange('category', v)}>
              <SelectTrigger className="h-10 border-[#E8ECEF] bg-[#FAFBFC] text-sm">
                <SelectValue placeholder={pc.categoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor="composer-body" className="text-sm font-medium text-[#1D141F]">
          {pc.bodyLabel}
        </Label>
        {sectionsEditor ?? (
          <ComposerContentEditor
            id="composer-body"
            value={form.body}
            onChange={(value) => onChange('body', value)}
            placeholder={ph.body}
            counterIcon={
              TypeIcon ? (
                <TypeIcon className={cn('h-3.5 w-3.5', typeConfig?.color)} />
              ) : undefined
            }
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#E8ECEF] pt-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#8B939E]">{cc.authorLabel}</span>
          <Select value={form.authorId} onValueChange={(v) => onChange('authorId', v)}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] border-transparent bg-[#F0F2F5] px-2 text-xs hover:bg-[#E8ECEF]">
              <SelectValue placeholder={cc.unassigned} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.18_250)] to-[oklch(0.55_0.15_160)] text-xs font-bold text-white">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#8B939E]">{cc.tagsLabel}</span>
          <div className="flex min-h-[28px] flex-wrap items-center gap-1 rounded-md bg-[#F0F2F5] px-1.5 py-0.5 focus-within:ring-2 focus-within:ring-[oklch(0.55_0.18_250)]/20">
            <AnimatePresence mode="popLayout">
              {form.tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Badge
                    variant="secondary"
                    className="gap-1 border-[oklch(0.55_0.18_250/0.2)] bg-[oklch(0.55_0.18_250/0.1)] px-1.5 py-0 text-xs text-[oklch(0.55_0.18_250)]"
                  >
                    {tag}
                    <button type="button" onClick={() => onRemoveTag(tag)} className="hover:text-rose-500">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            <input
              type="text"
              value={form.tagInput}
              onChange={(e) => onChange('tagInput', e.target.value)}
              onKeyDown={onTagKeyDown}
              placeholder={form.tags.length === 0 ? cc.tagsPlaceholder : ''}
              className="w-[90px] border-0 bg-transparent text-xs outline-none placeholder:text-[#8B939E]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#8B939E]">{cc.channelsLabel}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-7 w-auto min-w-[140px] max-w-[220px] items-center justify-between gap-1.5 rounded-md border-transparent bg-[#F0F2F5] px-2 text-xs font-medium text-[#1D141F] hover:bg-[#E8ECEF]"
              >
                <span className="truncate">{channelsTriggerLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8B939E]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              {channels.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-[#8B939E]">—</div>
              ) : (
                channels.map((channel) => (
                  <DropdownMenuCheckboxItem
                    key={channel.id}
                    checked={form.selectedChannels.includes(channel.id)}
                    onCheckedChange={() => onToggleChannel(channel.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span className="mr-1.5 text-sm leading-none">{channel.icon}</span>
                    <span>{channel.name}</span>
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

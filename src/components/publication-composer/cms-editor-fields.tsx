'use client';

import { Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useUsers } from '@/hooks/use-users';
import { useDistributionChannels } from '@/hooks/use-distribution-channels';
import type { PublicationComposerType } from '@/lib/publication-composer';
import { publicationTypes } from '@/lib/publication-composer';
import { ComposerTypeBar } from './composer-type-bar';
import { ComposerContentEditor } from './composer-content-editor';

export interface CmsFormState {
  title: string;
  summary: string;
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
}: CmsEditorFieldsProps) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: users = [] } = useUsers(activeTenantId);
  const { data: channels = [] } = useDistributionChannels(activeTenantId);
  const typeConfig = publicationTypes.find((item) => item.type === type);
  const TypeIcon = typeConfig?.icon;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ComposerTypeBar type={type} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="composer-title" className="text-sm font-medium text-[#1D141F]">
            {cc.titleLabel}
          </Label>
          <Input
            id="composer-title"
            placeholder={cc.titlePlaceholder}
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
              placeholder={pc.emailSubjectPlaceholder}
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="composer-summary" className="text-sm font-medium text-[#1D141F]">
            {cc.summaryLabel}
          </Label>
          <Textarea
            id="composer-summary"
            value={form.summary}
            onChange={(e) => onChange('summary', e.target.value)}
            placeholder={cc.summaryPlaceholder}
            className="min-h-[100px] resize-none border-[#E8ECEF] bg-[#FAFBFC] px-4 py-3 text-sm leading-relaxed focus-visible:border-[oklch(0.55_0.18_250)] sm:min-h-[120px]"
          />
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor="composer-body" className="text-sm font-medium text-[#1D141F]">
          {pc.bodyLabel}
        </Label>
        <ComposerContentEditor
          id="composer-body"
          value={form.body}
          onChange={(value) => onChange('body', value)}
          placeholder={pc.bodyPlaceholder}
          counterIcon={
            TypeIcon ? (
              <TypeIcon className={cn('h-3.5 w-3.5', typeConfig?.color)} />
            ) : undefined
          }
        />
      </div>

      <div className="space-y-4 border-t border-[#E8ECEF] pt-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#1D141F]">{cc.authorLabel}</Label>
          <Select value={form.authorId} onValueChange={(v) => onChange('authorId', v)}>
            <SelectTrigger className="h-10 border-[#E8ECEF] bg-[#FAFBFC] text-sm">
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#1D141F]">{cc.tagsLabel}</Label>
          <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-[#E8ECEF] bg-[#FAFBFC] p-2 focus-within:border-[oklch(0.55_0.18_250)] focus-within:ring-2 focus-within:ring-[oklch(0.55_0.18_250)]/20">
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
                    className="gap-1 border-[oklch(0.55_0.18_250/0.2)] bg-[oklch(0.55_0.18_250/0.1)] px-2 py-0.5 text-xs text-[oklch(0.55_0.18_250)]"
                  >
                    {tag}
                    <button type="button" onClick={() => onRemoveTag(tag)} className="ml-0.5 hover:text-rose-500">
                      <X className="h-3 w-3" />
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
              className="min-w-[120px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#8B939E]"
            />
            {form.tagInput.trim() && (
              <button
                type="button"
                onClick={onAddTag}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.55_0.18_250/0.15)] hover:bg-[oklch(0.55_0.18_250/0.25)]"
              >
                <Plus className="h-3 w-3 text-[oklch(0.55_0.18_250)]" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#1D141F]">{cc.channelsLabel}</Label>
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => {
              const isSelected = form.selectedChannels.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onToggleChannel(channel.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    isSelected
                      ? 'border-[oklch(0.55_0.18_250/0.3)] bg-[oklch(0.55_0.18_250/0.1)] text-[oklch(0.55_0.18_250)]'
                      : 'border-[#E8ECEF] bg-[#FAFBFC] text-[#5C6470] hover:bg-[#EEF1F4]'
                  )}
                >
                  <span className="text-sm">{channel.icon}</span>
                  <span>{channel.name}</span>
                  {isSelected && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

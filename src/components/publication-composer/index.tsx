'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import {
  DEFAULT_PUBLICATION_COMPOSER_TYPE,
  FACEBOOK_CHAR_LIMIT,
  getPageForType,
  isCmsType,
  isComposerScheduledAtValid,
  parseComposerScheduledAt,
  type PublicationComposerPayload,
  type PublicationComposerType,
} from '@/lib/publication-composer';
import { getComposerDisplayLength, stripMediaMarkdown, extractMediaAttachments } from '@/lib/media-insert';
import { TypeSelector } from './type-selector';
import { CmsEditorFields, type CmsFormState } from './cms-editor-fields';
import { SocialEditorPanel } from './social-editor-panel';
import { PreviewPanels } from './preview-panels';
import { ComposerFooter } from './composer-footer';
import { ComposerCloseButton } from './composer-close-button';
import { useCreateContent } from '@/hooks/use-content';

const DEFAULT_PROFILE_NAME = 'Agriculture 243';

const emptyCmsForm = (): CmsFormState => ({
  title: '',
  summary: '',
  body: '',
  authorId: '',
  tags: [],
  tagInput: '',
  selectedChannels: [],
  emailSubject: '',
  urgency: 'info',
  category: '',
});

interface CreatePublicationComposerProps {
  overlay?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialType?: PublicationComposerType;
  /** ISO-8601 string — stable across parent rerenders (unlike Date objects). */
  initialScheduledAtIso?: string;
}

export function CreatePublicationComposer({
  overlay = false,
  open = true,
  onOpenChange,
  initialType,
  initialScheduledAtIso,
}: CreatePublicationComposerProps) {
  const { t, locale } = useTranslation();
  const pc = t.publicationComposer;
  const currentUser = useAppStore((s) => s.currentUser);
  const tenants = useAppStore((s) => s.tenants);
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);

  const activeTenant = tenants.find((tenant) => tenant.id === activeTenantId);
  const profileName = activeTenant?.name || currentUser?.tenantName || DEFAULT_PROFILE_NAME;

  const [selectedType, setSelectedType] = useState<PublicationComposerType>(
    initialType ?? DEFAULT_PUBLICATION_COMPOSER_TYPE
  );
  const [socialText, setSocialText] = useState('');
  const [cmsForm, setCmsForm] = useState<CmsFormState>(emptyCmsForm);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [scheduledAt, setScheduledAtState] = useState(() =>
    parseComposerScheduledAt(initialScheduledAtIso)
  );
  const setScheduledAt = useCallback((date: Date) => {
    if (isComposerScheduledAtValid(date)) setScheduledAtState(date);
  }, []);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const wasOpenRef = useRef(false);

  const resetForm = useCallback(() => {
    setSelectedType(initialType ?? DEFAULT_PUBLICATION_COMPOSER_TYPE);
    setSocialText('');
    setCmsForm(emptyCmsForm());
    setPreviewMode('mobile');
    setScheduledAtState(parseComposerScheduledAt(initialScheduledAtIso));
    setCalendarOpen(false);
  }, [initialType, initialScheduledAtIso]);

  // Apply store-driven defaults only when the overlay opens (not on every parent rerender).
  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!justOpened) return;

    if (initialType) setSelectedType(initialType);
    if (initialScheduledAtIso) setScheduledAtState(parseComposerScheduledAt(initialScheduledAtIso));
  }, [open, initialType, initialScheduledAtIso]);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
    resetForm();
  }, [onOpenChange, resetForm]);

  const updateCmsForm = useCallback(<K extends keyof CmsFormState>(key: K, value: CmsFormState[K]) => {
    setCmsForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = cmsForm.tagInput.trim();
    if (trimmed && !cmsForm.tags.includes(trimmed) && cmsForm.tags.length < 10) {
      setCmsForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed], tagInput: '' }));
    }
  }, [cmsForm.tagInput, cmsForm.tags]);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      } else if (e.key === 'Backspace' && !cmsForm.tagInput && cmsForm.tags.length > 0) {
        setCmsForm((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
      }
    },
    [handleAddTag, cmsForm.tagInput, cmsForm.tags.length]
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setCmsForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
  }, []);

  const handleToggleChannel = useCallback((channelId: string) => {
    setCmsForm((prev) => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(channelId)
        ? prev.selectedChannels.filter((id) => id !== channelId)
        : [...prev.selectedChannels, channelId],
    }));
  }, []);

  const buildPayload = useCallback((): PublicationComposerPayload => {
    const metadata: Record<string, unknown> = {};

    if (isCmsType(selectedType)) {
      if (selectedType === 'newsletter') metadata.emailSubject = cmsForm.emailSubject;
      if (selectedType === 'announcement') metadata.urgency = cmsForm.urgency;
      if (selectedType === 'article') metadata.category = cmsForm.category;
    }

    return {
      type: selectedType,
      title: isCmsType(selectedType) ? cmsForm.title : profileName,
      summary: isCmsType(selectedType) ? cmsForm.summary : '',
      body: isCmsType(selectedType) ? cmsForm.body : socialText,
      authorId: cmsForm.authorId,
      tags: cmsForm.tags,
      channels: cmsForm.selectedChannels,
      scheduledAt,
      metadata,
    };
  }, [selectedType, cmsForm, socialText, scheduledAt, profileName]);

  const validate = useCallback((): boolean => {
    if (selectedType === 'social') {
      if (getComposerDisplayLength(socialText) > FACEBOOK_CHAR_LIMIT) {
        toast.error(pc.charLimitError);
        return false;
      }
      if (!stripMediaMarkdown(socialText).trim() && extractMediaAttachments(socialText).length === 0) {
        toast.error(pc.contentRequired);
        return false;
      }
      return true;
    }

    if (!cmsForm.title.trim()) {
      toast.error(pc.titleRequired);
      return false;
    }
    return true;
  }, [selectedType, socialText, cmsForm.title, pc]);

  const createContentMutation = useCreateContent();

  const handleSubmit = useCallback(
    async (mode: 'now' | 'scheduled' | 'draft') => {
      if (!validate()) return;

      const payload = buildPayload();
      const dateLocale = locale === 'fr' ? fr : enUS;
      const formattedSchedule = format(
        scheduledAt,
        locale === 'fr' ? 'd MMMM yyyy HH:mm' : 'MMMM d, yyyy HH:mm',
        { locale: dateLocale }
      );

      if (!isCmsType(selectedType)) {
        toast.error(pc.contentRequired);
        return;
      }

      const status =
        mode === 'draft' ? 'draft' : mode === 'scheduled' ? 'scheduled' : 'published';

      try {
        await createContentMutation.mutateAsync({
          type: selectedType,
          title: payload.title,
          excerpt: payload.summary,
          body: payload.body,
          tenantId: activeTenantId,
          authorId: currentUser?.id || cmsForm.authorId || undefined,
          status,
          tags: payload.tags,
          metadata: {
            ...payload.metadata,
            channelIds: payload.channels,
          },
          scheduledAt:
            mode === 'scheduled' || mode === 'now'
              ? payload.scheduledAt.toISOString()
              : undefined,
        });

        if (mode === 'draft') {
          toast.success(pc.draftSaved);
        } else if (mode === 'now') {
          toast.success(pc.success);
        } else {
          toast.success(pc.scheduledFor.replace('{date}', formattedSchedule));
        }

        const targetPage = getPageForType(selectedType);
        const stayOnCurrentView =
          activePage === 'editorial-calendar' || activePage === 'scheduling';

        handleClose();

        if (targetPage && mode !== 'draft' && !stayOnCurrentView) {
          setActivePage(targetPage);
        }
      } catch {
        toast.error('Failed to save content');
      }
    },
    [
      validate,
      buildPayload,
      locale,
      scheduledAt,
      pc,
      selectedType,
      activePage,
      setActivePage,
      handleClose,
      activeTenantId,
      currentUser?.id,
      cmsForm.authorId,
      createContentMutation,
    ]
  );

  if (overlay && !open) return null;

  const panel = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F5F7F9]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#E8ECEF] bg-white px-5 py-3.5">
        {overlay ? (
          <DialogTitle className="text-lg font-semibold text-[#1D141F]">{pc.title}</DialogTitle>
        ) : (
          <h1 className="text-lg font-semibold text-[#1D141F]">{pc.title}</h1>
        )}
        <ComposerCloseButton label={pc.close} onClose={handleClose} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col border-r border-[#E8ECEF] bg-white">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
            <div className="mb-5 rounded-xl border border-[#E8ECEF] bg-linear-to-b from-[#FAFBFC] to-white p-4 shadow-[0_1px_2px_rgba(29,20,31,0.04)]">
              <p className="mb-3 text-sm font-semibold tracking-tight text-[#1D141F]">{pc.selectType}</p>
              <TypeSelector selectedType={selectedType} onTypeSelect={setSelectedType} />
            </div>

            {selectedType === 'social' ? (
              <SocialEditorPanel
                text={socialText}
                onTextChange={setSocialText}
              />
            ) : (
              <CmsEditorFields
                type={selectedType}
                form={cmsForm}
                onChange={updateCmsForm}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onTagKeyDown={handleTagKeyDown}
                onToggleChannel={handleToggleChannel}
              />
            )}
          </div>

          <ComposerFooter
            scheduledAt={scheduledAt}
            calendarOpen={calendarOpen}
            onCalendarOpenChange={setCalendarOpen}
            onScheduledAtChange={setScheduledAt}
            onCancel={handleClose}
            onSchedule={handleSubmit}
          />
        </div>

        <PreviewPanels
          type={selectedType}
          profileName={profileName}
          socialText={socialText}
          cmsForm={cmsForm}
          scheduledAt={scheduledAt}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
        />
      </div>
    </div>
  );

  if (overlay) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'flex w-full max-w-[min(1200px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0',
            'max-h-[90vh] h-[min(90vh,880px)] sm:max-w-[min(1200px,calc(100vw-2rem))]',
            'border-[#E8ECEF] bg-[#F5F7F9] shadow-2xl'
          )}
        >
          {panel}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-[#E8ECEF] bg-[#F5F7F9]">
      {panel}
    </div>
  );
}

export function CreatePublicationComposerOverlay() {
  const composerOpen = useAppStore((s) => s.publicationComposer.open);
  const composerType = useAppStore((s) => s.publicationComposer.type);
  const composerScheduledAt = useAppStore((s) => s.publicationComposer.scheduledAt);
  const closePublicationComposer = useAppStore((s) => s.closePublicationComposer);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) closePublicationComposer();
    },
    [closePublicationComposer]
  );

  return (
    <CreatePublicationComposer
      overlay
      open={composerOpen}
      onOpenChange={handleOpenChange}
      initialType={composerType}
      initialScheduledAtIso={composerScheduledAt}
    />
  );
}

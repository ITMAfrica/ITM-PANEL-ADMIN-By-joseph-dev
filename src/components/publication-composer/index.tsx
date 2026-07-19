'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
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
  cmsFormSeedFromContent,
  isCmsType,
  isComposerScheduledAtValid,
  parseComposerScheduledAt,
  type PublicationComposerPayload,
  type PublicationComposerType,
} from '@/lib/publication-composer';
import { getComposerDisplayLength, stripMediaMarkdown, extractMediaAttachments } from '@/lib/media-insert';
import { TypeSelector } from './type-selector';
import { CmsEditorFields, type CmsFormState } from './cms-editor-fields';
import {
  NewsletterTemplatePicker,
  DEFAULT_PLACEHOLDERS,
  type TemplatePlaceholders,
} from './newsletter-template-picker';
import { NewsletterSectionsEditor } from './newsletter-sections-editor';
import { NewsletterComposerSectionBreak } from './newsletter-composer-section-break';
import { NewsletterEmbedDialog } from '@/components/newsletter-embed-dialog';
import type { NewsletterSection, NewsletterTemplate } from '@/lib/types';
import { SocialEditorPanel } from './social-editor-panel';
import { PreviewPanels } from './preview-panels';
import { ComposerFooter } from './composer-footer';
import { ComposerCloseButton } from './composer-close-button';
import { useContentById, useCreateContent, useUpdateContent } from '@/hooks/use-content';
import { Loader2 } from 'lucide-react';

const DEFAULT_PROFILE_NAME = 'Agriculture 243';

function defaultNewsletterSections(): NewsletterSection[] {
  return [
    { type: 'hero', title: '', subtitle: '', imageUrl: '', label: '' },
    { type: 'footer', text: '' },
  ];
}

type CmsComposerType = Exclude<PublicationComposerType, 'social'>;

const emptyCmsForm = (channelIds: string[] = []): CmsFormState => ({
  title: '',
  body: '',
  authorId: '',
  tags: [],
  tagInput: '',
  selectedChannels: channelIds,
  emailSubject: '',
  urgency: 'info',
  category: '',
});

const emptyCmsFormsByType = (channelIds: string[] = []): Record<CmsComposerType, CmsFormState> => ({
  newsletter: emptyCmsForm(channelIds),
  article: emptyCmsForm(channelIds),
  announcement: emptyCmsForm(channelIds),
  communique: emptyCmsForm(channelIds),
});

interface CreatePublicationComposerProps {
  overlay?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialType?: PublicationComposerType;
  /** ISO-8601 string — stable across parent rerenders (unlike Date objects). */
  initialScheduledAtIso?: string;
  editContentId?: string;
  /** Pre-select distribution channels (e.g. calendar channel filter). */
  initialChannelIds?: string[];
}

export function CreatePublicationComposer({
  overlay = false,
  open = true,
  onOpenChange,
  initialType,
  initialScheduledAtIso,
  editContentId,
  initialChannelIds,
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
  const [cmsFormsByType, setCmsFormsByType] = useState(emptyCmsFormsByType);
  const cmsForm = isCmsType(selectedType) ? cmsFormsByType[selectedType] : emptyCmsForm();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [scheduledAt, setScheduledAtState] = useState(() =>
    parseComposerScheduledAt(initialScheduledAtIso)
  );
  const setScheduledAt = useCallback((date: Date) => {
    if (isComposerScheduledAtValid(date)) setScheduledAtState(date);
  }, []);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const loadedEditIdRef = useRef<string | undefined>(undefined);
  const editErrorHandledRef = useRef(false);
  const isEditMode = !!editContentId;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templatePlaceholders, setTemplatePlaceholders] =
    useState<TemplatePlaceholders>(DEFAULT_PLACEHOLDERS);
  const [templateSections, setTemplateSections] = useState<NewsletterSection[]>([]);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const {
    data: editContent,
    isLoading: isLoadingEditContent,
    isError: isEditContentError,
  } = useContentById(editContentId, open && isEditMode);

  const seedChannelIdsKey = (initialChannelIds ?? []).join(',');

  const resetForm = useCallback(() => {
    const channelIds = seedChannelIdsKey ? seedChannelIdsKey.split(',') : [];
    setSelectedType(initialType ?? DEFAULT_PUBLICATION_COMPOSER_TYPE);
    setSocialText('');
    setCmsFormsByType(emptyCmsFormsByType(channelIds));
    setPreviewMode('mobile');
    setScheduledAtState(parseComposerScheduledAt(initialScheduledAtIso));
    setCalendarOpen(false);
    setSelectedTemplateId(null);
    setTemplatePlaceholders(DEFAULT_PLACEHOLDERS);
    setTemplateSections(
      (initialType ?? DEFAULT_PUBLICATION_COMPOSER_TYPE) === 'newsletter'
        ? defaultNewsletterSections()
        : []
    );
    loadedEditIdRef.current = undefined;
  }, [initialType, initialScheduledAtIso, seedChannelIdsKey]);

  const applyEditContent = useCallback((content: NonNullable<typeof editContent>) => {
    const seed = cmsFormSeedFromContent({
      type: content.type,
      title: content.title,
      body: content.body,
      authorId: content.authorId,
      tags: content.tags,
      metadata: content.metadata,
      channelIds:
        content.type === 'newsletter' && 'channelIds' in content
          ? (content as { channelIds?: string[] }).channelIds
          : undefined,
      urgency:
        content.type === 'announcement' && 'urgency' in content
          ? (content as { urgency?: string }).urgency
          : undefined,
      category:
        content.type === 'article' && 'category' in content
          ? (content as { category?: string }).category
          : undefined,
    });

    if (!seed) return;

    setSelectedType(seed.type);
    if (content.type === 'newsletter' && content.body) {
      try {
        const parsed = JSON.parse(content.body);
        setTemplateSections(Array.isArray(parsed) ? parsed : []);
      } catch {
        setTemplateSections([]);
      }
    }
    setCmsFormsByType({
      ...emptyCmsFormsByType(),
      [seed.type]: {
        ...seed.form,
        tagInput: '',
      },
    });
    if (content.scheduledAt) {
      setScheduledAtState(parseComposerScheduledAt(content.scheduledAt));
    }
    loadedEditIdRef.current = content.id;
  }, []);

  // Re-seed type/schedule when the overlay opens. Controlled Radix Dialog does not
  // fire onOpenChange(true) when `open` is driven by the store.
  const handleDialogOpen = useCallback(() => {
    if (isEditMode) return;
    const channelIds = seedChannelIdsKey ? seedChannelIdsKey.split(',') : [];
    if (initialType) {
      setSelectedType(initialType);
      if (initialType === 'newsletter') setTemplateSections(defaultNewsletterSections());
    }
    if (initialScheduledAtIso) {
      setScheduledAtState(parseComposerScheduledAt(initialScheduledAtIso));
    }
    if (channelIds.length > 0) {
      setCmsFormsByType(emptyCmsFormsByType(channelIds));
    }
  }, [isEditMode, initialType, initialScheduledAtIso, seedChannelIdsKey]);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
    resetForm();
  }, [onOpenChange, resetForm]);

  // Controlled Dialog does not fire onOpenChange(true) when `open` flips via the store.
  // Re-seed type/schedule on each closed→open transition (was previously guaranteed by remount).
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      handleDialogOpen();
    }
    wasOpenRef.current = open;
  }, [open, handleDialogOpen]);

  // Apply edit-content data (async query result) or handle fetch errors.
  // React Query v5 removed onSuccess/onError from useQuery; this effect is the
  // recommended way to synchronise server state with local UI state.
  useEffect(() => {
    // Reset error gate when dialog closes so it can fire again on next open.
    if (!open) {
      editErrorHandledRef.current = false;
      return;
    }

    // Error: notify and close once per open session.
    if (isEditContentError && !editErrorHandledRef.current) {
      editErrorHandledRef.current = true;
      toast.error(pc.editNotSupported);
      // Defer close so React finishes processing the current effect before
      // cascading state updates.  onOpenChange → resetForm → multiple setStates.
      queueMicrotask(() => handleClose());
      return;
    }

    // Success: seed the form from the fetched content (once).
    if (editContent && loadedEditIdRef.current !== editContent.id) {
      startTransition(() => {
        applyEditContent(editContent);
      });
    }
  }, [open, editContent, isEditContentError, applyEditContent, handleClose, pc.editNotSupported]);

  const updateCurrentCmsForm = useCallback(
    (updater: (prev: CmsFormState) => CmsFormState) => {
      if (!isCmsType(selectedType)) return;
      setCmsFormsByType((prev) => ({
        ...prev,
        [selectedType]: updater(prev[selectedType]),
      }));
    },
    [selectedType]
  );

  const updateCmsForm = useCallback(
    <K extends keyof CmsFormState>(key: K, value: CmsFormState[K]) => {
      updateCurrentCmsForm((prev) => ({ ...prev, [key]: value }));
    },
    [updateCurrentCmsForm]
  );

  const handleAddTag = useCallback(() => {
    updateCurrentCmsForm((prev) => {
      const trimmed = prev.tagInput.trim();
      if (trimmed && !prev.tags.includes(trimmed) && prev.tags.length < 10) {
        return { ...prev, tags: [...prev.tags, trimmed], tagInput: '' };
      }
      return prev;
    });
  }, [updateCurrentCmsForm]);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      } else if (e.key === 'Backspace') {
        updateCurrentCmsForm((prev) => {
          if (!prev.tagInput && prev.tags.length > 0) {
            return { ...prev, tags: prev.tags.slice(0, -1) };
          }
          return prev;
        });
      }
    },
    [handleAddTag, updateCurrentCmsForm]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      updateCurrentCmsForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
    },
    [updateCurrentCmsForm]
  );

  const handleToggleChannel = useCallback(
    (channelId: string) => {
      updateCurrentCmsForm((prev) => ({
        ...prev,
        selectedChannels: prev.selectedChannels.includes(channelId)
          ? prev.selectedChannels.filter((id) => id !== channelId)
          : [...prev.selectedChannels, channelId],
      }));
    },
    [updateCurrentCmsForm]
  );

  const handleTypeSelect = useCallback((type: PublicationComposerType) => {
    setSelectedType(type);
    setSelectedTemplateId(null);
    setTemplatePlaceholders(DEFAULT_PLACEHOLDERS);
    setTemplateSections(type === 'newsletter' ? defaultNewsletterSections() : []);
  }, []);

  const validate = useCallback(
    (mode: 'now' | 'scheduled' | 'draft'): boolean => {
      if (selectedType === 'social') {
        if (getComposerDisplayLength(socialText) > FACEBOOK_CHAR_LIMIT) {
          toast.error(pc.charLimitError);
          return false;
        }
        if (
          !stripMediaMarkdown(socialText).trim() &&
          extractMediaAttachments(socialText).length === 0
        ) {
          toast.error(pc.contentRequired);
          return false;
        }
        return true;
      }

      if (!cmsForm.title.trim()) {
        toast.error(pc.titleRequired);
        return false;
      }

      if (selectedType === 'newsletter' && mode !== 'draft') {
        if (!cmsForm.emailSubject.trim()) {
          toast.error(pc.emailSubjectRequired);
          return false;
        }
        if (cmsForm.selectedChannels.length === 0) {
          toast.error(pc.channelRequired);
          return false;
        }
      }

      return true;
    },
    [
      selectedType,
      socialText,
      cmsForm.title,
      cmsForm.emailSubject,
      cmsForm.selectedChannels,
      pc,
    ]
  );

  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent();

  const handleSubmit = async (mode: 'now' | 'scheduled' | 'draft') => {
    if (createContentMutation.isPending || updateContentMutation.isPending) return;
    if (!validate(mode)) return;

    const payload: PublicationComposerPayload = (() => {
      const metadata: Record<string, unknown> = {};

      if (isCmsType(selectedType)) {
        if (selectedType === 'newsletter') {
          metadata.emailSubject = cmsForm.emailSubject;
          if (selectedTemplateId) metadata.templateId = selectedTemplateId;
        }
        if (selectedType === 'announcement') metadata.urgency = cmsForm.urgency;
        if (selectedType === 'article') metadata.category = cmsForm.category;
      }

      return {
        type: selectedType,
        title: isCmsType(selectedType) ? cmsForm.title : profileName,
        body:
          selectedType === 'newsletter'
            ? JSON.stringify(templateSections)
            : isCmsType(selectedType)
              ? cmsForm.body
              : socialText,
        authorId: cmsForm.authorId,
        tags: cmsForm.tags,
        channels: cmsForm.selectedChannels,
        scheduledAt,
        metadata,
      };
    })();
    const dateLocale = locale === 'fr' ? fr : enUS;
    const formattedSchedule = format(
      scheduledAt,
      locale === 'fr' ? 'd MMMM yyyy HH:mm' : 'MMMM d, yyyy HH:mm',
      { locale: dateLocale }
    );

    if (!isCmsType(selectedType) && selectedType !== 'social') {
      toast.error(pc.contentRequired);
      return;
    }

    const status =
      mode === 'draft' ? 'draft' : mode === 'scheduled' ? 'scheduled' : 'published';

    const contentData = {
      title: payload.title,
      body: payload.body,
      status,
      tags: payload.tags,
      metadata: {
        ...payload.metadata,
        channelIds: payload.channels,
      },
      scheduledAt:
        mode === 'scheduled' || mode === 'now'
          ? payload.scheduledAt.toISOString()
          : mode === 'draft'
            ? null
            : undefined,
    };

    const isNewsletterPublish = mode === 'now' && selectedType === 'newsletter';
    const pendingToastId = isNewsletterPublish
      ? toast.loading(pc.newsletterSending)
      : undefined;

    try {
      let dispatching = false;

      if (isEditMode && editContentId) {
        const updated = await updateContentMutation.mutateAsync({
          id: editContentId,
          data: contentData,
        });
        dispatching = Boolean((updated as { dispatching?: boolean }).dispatching);
      } else {
        const created = await createContentMutation.mutateAsync({
          type: selectedType,
          ...contentData,
          tenantId: activeTenantId,
          authorId: currentUser?.id || cmsForm.authorId || undefined,
          scheduledAt:
            mode === 'scheduled' || mode === 'now'
              ? payload.scheduledAt.toISOString()
              : undefined,
        });
        dispatching = Boolean(created?.dispatching);
      }

      if (mode === 'draft') {
        toast.success(isEditMode ? pc.updateSuccess : pc.draftSaved);
      } else if (isNewsletterPublish) {
        toast.success(
          dispatching ? pc.newsletterDispatchQueued : pc.newsletterPublishedNoRecipients,
          pendingToastId !== undefined ? { id: pendingToastId } : undefined
        );
      } else if (mode === 'now') {
        toast.success(isEditMode ? pc.updateSuccess : pc.success);
      } else {
        toast.success(
          isEditMode
            ? pc.updateSuccess
            : pc.scheduledFor.replace('{date}', formattedSchedule)
        );
      }

      handleClose();

      if (mode !== 'draft') {
        // Delay navigation so the composer close animation completes smoothly
        // before the page transition kicks in, avoiding a jarring jump.
        setTimeout(() => {
          setActivePage('editorial-calendar');
        }, 350);
      }
    } catch {
      if (pendingToastId !== undefined) toast.dismiss(pendingToastId);
      toast.error(
        isEditMode
          ? locale === 'fr'
            ? 'Échec de la mise à jour'
            : 'Failed to update content'
          : locale === 'fr'
            ? 'Échec de la sauvegarde'
            : 'Failed to save content'
      );
    }
  };

  const isSubmitting =
    createContentMutation.isPending || updateContentMutation.isPending;

  const composerTitle = isEditMode ? pc.editTitle : pc.title;
  const isComposerLoading = isEditMode && isLoadingEditContent;

  const panel = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F5F7F9]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#E8ECEF] bg-white px-5 py-3.5">
        {overlay ? (
          <DialogTitle className="text-lg font-semibold text-[#1D141F]">{composerTitle}</DialogTitle>
        ) : (
          <h1 className="text-lg font-semibold text-[#1D141F]">{composerTitle}</h1>
        )}
        <ComposerCloseButton label={pc.close} onClose={handleClose} />
      </header>

      {isComposerLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#5C6470]">
          <Loader2 className="h-5 w-5 animate-spin" />
          {pc.loadingContent}
        </div>
      ) : (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col border-r border-[#E8ECEF] bg-white">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
            <div className="mb-5">
              <TypeSelector
                selectedType={selectedType}
                onTypeSelect={handleTypeSelect}
                disabled={isEditMode}
              />
            </div>

            {selectedType === 'social' ? (
              <SocialEditorPanel
                text={socialText}
                onTextChange={setSocialText}
              />
            ) : (
              <>
                {selectedType === 'newsletter' && (
                  <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 items-start">
                    {!isEditMode && (
                      <div className="rounded-xl border border-dashed border-[#E8ECEF] bg-linear-to-b from-[#FAFBFC] to-white p-4 shadow-[0_1px_2px_rgba(29,20,31,0.04)]">
                        <p className="mb-3 text-sm font-semibold tracking-tight text-[#1D141F]">
                          {t.publicationComposer.templateLabel ?? (locale === 'fr' ? 'Modèle de newsletter' : 'Newsletter Template')}
                        </p>
                        <NewsletterTemplatePicker
                          tenantId={activeTenantId}
                          selectedId={selectedTemplateId}
                          onSelect={(template: NewsletterTemplate | null, placeholders: TemplatePlaceholders) => {
                            setSelectedTemplateId(template?.id ?? null);
                            setTemplatePlaceholders(placeholders);
                            if (template) {
                              try {
                                const parsed = JSON.parse(template.body) as NewsletterSection[];
                                setTemplateSections(Array.isArray(parsed) ? parsed : []);
                              } catch {
                                setTemplateSections([]);
                              }
                              setCmsFormsByType((prev) => ({
                                ...prev,
                                newsletter: {
                                  ...prev.newsletter,
                                  emailSubject: template.subject,
                                },
                              }));
                            } else {
                              setTemplateSections([]);
                            }
                          }}
                          embedded
                          onOpenChange={setTemplatePickerOpen}
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="rounded-xl border border-dashed border-[#E8ECEF] bg-linear-to-b from-[#FAFBFC] to-white p-4 shadow-[0_1px_2px_rgba(29,20,31,0.04)]">
                        <p className="mb-3 text-sm font-semibold tracking-tight text-[#1D141F]">
                          {locale === 'fr'
                            ? 'Intégration sur votre site'
                            : 'Website Integration'}
                        </p>
                        <NewsletterEmbedDialog
                          variant="composer"
                          initialChannelId={cmsForm.selectedChannels[0]}
                        />
                      </div>
                      {templatePickerOpen && (
                        <div className="mt-8 flex justify-center pb-4">
                          <img
                            src="/assets/illustrations/compose-newsletter.svg"
                            alt=""
                            className="h-auto w-full max-w-[300px] opacity-40"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  </>
                )}
                {selectedType === 'newsletter' && <NewsletterComposerSectionBreak />}
                {selectedType === 'newsletter' ? (
                  <div className="mb-1 rounded-2xl border border-[#E8ECEF] bg-linear-to-b from-white to-[#FAFBFC] p-4 shadow-[0_1px_2px_rgba(29,20,31,0.04)] sm:p-5">
                    <CmsEditorFields
                      type={selectedType}
                      form={cmsForm}
                      onChange={updateCmsForm}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      onTagKeyDown={handleTagKeyDown}
                      onToggleChannel={handleToggleChannel}
                      placeholders={templatePlaceholders}
                      sectionsEditor={
                        <NewsletterSectionsEditor
                          sections={templateSections}
                          onChange={setTemplateSections}
                        />
                      }
                    />
                  </div>
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
              </>
            )}
          </div>

          <ComposerFooter
            scheduledAt={scheduledAt}
            calendarOpen={calendarOpen}
            onCalendarOpenChange={setCalendarOpen}
            onScheduledAtChange={setScheduledAt}
            onCancel={handleClose}
            onSchedule={handleSubmit}
            isSubmitting={isSubmitting}
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
          templateSections={selectedType === 'newsletter' ? templateSections : undefined}
        />
      </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? handleDialogOpen() : handleClose())}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'flex w-full max-w-[min(1440px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0',
            'max-h-[90vh] h-[min(90vh,880px)] sm:max-w-[min(1440px,calc(100vw-2rem))]',
            'border-[#E8ECEF] bg-[#F5F7F9] shadow-2xl'
          )}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
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
  const editContentId = useAppStore((s) => s.publicationComposer.editContentId);
  const initialChannelIds = useAppStore((s) => s.publicationComposer.initialChannelIds);
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
      editContentId={editContentId}
      initialChannelIds={initialChannelIds}
    />
  );
}

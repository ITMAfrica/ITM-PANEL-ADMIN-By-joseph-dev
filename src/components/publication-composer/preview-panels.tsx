'use client';

import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Info, Monitor, Smartphone, ThumbsUp, MessageSquare, Share2, Mail, FileText, Megaphone, ScrollText, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { FacebookIcon } from '@/components/social/facebook-icon';
import { publicationTypes, type PublicationComposerType } from '@/lib/publication-composer';
import { extractFirstImageUrl, extractPreviewImage, stripMediaMarkdown } from '@/lib/media-insert';
import { useAppStore } from '@/lib/store';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { CmsFormState } from './cms-editor-fields';
import { PreviewClickableImage } from './preview-clickable-image';

type PreviewMode = 'mobile' | 'desktop';

interface PreviewPanelsProps {
  type: PublicationComposerType;
  profileName: string;
  socialText: string;
  cmsForm: CmsFormState;
  scheduledAt: Date;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

function PreviewModeToggle({
  previewMode,
  onPreviewModeChange,
  mobileLabel,
  desktopLabel,
}: {
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  mobileLabel: string;
  desktopLabel: string;
}) {
  return (
    <div className="flex rounded-lg border border-[#DADDE1] bg-white p-0.5">
      <button
        type="button"
        onClick={() => onPreviewModeChange('mobile')}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
          previewMode === 'mobile' ? 'bg-[#1D141F] text-white' : 'text-[#65676B] hover:bg-[#F0F2F5]'
        )}
        aria-label={mobileLabel}
      >
        <Smartphone className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onPreviewModeChange('desktop')}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
          previewMode === 'desktop' ? 'bg-[#1D141F] text-white' : 'text-[#65676B] hover:bg-[#F0F2F5]'
        )}
        aria-label={desktopLabel}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}

function FacebookPostPreview({
  profileName,
  body,
  scheduledAt,
  mode,
  locale,
}: {
  profileName: string;
  body: string;
  scheduledAt: Date;
  mode: PreviewMode;
  locale: 'fr' | 'en';
}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(scheduledAt, locale === 'fr' ? "d MMM yyyy 'à' HH:mm" : "MMM d, yyyy 'at' HH:mm", {
    locale: dateLocale,
  });
  const previewImage = extractFirstImageUrl(body);
  const previewText = stripMediaMarkdown(body);

  return (
    <div className={cn('mx-auto w-full transition-all duration-300', mode === 'mobile' ? 'max-w-[320px]' : 'max-w-[480px]')}>
      <div className="overflow-hidden rounded-lg border border-[#DADDE1] bg-white shadow-sm">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white">
            {profileName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight text-[#050505]">{profileName}</p>
            <p className="text-xs text-[#65676B]">{dateLabel}</p>
          </div>
          <FacebookIcon className="h-4 w-4 shrink-0 text-[#1877F2]" />
        </div>
        <div className="min-h-[72px] px-3 pb-3">
          {previewText ? (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.35] text-[#050505]">{previewText}</p>
          ) : !previewImage ? (
            <p className="text-sm italic text-[#B0B3B8]">{pc.placeholderPreview}</p>
          ) : null}
        </div>
        {previewImage ? (
          <div className="border-t border-[#DADDE1] bg-[#F0F2F5]">
            <PreviewClickableImage src={previewImage} className="max-h-80 cursor-zoom-in" />
          </div>
        ) : null}
        <div className="border-t border-[#DADDE1]">
          <div className="flex divide-x divide-[#DADDE1]">
            {[
              { icon: ThumbsUp, label: pc.like },
              { icon: MessageSquare, label: pc.comment },
              { icon: Share2, label: pc.share },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className={cn(
                  'flex min-h-11 flex-1 items-center justify-center text-[#65676B]',
                  mode === 'mobile' ? 'gap-1 px-1 py-2 text-xs font-semibold' : 'gap-1.5 px-2 py-2.5 text-[13px] font-semibold'
                )}
              >
                <Icon
                  className={cn('shrink-0', mode === 'mobile' ? 'size-4' : 'size-[18px]')}
                  strokeWidth={1.75}
                />
                <span className="whitespace-nowrap leading-none">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CmsPreview({
  type,
  form,
  profileName,
  scheduledAt,
  mode,
  locale,
}: {
  type: PublicationComposerType;
  form: CmsFormState;
  profileName: string;
  scheduledAt: Date;
  mode: PreviewMode;
  locale: 'fr' | 'en';
}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);
  const typeConfig = publicationTypes.find((pt) => pt.type === type);
  const Icon = typeConfig?.icon ?? FileText;
  const authorName = form.authorId ? getUserName(form.authorId) : profileName;
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(
    scheduledAt,
    locale === 'fr' ? "d MMMM yyyy 'à' HH:mm" : "MMMM d, yyyy 'at' HH:mm",
    { locale: dateLocale }
  );

  const previewTitle =
    type === 'newsletter'
      ? pc.previewEmail
      : type === 'article'
        ? pc.previewArticle
        : type === 'announcement'
          ? pc.previewAnnouncement
          : pc.previewCommunique;

  const hasContent = Boolean(form.title.trim() || form.summary.trim() || form.body.trim());
  const previewImage = extractPreviewImage(form.summary, form.body);
  const previewSummary = stripMediaMarkdown(form.summary);
  const previewBody = stripMediaMarkdown(form.body);

  return (
    <div
      className={cn(
        'mx-auto w-full transition-all duration-300',
        mode === 'mobile' ? 'max-w-[320px]' : 'max-w-[400px]'
      )}
    >
      <div className="overflow-hidden rounded-lg border border-[#DADDE1] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E8ECEF] px-4 py-3">
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', typeConfig?.bgColor)}>
            <Icon className={cn('h-4 w-4', typeConfig?.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8B939E]">{previewTitle}</p>
            <p className="truncate text-sm font-semibold text-[#1D141F]">{profileName}</p>
          </div>
        </div>

        <div className="min-h-[220px] space-y-3 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B939E]">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {dateLabel}
            </span>
            <span aria-hidden>·</span>
            <span>{authorName}</span>
            {type === 'article' && form.category && (
              <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {form.category}
              </span>
            )}
          </div>

          {type === 'newsletter' && form.emailSubject && (
            <p className="text-xs font-medium text-[#5C6470]">
              {pc.emailSubjectLabel}: {form.emailSubject}
            </p>
          )}

          <h3 className={cn('font-bold text-[#1D141F]', mode === 'mobile' ? 'text-lg leading-snug' : 'text-xl leading-tight')}>
            {form.title.trim() || cc.titlePlaceholder}
          </h3>

          {previewSummary ? (
            <p className="text-sm leading-relaxed text-[#5C6470]">{previewSummary}</p>
          ) : null}

          {previewBody ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1D141F]">{previewBody}</p>
          ) : hasContent ? null : (
            <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-[#DADDE1] bg-[#F8F9FA] px-4 py-6 text-center">
              <p className="text-sm italic text-[#B0B3B8]">{pc.placeholderPreview}</p>
            </div>
          )}

          {previewImage ? (
            <div className="overflow-hidden rounded-lg border border-[#E8ECEF]">
              <PreviewClickableImage src={previewImage} className="max-h-48 cursor-zoom-in" />
            </div>
          ) : null}

          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[#F0F3F6] px-2 py-0.5 text-[11px] font-medium text-[#5C6470]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PreviewPanels({
  type,
  profileName,
  socialText,
  cmsForm,
  scheduledAt,
  previewMode,
  onPreviewModeChange,
}: PreviewPanelsProps) {
  const { t, locale } = useTranslation();
  const pc = t.publicationComposer;
  const isSocial = type === 'social';
  const typeConfig = publicationTypes.find((pt) => pt.type === type);
  const TypeLabelIcon = typeConfig?.icon;

  return (
    <aside className="hidden min-h-0 flex-col border-t border-[#E0E4E8] bg-[#EEF1F4] lg:flex lg:h-full lg:w-[380px] lg:flex-none lg:shrink-0 lg:border-t-0 xl:w-[420px]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E0E4E8] px-4 py-3">
        <span className="text-sm font-semibold text-[#1D141F]">{pc.preview}</span>
        <PreviewModeToggle
          previewMode={previewMode}
          onPreviewModeChange={onPreviewModeChange}
          mobileLabel={pc.previewMobile}
          desktopLabel={pc.previewDesktop}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {isSocial ? (
          <>
            <div className="flex items-center gap-2 text-sm text-[#65676B]">
              <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
              <span>{pc.facebook}</span>
            </div>
            <FacebookPostPreview
              profileName={profileName}
              body={socialText}
              scheduledAt={scheduledAt}
              mode={previewMode}
              locale={locale}
            />
            <div className="flex gap-2.5 rounded-lg border border-[#B8D4F0] bg-[#E8F4FD] px-3.5 py-3 text-xs leading-relaxed text-[#1D4E7A]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1877F2]" />
              <p>{pc.previewDisclaimer}</p>
            </div>
          </>
        ) : (
          <>
            {TypeLabelIcon ? (
              <div className="flex items-center gap-2 text-sm text-[#65676B]">
                <TypeLabelIcon className={cn('h-4 w-4', typeConfig?.color)} />
                <span>{previewTitleForType(type, pc)}</span>
              </div>
            ) : null}
            <CmsPreview
              type={type}
              form={cmsForm}
              profileName={profileName}
              scheduledAt={scheduledAt}
              mode={previewMode}
              locale={locale}
            />
            <div className="flex gap-2.5 rounded-lg border border-[#E8ECEF] bg-white px-3.5 py-3 text-xs leading-relaxed text-[#5C6470]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8B939E]" />
              <p>{pc.previewCmsHint}</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function previewTitleForType(
  type: PublicationComposerType,
  pc: (typeof import('@/lib/i18n/translations').translations.fr)['publicationComposer']
) {
  switch (type) {
    case 'newsletter':
      return pc.previewEmail;
    case 'article':
      return pc.previewArticle;
    case 'announcement':
      return pc.previewAnnouncement;
    case 'communique':
      return pc.previewCommunique;
    default:
      return pc.preview;
  }
}

export function getPreviewIcon(type: PublicationComposerType) {
  switch (type) {
    case 'newsletter':
      return Mail;
    case 'article':
      return FileText;
    case 'announcement':
      return Megaphone;
    case 'communique':
      return ScrollText;
    default:
      return Share2;
  }
}

'use client';

import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Info, Monitor, Smartphone, ThumbsUp, MessageSquare, Share2, Mail, FileText, Megaphone, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { FacebookIcon } from '@/components/social/facebook-icon';
import { type PublicationComposerType, getAnnouncementTypeLabelKey } from '@/lib/publication-composer';
import { extractFirstImageUrl, extractPreviewImage, stripMediaMarkdown } from '@/lib/media-insert';
import { useAppStore } from '@/lib/store';
import { useUserLookup } from '@/hooks/use-user-lookup';
import type { CmsFormState } from './cms-editor-fields';
import { PreviewClickableImage } from './preview-clickable-image';
import { NewsletterSectionsPreview } from './newsletter-sections-preview';
import type { NewsletterSection } from '@/lib/types';

type PreviewMode = 'mobile' | 'desktop';

interface PreviewPanelsProps {
  type: PublicationComposerType;
  profileName: string;
  socialText: string;
  cmsForm: CmsFormState;
  scheduledAt: Date;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  templateSections?: NewsletterSection[];
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

const URGENCY_STYLES: Record<
  CmsFormState['urgency'],
  { label: string; bar: string; badge: string; tone: string }
> = {
  info: {
    label: 'info',
    bar: 'bg-[#2E7DD1]',
    badge: 'bg-[#E8F2FC] text-[#2E7DD1]',
    tone: 'text-[#2E7DD1]',
  },
  warning: {
    label: 'warning',
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    tone: 'text-amber-700',
  },
  critical: {
    label: 'critical',
    bar: 'bg-rose-600',
    badge: 'bg-rose-100 text-rose-700',
    tone: 'text-rose-700',
  },
};

function usePreviewMeta(
  type: PublicationComposerType,
  form: CmsFormState,
  profileName: string
) {
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);
  const authorName = form.authorId ? getUserName(form.authorId) : profileName;
  const previewImage = extractPreviewImage(form.body);
  const previewSummary = stripMediaMarkdown(form.body);
  const previewBody = stripMediaMarkdown(form.body);
  const hasContent = Boolean(form.title.trim() || form.body.trim());
  return { authorName, previewImage, previewSummary, previewBody, hasContent };
}

function PreviewTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-md bg-[#F0F3F6] px-2 py-0.5 text-[11px] font-medium text-[#5C6470]"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

function EmptyPreview({ label }: { label: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-[#DADDE1] bg-[#F8F9FA] px-4 py-6 text-center">
      <p className="text-sm italic text-[#B0B3B8]">{label}</p>
    </div>
  );
}

/* ----------------------------- Newsletter: email ---------------------------- */

function NewsletterEmailPreview({
  form,
  profileName,
  scheduledAt,
  mode,
  locale,
  templateSections,
}: {
  form: CmsFormState;
  profileName: string;
  scheduledAt: Date;
  mode: PreviewMode;
  locale: 'fr' | 'en';
  templateSections?: NewsletterSection[];
}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const { authorName, previewImage, previewBody, hasContent } = usePreviewMeta(
    'newsletter',
    form,
    profileName
  );
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(
    scheduledAt,
    locale === 'fr' ? "d MMM yyyy '·' HH:mm" : "MMM d, yyyy '·' HH:mm",
    { locale: dateLocale }
  );

  return (
    <div className={cn('mx-auto w-full transition-all duration-300', mode === 'mobile' ? 'max-w-[320px]' : 'max-w-[420px]')}>
      <div className="overflow-hidden rounded-lg border border-[#DADDE1] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E8ECEF] bg-[#F4F7FB] px-4 py-2.5">
          <Mail className="h-4 w-4 text-[#2E7DD1]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#2E7DD1]">
            {pc.previewEmail}
          </span>
        </div>

        <div className="space-y-1 px-4 py-2 text-xs text-[#5C6470]">
          <p className="flex gap-1.5">
            <span className="font-medium text-[#8B939E]">{pc.previewFrom}:</span>
            <span className="truncate text-[#1D141F]">{profileName}</span>
          </p>
          <p className="flex gap-1.5">
            <span className="font-medium text-[#8B939E]">{pc.previewSubject}:</span>
            <span className="truncate text-[#1D141F]">{form.emailSubject.trim() || pc.emailSubjectPlaceholder}</span>
          </p>
        </div>

        <div className="mx-4 mb-4 overflow-hidden rounded-md border border-[#E8ECEF]">
          <p className="border-b border-[#E8ECEF] bg-[#FBFCFE] px-3 py-1.5 text-[11px] text-[#8B939E]">
            {dateLabel} · {authorName}
          </p>

          {templateSections && templateSections.length > 0 ? (
            <NewsletterSectionsPreview sections={templateSections} />
          ) : previewBody ? (
            <p className="whitespace-pre-wrap px-3 py-3 text-sm leading-relaxed text-[#1D141F]">
              {previewBody}
            </p>
          ) : previewImage ? null : (
            <EmptyPreview label={pc.placeholderPreview} />
          )}

          {previewImage ? (
            <div className="border-t border-[#E8ECEF]">
              <PreviewClickableImage src={previewImage} className="max-h-52 w-full cursor-zoom-in" />
            </div>
          ) : null}
        </div>

        <div className="px-4 pb-3">
          <PreviewTags tags={form.tags} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Article: blog ------------------------------ */

function ArticlePreview({
  form,
  profileName,
  scheduledAt,
  mode,
  locale,
  templateSections,
}: {
  form: CmsFormState;
  profileName: string;
  scheduledAt: Date;
  mode: PreviewMode;
  locale: 'fr' | 'en';
  templateSections?: NewsletterSection[];
}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const { authorName, previewImage, previewSummary, previewBody, hasContent } = usePreviewMeta(
    'article',
    form,
    profileName
  );
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(
    scheduledAt,
    locale === 'fr' ? "d MMM yyyy" : "MMM d, yyyy",
    { locale: dateLocale }
  );

  return (
    <div className={cn('mx-auto w-full transition-all duration-300', mode === 'mobile' ? 'max-w-[320px]' : 'max-w-[400px]')}>
      <div className="overflow-hidden rounded-lg border border-[#E8ECEF] bg-white shadow-sm">
        {previewImage ? (
          <div className="max-h-44 overflow-hidden border-b border-[#E8ECEF]">
            <PreviewClickableImage src={previewImage} className="h-44 w-full cursor-zoom-in object-cover" />
          </div>
        ) : null}

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B939E]">
            <span className="inline-flex items-center gap-1 font-medium text-amber-600">
              <FileText className="h-3.5 w-3.5" />
              {pc.previewArticle}
            </span>
            {form.category && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                {form.category}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold leading-tight text-[#1D141F]">
            {form.title.trim() || cc.titlePlaceholder}
          </h3>

          {templateSections && templateSections.length > 0 ? (
            <NewsletterSectionsPreview sections={templateSections} />
          ) : (
            <>
              {previewSummary ? (
                <p className="text-sm leading-relaxed text-[#5C6470]">{previewSummary}</p>
              ) : null}

              {previewBody ? (
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-[#3A3A3A]">
                  {previewBody}
                </p>
              ) : hasContent ? null : (
                <EmptyPreview label={pc.placeholderPreview} />
              )}
            </>
          )}

          <div className="flex items-center gap-2 border-t border-[#F0F2F5] pt-3 text-xs text-[#8B939E]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-[10px] font-bold text-white">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-[#5C6470]">{authorName}</span>
            <span aria-hidden>·</span>
            <span>{dateLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Announcement: alert --------------------------- */

function AnnouncementPreview({
  form,
  profileName,
  scheduledAt,
  mode,
  locale,
  templateSections,
}: {
  form: CmsFormState;
  profileName: string;
  scheduledAt: Date;
  mode: PreviewMode;
  locale: 'fr' | 'en';
  templateSections?: NewsletterSection[];
}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const { authorName, previewImage, previewSummary, previewBody, hasContent } = usePreviewMeta(
    'announcement',
    form,
    profileName
  );
  const urgency = URGENCY_STYLES[form.urgency];
  const categoryLabelKey = form.category ? getAnnouncementTypeLabelKey(form.category) : null;
  const categoryLabel = categoryLabelKey
    ? pc.announcementTypes[categoryLabelKey]
    : form.category;
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(
    scheduledAt,
    locale === 'fr' ? "d MMM yyyy '·' HH:mm" : "MMM d, yyyy '·' HH:mm",
    { locale: dateLocale }
  );

  return (
    <div className={cn('mx-auto w-full transition-all duration-300', mode === 'mobile' ? 'max-w-[320px]' : 'max-w-[400px]')}>
      <div className="overflow-hidden rounded-lg border border-[#E8ECEF] bg-white shadow-sm">
        <div className={cn('h-1.5 w-full', urgency.bar)} />
        <div className="flex items-center gap-2 px-4 pt-3">
          <Megaphone className={cn('h-4 w-4 shrink-0', urgency.tone)} />
          <span className={cn('text-xs font-semibold uppercase tracking-wide', urgency.tone)}>
            {pc.previewAnnouncement}
          </span>
          {categoryLabel && (
            <span className="ml-auto max-w-[45%] truncate rounded-full bg-[#F0F2F5] px-2 py-0.5 text-[11px] font-semibold text-[#5C6470]">
              {categoryLabel}
            </span>
          )}
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', urgency.badge, !categoryLabel && 'ml-auto')}>
            {pc.previewUrgency}: {urgency.label}
          </span>
        </div>

        <div className="space-y-3 p-4">
          <h3 className="text-lg font-bold leading-snug text-[#1D141F]">
            {form.title.trim() || cc.titlePlaceholder}
          </h3>

          {templateSections && templateSections.length > 0 ? (
            <NewsletterSectionsPreview sections={templateSections} />
          ) : (
            <>
              {previewSummary ? (
                <p className="text-sm leading-relaxed text-[#5C6470]">{previewSummary}</p>
              ) : null}

              {previewBody ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3A3A3A]">
                  {previewBody}
                </p>
              ) : hasContent ? null : (
                <EmptyPreview label={pc.placeholderPreview} />
              )}

              {previewImage ? (
                <div className="overflow-hidden rounded-lg border border-[#E8ECEF]">
                  <PreviewClickableImage src={previewImage} className="max-h-48 w-full cursor-zoom-in object-cover" />
                </div>
              ) : null}
            </>
          )}

          <p className="flex items-center gap-1.5 text-xs text-[#8B939E]">
            <CalendarClock className="h-3.5 w-3.5" />
            {dateLabel} · {authorName}
          </p>

          <PreviewTags tags={form.tags} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Communiqué: press release ------------------------ */

function CommuniquePreview({
  form,
  profileName,
  scheduledAt,
  mode,
  locale,
}: {
  form: CmsFormState;
  profileName: string;
  scheduledAt: Date;
  mode: PreviewMode;
  locale: 'fr' | 'en';
}) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const cc = t.createContent;
  const { authorName, previewImage, previewSummary, previewBody, hasContent } = usePreviewMeta(
    'communique',
    form,
    profileName
  );
  const dateLocale = locale === 'fr' ? fr : enUS;
  const dateLabel = format(
    scheduledAt,
    locale === 'fr' ? "d MMMM yyyy" : "MMMM d, yyyy",
    { locale: dateLocale }
  );

  return (
    <div className={cn('mx-auto w-full transition-all duration-300', mode === 'mobile' ? 'max-w-[320px]' : 'max-w-[400px]')}>
      <div className="overflow-hidden rounded-lg border border-[#D8D2C4] bg-[#FCFBF7] shadow-sm">
        <div className="border-b border-[#E6E0D2] bg-[#F6F3EA] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A7E5E]">
            {pc.previewCommunique}
          </p>
          <p className="truncate text-sm font-semibold text-[#4A4334]">{profileName}</p>
        </div>

        <div className="space-y-3 p-5">
          <p className="text-center text-[11px] uppercase tracking-widest text-[#A89B7C]">
            {dateLabel}
          </p>

          <h3 className="text-center text-xl font-bold leading-snug text-[#2A2419]">
            {form.title.trim() || cc.titlePlaceholder}
          </h3>

          <div className="mx-auto h-px w-12 bg-[#C9BFA3]" />

          {(previewSummary || previewBody) ? (
            <div className="space-y-2 text-center">
              {previewSummary ? (
                <p className="text-sm font-medium leading-relaxed text-[#5C5440]">{previewSummary}</p>
              ) : null}
              {previewBody ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3F3A2E]">
                  {previewBody}
                </p>
              ) : null}
            </div>
          ) : hasContent ? null : (
            <EmptyPreview label={pc.placeholderPreview} />
          )}

          {previewImage ? (
            <div className="overflow-hidden rounded-md border border-[#E6E0D2]">
              <PreviewClickableImage src={previewImage} className="max-h-44 w-full cursor-zoom-in object-cover" />
            </div>
          ) : null}

          <p className="text-center text-xs text-[#8A7E5E]">
            {pc.previewAuthor}: <span className="font-medium text-[#4A4334]">{authorName}</span>
          </p>

          <PreviewTags tags={form.tags} />
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
  templateSections,
}: PreviewPanelsProps) {
  const { t, locale } = useTranslation();
  const pc = t.publicationComposer;
  const isSocial = type === 'social';

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
            {type === 'newsletter' ? (
              <NewsletterEmailPreview
                form={cmsForm}
                profileName={profileName}
                scheduledAt={scheduledAt}
                mode={previewMode}
                locale={locale}
                templateSections={templateSections}
              />
            ) : type === 'article' ? (
              <ArticlePreview
                form={cmsForm}
                profileName={profileName}
                scheduledAt={scheduledAt}
                mode={previewMode}
                locale={locale}
                templateSections={templateSections}
              />
            ) : type === 'announcement' ? (
              <AnnouncementPreview
                form={cmsForm}
                profileName={profileName}
                scheduledAt={scheduledAt}
                mode={previewMode}
                locale={locale}
                templateSections={templateSections}
              />
            ) : (
              <CommuniquePreview
                form={cmsForm}
                profileName={profileName}
                scheduledAt={scheduledAt}
                mode={previewMode}
                locale={locale}
              />
            )}
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

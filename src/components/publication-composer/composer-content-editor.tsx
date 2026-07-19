'use client';

import { useCallback, useRef, useState } from 'react';
import {
  FolderOpen,
  ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  Play,
  Smile,
  Tag,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { useUploadMedia } from '@/hooks/use-upload-media';
import {
  buildMediaMarkdown,
  composeContentWithMedia,
  extractMediaAttachments,
  getComposerDisplayLength,
  stripMediaMarkdown,
  type MediaAttachment,
} from '@/lib/media-insert';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import type { MediaItem } from '@/lib/types';

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-md text-[#5C6470] transition-colors hover:bg-[#F0F3F6] hover:text-[#1D141F] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  );
}

function MediaAttachmentPreview({
  attachment,
  onRemove,
  removeLabel,
}: {
  attachment: MediaAttachment;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#E8ECEF] bg-[#F5F7F9]">
      {attachment.isVideo ? (
        <div className="flex h-full w-full items-center justify-center bg-[#1D141F]/80">
          <Play className="h-6 w-6 fill-white text-white" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1D141F]/70 text-white opacity-0 transition-opacity hover:bg-[#1D141F] group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

interface ComposerContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  id?: string;
  charLimit?: number;
  counterIcon?: React.ReactNode;
  className?: string;
}

export function ComposerContentEditor({
  value,
  onChange,
  placeholder,
  id,
  charLimit,
  counterIcon,
  className,
}: ComposerContentEditorProps) {
  const { t } = useTranslation();
  const pc = t.publicationComposer;
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const uploadMedia = useUploadMedia(activeTenantId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const displayText = stripMediaMarkdown(value);
  const attachments = extractMediaAttachments(value);
  const charCount = getComposerDisplayLength(value);
  const isOverLimit = charLimit !== undefined && charCount > charLimit;
  const isUploading = uploadMedia.isPending;

  const updateContent = useCallback(
    (text: string, nextAttachments: MediaAttachment[]) => {
      onChange(composeContentWithMedia(text, nextAttachments));
    },
    [onChange]
  );

  const insertMedia = useCallback(
    (item: Pick<MediaItem, 'name' | 'url' | 'mimeType'>) => {
      const currentAttachments = extractMediaAttachments(value);
      if (currentAttachments.some((attachment) => attachment.url === item.url)) {
        return;
      }
      const markdown = buildMediaMarkdown(item.name, item.url, item.mimeType);
      const isVideo = item.mimeType?.startsWith('video/') ?? false;
      const nextAttachment: MediaAttachment = {
        name: item.name.replace(/\.[^.]+$/, '') || 'media',
        url: item.url,
        isVideo,
        markdown: markdown.trimEnd(),
      };

      updateContent(displayText, [...currentAttachments, nextAttachment]);
      toast.success(pc.imageInserted);

      requestAnimationFrame(() => textareaRef.current?.focus());
    },
    [value, displayText, updateContent, pc.imageInserted]
  );

  const removeAttachment = useCallback(
    (index: number) => {
      const nextAttachments = extractMediaAttachments(value).filter((_, i) => i !== index);
      updateContent(displayText, nextAttachments);
    },
    [value, displayText, updateContent]
  );

  const handleTextChange = useCallback(
    (text: string) => {
      const strippedText = stripMediaMarkdown(text);
      const pastedAttachments = extractMediaAttachments(text);
      const existingAttachments = extractMediaAttachments(value);
      const mergedAttachments = [...existingAttachments];

      for (const attachment of pastedAttachments) {
        if (!mergedAttachments.some((item) => item.url === attachment.url)) {
          mergedAttachments.push(attachment);
        }
      }

      updateContent(strippedText, mergedAttachments);
    },
    [value, updateContent]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      try {
        const item = await uploadMedia.mutateAsync(file);
        insertMedia(item);
      } catch (error) {
        const message = error instanceof Error ? error.message : t.media.uploadFailed;
        toast.error(message);
      }
    },
    [uploadMedia, insertMedia, t.media.uploadFailed]
  );

  return (
    <>
      <div
        className={cn(
          'relative flex min-h-0 flex-col rounded-xl border border-[#E8ECEF] bg-white shadow-sm lg:flex-1',
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleFileChange}
        />

        <Textarea
          ref={textareaRef}
          id={id}
          value={displayText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'min-h-[160px] resize-none border-0 bg-transparent px-4 pb-16 pt-4 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 sm:min-h-[200px] md:min-h-[240px] lg:min-h-0 lg:flex-1',
            attachments.length > 0 && 'pb-4'
          )}
        />

        {attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {attachments.map((attachment, index) => (
              <MediaAttachmentPreview
                key={`${index}-${attachment.url}`}
                attachment={attachment}
                onRemove={() => removeAttachment(index)}
                removeLabel={t.common.delete}
              />
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E8ECEF] px-3 py-2">
          <div className="flex flex-wrap items-center gap-0.5">
            <ToolbarButton
              icon={ImageIcon}
              label={pc.toolbarImageVideo}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            />
            <ToolbarButton icon={Smile} label={pc.toolbarEmoji} />
            <ToolbarButton icon={MessageCircle} label={pc.toolbarMessage} />
            <ToolbarButton icon={MapPin} label={pc.toolbarLocation} />
            <ToolbarButton icon={Link2} label={pc.toolbarLink} />
            <ToolbarButton icon={Tag} label={pc.toolbarTag} />
            <ToolbarButton
              icon={FolderOpen}
              label={pc.toolbarFolder}
              onClick={() => setLibraryOpen(true)}
              disabled={isUploading}
            />
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs tabular-nums',
              isOverLimit ? 'text-rose-600' : 'text-[#8B939E]'
            )}
          >
            {counterIcon}
            <span>
              {charCount.toLocaleString()}
              {charLimit !== undefined && ` / ${charLimit.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      <MediaPickerDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={insertMedia}
      />
    </>
  );
}

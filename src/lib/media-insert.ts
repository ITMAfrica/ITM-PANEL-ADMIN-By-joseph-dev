export interface MediaAttachment {
  name: string;
  url: string;
  isVideo: boolean;
  markdown: string;
}

const IMAGE_MD_PATTERN = /!\[([^\]]*)]\(([^)]+)\)/g;
const UPLOAD_VIDEO_MD_PATTERN = /\[([^\]]+)]\(([^)]*\/api\/uploads\/[^)]+)\)/g;

export function insertAtCursor(
  text: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number
): { nextValue: string; cursorPosition: number } {
  const before = text.slice(0, selectionStart);
  const after = text.slice(selectionEnd);
  const nextValue = `${before}${insertion}${after}`;
  const cursorPosition = selectionStart + insertion.length;
  return { nextValue, cursorPosition };
}

export function buildMediaMarkdown(name: string, url: string, mimeType?: string): string {
  const alt = name.replace(/\.[^.]+$/, '') || 'media';
  if (mimeType?.startsWith('video/')) {
    return `[${alt}](${url})\n`;
  }
  return `![${alt}](${url})\n`;
}

function withTrailingNewline(markdown: string, text: string, index: number): string {
  const nextChar = text[index + markdown.length];
  return nextChar === '\n' ? `${markdown}\n` : markdown;
}

export function extractMediaAttachments(text: string): MediaAttachment[] {
  const attachments: MediaAttachment[] = [];

  for (const match of text.matchAll(IMAGE_MD_PATTERN)) {
    const markdown = withTrailingNewline(match[0], text, match.index ?? 0);
    attachments.push({
      name: match[1] || 'media',
      url: match[2],
      isVideo: false,
      markdown,
    });
  }

  // Strip image markdown first — `![alt](url)` contains `[alt](url)` which would
  // otherwise match the upload video pattern and produce duplicate attachments.
  const textWithoutImages = text.replace(IMAGE_MD_PATTERN, '');

  for (const match of textWithoutImages.matchAll(UPLOAD_VIDEO_MD_PATTERN)) {
    const markdown = withTrailingNewline(match[0], textWithoutImages, match.index ?? 0);
    attachments.push({
      name: match[1] || 'media',
      url: match[2],
      isVideo: true,
      markdown,
    });
  }

  return attachments;
}

export function stripMediaMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)\n?/g, '')
    .replace(/\[[^\]]+]\([^)]*\/api\/uploads\/[^)]+\)\n?/g, '')
    .replace(/https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?\n?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

export function composeContentWithMedia(text: string, attachments: MediaAttachment[]): string {
  const cleanText = text.trimEnd();
  if (attachments.length === 0) return cleanText;

  const mediaBlock = attachments.map((attachment) => attachment.markdown.trimEnd()).join('\n');
  if (!cleanText) return `${mediaBlock}\n`;
  return `${cleanText}\n\n${mediaBlock}\n`;
}

export function getComposerDisplayLength(text: string): number {
  return stripMediaMarkdown(text).length;
}

export function extractFirstImageUrl(text: string): string | null {
  const markdownMatch = text.match(/!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/);
  if (markdownMatch?.[1]) return markdownMatch[1];
  const urlMatch = text.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?)/i);
  return urlMatch?.[1] ?? null;
}

export function extractPreviewImage(...texts: string[]): string | null {
  for (const text of texts) {
    const url = extractFirstImageUrl(text);
    if (url) return url;
  }
  return null;
}

export function formatContentPreview(text: string): { text: string; imageUrl: string | null } {
  return {
    text: stripMediaMarkdown(text),
    imageUrl: extractFirstImageUrl(text),
  };
}

import { signUploadUrl } from './media-access';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = escapeHtml(markdown);

  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt: string, url: string) =>
      `<img src="${url}" alt="${alt}" style="display:block;max-width:100%;height:auto;margin:18px 0;border-radius:10px;" />`
  );

  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text: string, url: string) => `<a href="${url}">${text}</a>`
  );

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const blocks = html.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^(\s*[-*]\s+.*)(\n\s*[-*]\s+.*)*$/.test(trimmed)) {
        const items = trimmed
          .split('\n')
          .map((line) => line.replace(/^\s*[-*]\s+(.*)$/, '$1').trim())
          .filter(Boolean)
          .map((item) => `<li style="margin:6px 0;">${item}</li>`)
          .join('');
        return `<ul style="padding-left:20px;margin:14px 0;">${items}</ul>`;
      }
      return `<p style="margin:0 0 16px;">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

const UPLOAD_SRC_RE = /(<img[^>]*\ssrc=")(\/api\/uploads\/[^"]+)(")/gi;

export async function signUploadImagesInHtml(html: string, appUrl: string): Promise<string> {
  const matches = [...html.matchAll(UPLOAD_SRC_RE)];
  if (matches.length === 0) return html;

  let result = html;
  for (const match of matches) {
    const path = match[2];
    const signed = await signUploadUrl(`${appUrl}${path}`);
    result = result.split(`"${path}"`).join(`"${signed}"`);
  }
  return result;
}

export async function renderNewsletterBody(markdown: string, appUrl: string): Promise<string> {
  const html = convertMarkdownToHtml(markdown);
  return signUploadImagesInHtml(html, appUrl);
}

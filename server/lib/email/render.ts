export interface RenderNewsletterInput {
  subject: string;
  body: string;
  sendId: string;
  appUrl: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function rewriteTrackedLinks(body: string, sendId: string, appUrl: string): string {
  const base = appUrl.replace(/\/$/, '');
  return body.replace(/href="([^"]+)"/g, (_match, href: string) => {
    if (href.startsWith('#') || href.startsWith('mailto:')) {
      return `href="${href}"`;
    }
    const encoded = encodeURIComponent(href);
    const clickUrl = `${base}/api/newsletters/track/click/${sendId}?url=${encoded}`;
    return `href="${clickUrl}"`;
  });
}

/**
 * Injects open-pixel + click tracking into an already-complete HTML email
 * (e.g. template sections) without changing its visual layout.
 */
export function injectTrackingIntoHtml(
  html: string,
  sendId: string,
  appUrl: string
): string {
  const base = appUrl.replace(/\/$/, '');
  const tracked = rewriteTrackedLinks(html, sendId, base);
  const pixel = `<img src="${base}/api/newsletters/track/open/${sendId}.png" width="1" height="1" alt="" style="display:none;" />`;
  if (/<\/body>/i.test(tracked)) {
    return tracked.replace(/<\/body>/i, `${pixel}</body>`);
  }
  return `${tracked}${pixel}`;
}

export function isCompleteHtmlDocument(html: string): boolean {
  return /^\s*<(!DOCTYPE\s+html|html\b)/i.test(html);
}

function extractLeadImage(body: string): { image: string; remaining: string } {
  const match = body.match(/^\s*(<img\b[^>]*>)/i);
  if (!match) {
    return { image: '', remaining: body };
  }
  return { image: match[1], remaining: body.slice(match[0].length) };
}

function responsiveImage(imgTag: string): string {
  const style = 'display:block;width:100%;max-width:600px;height:auto;';
  if (/style="/i.test(imgTag)) {
    return imgTag.replace(/style="([^"]*)"/i, `style="${style}$1"`);
  }
  return imgTag.replace(/<img/i, `<img style="${style}"`);
}

function defaultCoverBanner(title?: string, subtitle?: string): string {
  const bannerTitle = title && title.trim() ? escapeHtml(title) : 'ITM';
  const bannerSubtitle =
    subtitle && subtitle.trim() ? escapeHtml(subtitle) : "La newsletter de l'ITM";
  return `<td style="background:#4f46e5;background:linear-gradient(135deg,#4f46e5 0%,#5b21b6 52%,#0f766e 100%);padding:52px 28px;text-align:center;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:700;letter-spacing:4px;color:#ffffff;">${bannerTitle}</td></tr>
        <tr><td align="center"><div style="height:3px;width:64px;background:#10b981;margin:12px auto 0;"></div></td></tr>
        <tr><td align="center" style="padding-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c7d2fe;">${bannerSubtitle}</td></tr>
      </table>
    </td>`;
}

export function renderNewsletterHtml({
  subject,
  body,
  sendId,
  appUrl,
  headerTitle,
  headerSubtitle,
}: RenderNewsletterInput): string {
  const openPixel = `${appUrl.replace(/\/$/, '')}/api/newsletters/track/open/${sendId}.png`;
  const safeSubject = escapeHtml(subject);
  const trackedBody = rewriteTrackedLinks(body, sendId, appUrl);

  const { image, remaining } = extractLeadImage(trackedBody);
  const cover = image
    ? `<td style="padding:0;line-height:0;font-size:0;">${responsiveImage(image)}</td>`
    : defaultCoverBanner(headerTitle, headerSubtitle);

  const unsubscribeUrl = `${appUrl.replace(/\/$/, '')}/unsubscribe`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${safeSubject}</title></head>
  <body style="margin:0;padding:0;background:#eceef3;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eceef3;">
      <tr><td align="center" style="padding:28px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e7ef;">
          <tr>${cover}</tr>
          <tr>
            <td style="padding:34px 32px 10px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#10b981;font-weight:700;">Édition</div>
              <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;color:#221b33;font-weight:700;">${safeSubject}</h1>
              <div style="height:2px;width:48px;background:#4f46e5;margin:18px 0 24px;"></div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#2b2b35;">${remaining}</div>
            </td>
          </tr>
          <tr>
            <td style="background:#f7f8fc;border-top:3px solid #10b981;padding:24px 32px;">
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">Vous recevez cet email car vous êtes abonné à la newsletter ITM.</p>
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">Pour ne plus recevoir nos messages, <a href="${unsubscribeUrl}" style="color:#4f46e5;text-decoration:underline;">cliquez ici pour vous désabonner</a>.</p>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2px;color:#4f46e5;">ITM</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
    <img src="${openPixel}" width="1" height="1" alt="" style="display:none;" />
  </body>
</html>`;
}

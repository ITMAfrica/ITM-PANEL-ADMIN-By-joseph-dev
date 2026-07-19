import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { convertMarkdownToHtml, renderNewsletterBody } from '../lib/markdown';

process.env.AUTH_SECRET = 'test-secret-minimum-32-characters-long';

describe('convertMarkdownToHtml', () => {
  it('renders an image with an absolute https url', async () => {
    const html = convertMarkdownToHtml('![logo](https://cdn.test/logo.png)');
    assert.match(html, /<img src="https:\/\/cdn\.test\/logo\.png"/);
  });

  it('converts bold and links', () => {
    const html = convertMarkdownToHtml('**Important** voir [site](https://x.test)');
    assert.match(html, /<strong>Important<\/strong>/);
    assert.match(html, /<a href="https:\/\/x\.test">site<\/a>/);
  });

  it('wraps paragraphs', () => {
    const html = convertMarkdownToHtml('Bonjour le monde');
    assert.match(html, /<p style="margin:0 0 16px;">Bonjour le monde<\/p>/);
  });
});

describe('renderNewsletterBody', () => {
  const appUrl = 'https://panel.test';

  it('signs upload image urls so they load in email clients', async () => {
    const html = await renderNewsletterBody(
      '![photo](/api/uploads/tenant-a/photo.jpg)',
      appUrl
    );
    assert.match(html, /<img src="https:\/\/panel\.test\/api\/uploads\/tenant-a\/photo\.jpg\?token=/);
    assert.ok(!html.includes('src="/api/uploads/'));
  });

  it('leaves external image urls untouched', async () => {
    const html = await renderNewsletterBody(
      '![x](https://cdn.test/img.png)',
      appUrl
    );
    assert.match(html, /<img src="https:\/\/cdn\.test\/img\.png"/);
    assert.ok(!html.includes('token='));
  });
});

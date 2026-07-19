import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  injectTrackingIntoHtml,
  isCompleteHtmlDocument,
  renderNewsletterHtml,
} from '../lib/email/render';

describe('renderNewsletterHtml', () => {
  const body = '<p>Bonjour</p><a href="https://example.com/article">Lire</a>';
  const html = renderNewsletterHtml({
    subject: 'News',
    body,
    sendId: 'send-123',
    appUrl: 'https://panel.test',
  });

  it('includes the open-tracking pixel pointing at the send id', () => {
    assert.match(html, /track\/open\/send-123\.png/);
  });

  it('rewrites links to the click-tracking endpoint with the encoded url', () => {
    assert.match(html, /track\/click\/send-123\?url=https%3A%2F%2Fexample\.com%2Farticle/);
    assert.ok(!html.includes('href="https://example.com/article"'));
  });

  it('renders the subject and body content', () => {
    assert.match(html, /News/);
    assert.match(html, /Bonjour/);
  });

  it('ignores anchor-only links (no external url)', () => {
    const local = renderNewsletterHtml({
      subject: 's',
      body: '<a href="#section">Section</a>',
      sendId: 'send-x',
      appUrl: 'https://panel.test',
    });
    assert.ok(!local.includes('track/click/send-x'));
    assert.match(local, /href="#section"/);
  });
});

describe('injectTrackingIntoHtml', () => {
  it('preserves the template layout while adding open + click tracking', () => {
    const source = `<!DOCTYPE html><html><body><a href="https://example.com/x">Go</a></body></html>`;
    const html = injectTrackingIntoHtml(source, 'send-9', 'https://panel.test');
    assert.match(html, /track\/open\/send-9\.png/);
    assert.match(html, /track\/click\/send-9\?url=https%3A%2F%2Fexample\.com%2Fx/);
    assert.ok(isCompleteHtmlDocument(html));
  });
});

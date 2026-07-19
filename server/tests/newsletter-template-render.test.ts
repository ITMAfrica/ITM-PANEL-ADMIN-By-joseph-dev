import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseSections,
  renderSectionsToHtml,
  type NewsletterSection,
} from '../lib/newsletter-template-render';
import { resolveNewsletterHtml } from '../services/newsletter.service';

const sections: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'JULY NEWSLETTER',
    title: "Here's the latest from the Lab",
    subtitle: "Explore the future of AI with this month's drops and feature updates.",
    imageUrl: '',
  },
  { type: 'cta', label: 'Explore all experiments', href: 'https://x.test/go' },
  { type: 'band', label: 'Formation' },
  { type: 'footer', text: '© 2026 ITM HR' },
];

describe('parseSections', () => {
  it('returns null for non-JSON bodies', () => {
    assert.equal(parseSections('# Titre'), null);
    assert.equal(parseSections(''), null);
  });
  it('parses a JSON array of sections', () => {
    const parsed = parseSections(JSON.stringify(sections));
    assert.ok(Array.isArray(parsed));
    assert.equal(parsed?.[0].type, 'hero');
  });
});

describe('renderSectionsToHtml', () => {
  it('renders a Labs-style hero with cream bg, blobs and pill CTA', () => {
    const html = renderSectionsToHtml(sections);
    assert.match(html, /JULY NEWSLETTER/);
    assert.match(html, /Here's the latest from the Lab/);
    assert.match(html, /background:#F5F1E9/);
    assert.match(html, /41F28B|F98AF3/);
    assert.match(html, /Explore all experiments/);
    assert.match(html, /border-radius:999px/);
    assert.match(html, /background:#E9E1D7/);
    assert.match(html, /Formation/);
    assert.match(html, /href="https:\/\/x\.test\/go"/);
    assert.match(html, /© 2026 ITM HR/);
  });

  it('renders hero imageUrl when provided', () => {
    const withImage: NewsletterSection[] = [
      {
        type: 'hero',
        title: 'ITM',
        subtitle: 'Édition',
        imageUrl: 'https://cdn.test/hero.jpg',
      },
    ];
    const html = renderSectionsToHtml(withImage);
    assert.match(html, /src="https:\/\/cdn\.test\/hero\.jpg"/);
  });
});

describe('resolveNewsletterHtml', () => {
  it('renders JSON sections as a complete template document (no generic envelope)', async () => {
    const html = await resolveNewsletterHtml(
      { body: JSON.stringify(sections), templateId: null },
      'https://panel.test'
    );
    assert.match(html, /href="https:\/\/x\.test\/go"/);
    assert.match(html, /<!DOCTYPE html>/);
    assert.match(html, /background:#F5F1E9/);
    assert.doesNotMatch(html, /linear-gradient\(135deg,#4f46e5/);
  });

  it('falls back to markdown when body is plain text', async () => {
    const html = await resolveNewsletterHtml(
      { body: '**Titre**', templateId: null },
      'https://panel.test'
    );
    assert.match(html, /<strong>Titre<\/strong>/);
  });
});

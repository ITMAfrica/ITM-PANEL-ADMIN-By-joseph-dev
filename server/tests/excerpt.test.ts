import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deriveExcerpt, sectionsBodyToText } from '../lib/excerpt';

describe('sectionsBodyToText', () => {
  it('returns null for plain text bodies', () => {
    assert.equal(sectionsBodyToText('Un simple texte'), null);
  });

  it('returns null for invalid JSON', () => {
    assert.equal(sectionsBodyToText('[{broken'), null);
  });

  it('returns null for JSON that is not an array', () => {
    assert.equal(sectionsBodyToText('{"type":"hero"}'), null);
  });

  it('extracts text from section fields', () => {
    const body = JSON.stringify([
      { type: 'hero', title: 'Titre hero', subtitle: 'Sous-titre', imageUrl: '', label: 'LABEL' },
      { type: 'article', title: 'Bloc', imageUrl: '', text: 'Corps de texte' },
      { type: 'cta', label: 'Cliquez ici', href: 'https://example.com' },
      { type: 'calendar', items: ['📅 12 juillet', '📅 18 juillet'] },
      { type: 'footer', text: 'Pied de page' },
    ]);
    const text = sectionsBodyToText(body);
    assert.ok(text !== null);
    for (const expected of [
      'Titre hero',
      'Sous-titre',
      'LABEL',
      'Bloc',
      'Corps de texte',
      'Cliquez ici',
      '📅 12 juillet',
      'Pied de page',
    ]) {
      assert.ok(text.includes(expected), `missing: ${expected}`);
    }
  });

  it('returns empty string for an empty sections array', () => {
    assert.equal(sectionsBodyToText('[]'), '');
  });
});

describe('deriveExcerpt', () => {
  it('keeps historical markdown cleanup for text bodies', () => {
    const excerpt = deriveExcerpt('# Titre\n\nUn [lien](https://example.com) et ![img](https://x.co/i.png)');
    assert.equal(excerpt, 'Titre Un lien et');
  });

  it('derives readable text from a sections JSON body instead of raw JSON', () => {
    const body = JSON.stringify([
      { type: 'hero', title: 'Mon article', subtitle: '', imageUrl: '', label: '' },
      { type: 'article', title: '', imageUrl: '', text: 'Premier paragraphe.' },
    ]);
    const excerpt = deriveExcerpt(body);
    assert.equal(excerpt, 'Mon article Premier paragraphe.');
  });

  it('truncates sections text to 200 chars', () => {
    const body = JSON.stringify([
      { type: 'article', title: '', imageUrl: '', text: 'x'.repeat(500) },
    ]);
    assert.equal(deriveExcerpt(body).length, 200);
  });

  it('returns empty excerpt for empty sections', () => {
    assert.equal(deriveExcerpt('[]'), '');
  });
});

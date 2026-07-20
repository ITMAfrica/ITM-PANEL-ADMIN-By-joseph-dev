import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ConsoleMetaProvider, getMetaProvider } from '../lib/meta/provider';
import { encryptSecret, decryptSecret } from '../lib/crypto';
import { extractFirstImageUrl, stripMediaMarkdown } from '../services/social.service';
import {
  buildOAuthDialogUrl,
  createOAuthState,
  getMetaOAuthConfig,
  verifyOAuthState,
} from '../services/meta-connection.service';

process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? 'test-secret-minimum-32-characters-long';

describe('ConsoleMetaProvider', () => {
  it('returns an id and records the publish WITHOUT the access token', async () => {
    const provider = new ConsoleMetaProvider();
    const result = await provider.publishToPage({
      pageId: 'page-1',
      pageAccessToken: 'SUPER-SECRET-TOKEN',
      message: 'Hello Facebook',
    });

    assert.ok(result.id);
    assert.equal(provider.published.length, 1);
    assert.equal(provider.published[0].pageId, 'page-1');
    // Sécurité : le token ne doit jamais être conservé ni loggable via `published`.
    assert.ok(!JSON.stringify(provider.published[0]).includes('SUPER-SECRET-TOKEN'));
  });
});

describe('getMetaProvider', () => {
  it('returns ConsoleMetaProvider by default (no real publish without opt-in)', () => {
    delete process.env.META_PROVIDER;
    assert.ok(getMetaProvider() instanceof ConsoleMetaProvider);
  });
});

describe('crypto (AES-256-GCM)', () => {
  it('roundtrips a secret', () => {
    const encrypted = encryptSecret('page-access-token-123');
    assert.ok(encrypted.startsWith('v1:'));
    assert.ok(!encrypted.includes('page-access-token-123'));
    assert.equal(decryptSecret(encrypted), 'page-access-token-123');
  });

  it('produces a different ciphertext each time (random IV)', () => {
    assert.notEqual(encryptSecret('same'), encryptSecret('same'));
  });

  it('rejects tampered payloads', () => {
    const encrypted = encryptSecret('secret');
    const tampered = encrypted.replace(/.$/, 'A');
    assert.throws(() => decryptSecret(tampered));
  });

  it('rejects unsupported formats', () => {
    assert.throws(() => decryptSecret('not-encrypted'));
    assert.throws(() => decryptSecret('v0:a:b:c'));
  });

  it('uses META_TOKEN_ENCRYPTION_KEY when provided', () => {
    process.env.META_TOKEN_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    try {
      const encrypted = encryptSecret('with-explicit-key');
      assert.equal(decryptSecret(encrypted), 'with-explicit-key');
    } finally {
      delete process.env.META_TOKEN_ENCRYPTION_KEY;
    }
  });
});

describe('social message helpers', () => {
  it('extracts the first image URL from markdown', () => {
    const body = 'Hello ![visuel](https://cdn.example.com/img.png) world ![other](https://cdn.example.com/2.png)';
    assert.equal(extractFirstImageUrl(body), 'https://cdn.example.com/img.png');
  });

  it('returns null when there is no image', () => {
    assert.equal(extractFirstImageUrl('text only'), null);
  });

  it('strips media markdown from the message', () => {
    const body = 'Avant ![visuel](https://cdn.example.com/img.png) après';
    const stripped = stripMediaMarkdown(body);
    assert.ok(!stripped.includes('!['));
    assert.ok(!stripped.includes('cdn.example.com'));
    assert.ok(stripped.includes('Avant'));
    assert.ok(stripped.includes('après'));
  });
});

describe('Meta OAuth', () => {
  it('returns null config when META_APP_ID / META_APP_SECRET are missing', () => {
    delete process.env.META_APP_ID;
    delete process.env.META_APP_SECRET;
    assert.equal(getMetaOAuthConfig(), null);
  });

  it('builds a dialog url with client_id, redirect_uri, scopes and state', () => {
    process.env.META_APP_ID = 'app-123';
    process.env.META_APP_SECRET = 'secret-456';
    try {
      const url = buildOAuthDialogUrl(getMetaOAuthConfig()!, 'state-token');
      assert.ok(url.includes('dialog/oauth'));
      assert.ok(url.includes('client_id=app-123'));
      assert.ok(url.includes('state=state-token'));
      assert.ok(url.includes('pages_manage_posts'));
      assert.ok(url.includes(encodeURIComponent('/api/meta/oauth/callback')));
    } finally {
      delete process.env.META_APP_ID;
      delete process.env.META_APP_SECRET;
    }
  });

  it('roundtrips the OAuth state JWT and binds the tenant', async () => {
    const state = await createOAuthState('tenant-1', 'user-1');
    const payload = await verifyOAuthState(state);
    assert.deepEqual(payload, { tenantId: 'tenant-1', userId: 'user-1' });
  });

  it('rejects forged or garbage states', async () => {
    assert.equal(await verifyOAuthState('garbage'), null);
    const other = await createOAuthState('tenant-2', 'user-2');
    const payload = await verifyOAuthState(other);
    assert.notEqual(payload?.tenantId, 'tenant-1');
  });
});

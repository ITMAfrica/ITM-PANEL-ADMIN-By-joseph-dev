import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { Express } from 'express';
import request from 'supertest';

process.env.AUTH_SECRET = 'test-secret-minimum-32-characters-long';
process.env.PUBLIC_API_KEY = 'test-api-key';
process.env.ALLOW_PUBLIC_REGISTER = 'false';
process.env.NODE_ENV = 'test';

let app: Express;

before(async () => {
  const { createApp } = await import('../app');
  app = createApp();
});

describe('GET /api/newsletters/track/open/:sendId.png', () => {
  it('returns a 1x1 PNG without requiring auth', async () => {
    const res = await request(app).get('/api/newsletters/track/open/any-send-id.png');
    assert.notEqual(res.status, 401);
    assert.match(res.headers['content-type'] ?? '', /image\/png/);
    assert.ok(res.body.length > 0);
  });
});

describe('GET /api/newsletters/track/click/:sendId', () => {
  it('redirects to a valid http(s) url', async () => {
    const res = await request(app).get(
      '/api/newsletters/track/click/any-send-id?url=' + encodeURIComponent('https://example.com')
    );
    assert.notEqual(res.status, 401);
    assert.ok(res.status === 302 || res.status === 301);
    assert.equal(res.headers.location, 'https://example.com');
  });

  it('rejects an invalid target url', async () => {
    const res = await request(app).get(
      '/api/newsletters/track/click/any-send-id?url=' + encodeURIComponent('javascript:alert(1)')
    );
    assert.ok(res.status === 400 || res.status === 302);
  });
});

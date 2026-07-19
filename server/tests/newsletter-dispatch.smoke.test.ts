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

describe('POST /api/newsletters/dispatch', () => {
  it('denies access without API key', async () => {
    const res = await request(app).post('/api/newsletters/dispatch');
    assert.equal(res.status, 401);
  });

  it('accepts the configured PUBLIC_API_KEY (200 or 500 if DB is down, never 401)', async () => {
    const res = await request(app)
      .post('/api/newsletters/dispatch')
      .set('X-Api-Key', 'test-api-key');
    assert.notEqual(res.status, 401);
  });
});

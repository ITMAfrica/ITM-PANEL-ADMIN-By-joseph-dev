import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { Express } from 'express';
import request from 'supertest';
import { createUploadAccessToken } from '../lib/media-access';

process.env.AUTH_SECRET = 'test-secret-minimum-32-characters-long';
process.env.PUBLIC_API_KEY = 'test-api-key';
process.env.ALLOW_PUBLIC_REGISTER = 'false';
process.env.NODE_ENV = 'test';

let app: Express;

before(async () => {
  const { createApp } = await import('../app');
  app = createApp();
});

describe('API security smoke tests', () => {
  it('GET /api returns health payload', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Hello, world!');
  });

  it('GET /api/uploads denies access without credentials', async () => {
    const res = await request(app).get('/api/uploads/tenant-a/photo.jpg');
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Unauthorized');
  });

  it('GET /api/uploads denies access with invalid token', async () => {
    const res = await request(app)
      .get('/api/uploads/tenant-a/photo.jpg')
      .query({ token: 'invalid-token' });
    assert.equal(res.status, 401);
  });

  it('GET /api/uploads returns 404 for valid token but missing file', async () => {
    const token = await createUploadAccessToken('tenant-a', 'photo.jpg');
    const res = await request(app)
      .get('/api/uploads/tenant-a/photo.jpg')
      .query({ token });
    assert.equal(res.status, 404);
  });

  it('POST /api/auth/login rejects invalid body', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
    assert.ok(Array.isArray(res.body.details));
  });

  it('POST /api/auth/register is disabled when ALLOW_PUBLIC_REGISTER=false', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      name: 'New User',
      password: 'secret12',
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Registration is disabled');
  });

  it('POST /api/track/view requires API key when PUBLIC_API_KEY is set', async () => {
    const res = await request(app).post('/api/track/view').send({
      contentId: 'content-1',
      siteId: 'site-1',
    });
    assert.equal(res.status, 401);
  });

  it('POST /api/track/view accepts configured PUBLIC_API_KEY', async () => {
    const res = await request(app)
      .post('/api/track/view')
      .set('X-Api-Key', 'test-api-key')
      .send({
        contentId: 'content-1',
        siteId: 'site-1',
      });
    assert.notEqual(res.status, 401);
  });

  it('POST /api/track/acknowledge requires API key', async () => {
    const res = await request(app).post('/api/track/acknowledge').send({
      contentId: 'content-1',
      siteId: 'site-1',
    });
    assert.equal(res.status, 401);
  });

  it('GET /api/dashboard/trends requires authentication', async () => {
    const res = await request(app).get('/api/dashboard/trends').query({ tenantId: 't1' });
    assert.equal(res.status, 401);
  });
});

describe('register policy', () => {
  it('is disabled in production by default', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousAllow = process.env.ALLOW_PUBLIC_REGISTER;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_PUBLIC_REGISTER;

    const { isPublicRegisterEnabled } = await import('../lib/register-policy');
    assert.equal(isPublicRegisterEnabled(), false);

    process.env.NODE_ENV = previousNodeEnv;
    if (previousAllow === undefined) delete process.env.ALLOW_PUBLIC_REGISTER;
    else process.env.ALLOW_PUBLIC_REGISTER = previousAllow;
  });
});

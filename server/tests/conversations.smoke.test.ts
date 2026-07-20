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

describe('Conversations API smoke tests', () => {
  it('GET /api/conversations requires auth', async () => {
    const res = await request(app).get('/api/conversations');
    assert.equal(res.status, 401);
  });

  it('GET /api/conversations/:id/messages requires auth', async () => {
    const res = await request(app).get('/api/conversations/conv-1/messages');
    assert.equal(res.status, 401);
  });

  it('POST /api/conversations/:id/reply requires auth', async () => {
    const res = await request(app)
      .post('/api/conversations/conv-1/reply')
      .send({ message: 'Bonjour' });
    assert.equal(res.status, 401);
  });

  it('PATCH /api/conversations/:id requires auth', async () => {
    const res = await request(app)
      .patch('/api/conversations/conv-1')
      .send({ status: 'resolved' });
    assert.equal(res.status, 401);
  });

  it('POST /api/conversations/sync requires auth', async () => {
    const res = await request(app).post('/api/conversations/sync').send({});
    assert.equal(res.status, 401);
  });
});

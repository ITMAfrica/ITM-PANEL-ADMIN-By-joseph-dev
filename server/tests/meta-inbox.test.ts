import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ConsoleMetaProvider } from '../lib/meta/provider';
import { GraphApiMetaProvider } from '../lib/meta/graph-api.provider';

describe('ConsoleMetaProvider inbox simulation', () => {
  it('returns a deterministic fake comment per post, without any token', async () => {
    const provider = new ConsoleMetaProvider();
    const first = await provider.listPostComments({
      pageId: 'page-1',
      pageAccessToken: 'SECRET',
      postId: 'post-1',
    });
    assert.equal(first.length, 1);
    assert.equal(first[0].id, 'cmt-post-1-1');
    assert.ok(first[0].authorName.length > 0);
    assert.ok(!JSON.stringify(first).includes('SECRET'));

    // Deuxième appel : mêmes commentaires (pas de duplication infinie).
    const second = await provider.listPostComments({
      pageId: 'page-1',
      pageAccessToken: 'SECRET',
      postId: 'post-1',
    });
    assert.equal(second.length, 1);
    assert.equal(second[0].id, first[0].id);
  });

  it('attaches replies to the simulated thread for later syncs', async () => {
    const provider = new ConsoleMetaProvider();
    await provider.listPostComments({ pageId: 'p', pageAccessToken: 'SECRET', postId: 'post-2' });
    const result = await provider.replyToComment({
      pageAccessToken: 'SECRET',
      commentId: 'cmt-post-2-1',
      message: 'Merci pour votre commentaire !',
    });
    assert.ok(result.id);
    assert.equal(provider.replies.length, 1);
    assert.equal(provider.replies[0].commentId, 'cmt-post-2-1');
    assert.ok(!JSON.stringify(provider.replies).includes('SECRET'));

    const comments = await provider.listPostComments({
      pageId: 'p',
      pageAccessToken: 'SECRET',
      postId: 'post-2',
    });
    assert.equal(comments[0].replies.length, 1);
    assert.equal(comments[0].replies[0].message, 'Merci pour votre commentaire !');
  });
});

describe('GraphApiMetaProvider.listPostComments', () => {
  const okResponse = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      data: [
        {
          id: 'c1',
          message: 'Top !',
          from: { id: 'user-1', name: 'Marie' },
          created_time: '2026-07-19T10:00:00+0000',
          comments: {
            data: [
              {
                id: 'c1-r1',
                message: 'Merci !',
                from: { id: 'page-9', name: 'Ma Page' },
                created_time: '2026-07-19T10:05:00+0000',
              },
            ],
          },
        },
        {
          id: 'c2',
          message: 'Intéressant',
          created_time: '2026-07-19T11:00:00+0000',
        },
      ],
    }),
  };

  it('parses top-level and nested comments, with fallback author name', async () => {
    let calledUrl = '';
    const provider = new GraphApiMetaProvider({
      appSecret: 'app-secret',
      fetchImpl: async (url) => {
        calledUrl = url;
        return okResponse;
      },
    });
    const comments = await provider.listPostComments({
      pageId: 'page-9',
      pageAccessToken: 'token-1',
      postId: 'post-1',
    });

    assert.ok(calledUrl.includes('/post-1/comments?'));
    assert.ok(calledUrl.includes('access_token=token-1'));
    assert.ok(calledUrl.includes('appsecret_proof='));

    assert.equal(comments.length, 2);
    assert.equal(comments[0].authorName, 'Marie');
    assert.equal(comments[0].replies.length, 1);
    assert.equal(comments[0].replies[0].authorName, 'Ma Page');
    // Profil absent (from manquant) → nom de repli, authorId null.
    assert.equal(comments[1].authorId, null);
    assert.equal(comments[1].authorName, 'Utilisateur Facebook');
  });

  it('throws on Graph API errors', async () => {
    const provider = new GraphApiMetaProvider({
      fetchImpl: async () => ({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'Invalid OAuth access token' } }),
      }),
    });
    await assert.rejects(
      provider.listPostComments({ pageId: 'p', pageAccessToken: 't', postId: 'x' }),
      /Invalid OAuth access token/
    );
  });
});

describe('GraphApiMetaProvider.replyToComment', () => {
  it('posts the message to /{commentId}/comments and returns the id', async () => {
    let calledUrl = '';
    let calledBody = '';
    const provider = new GraphApiMetaProvider({
      fetchImpl: async (url, init) => {
        calledUrl = url;
        calledBody = init.body ?? '';
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ id: 'reply-1' }),
        };
      },
    });
    const result = await provider.replyToComment({
      pageAccessToken: 'token-1',
      commentId: 'c1',
      message: 'Réponse de la Page',
    });
    assert.equal(result.id, 'reply-1');
    assert.ok(calledUrl.includes('/c1/comments'));
    assert.ok(calledBody.includes('access_token=token-1'));
    assert.ok(calledBody.includes('message='));
  });
});

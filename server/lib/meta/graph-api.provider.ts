import crypto from 'crypto';
import type {
  MetaComment,
  MetaCommentReply,
  MetaListCommentsInput,
  MetaPublishInput,
  MetaPublishResult,
  MetaProvider,
  MetaReplyInput,
} from './provider';

type FetchImpl = (
  url: string,
  init: { method: string; headers?: Record<string, string>; body?: string }
) => Promise<{ ok: boolean; status: number; statusText: string; json(): Promise<unknown> }>;

export interface GraphApiMetaProviderOptions {
  apiVersion?: string;
  appSecret?: string;
  baseUrl?: string;
  fetchImpl?: FetchImpl;
}

interface GraphApiErrorBody {
  error?: { message?: string; code?: number; error_subcode?: number };
}

interface GraphRawComment {
  id: string;
  message?: string;
  from?: { id?: string; name?: string };
  created_time?: string;
  comments?: { data?: GraphRawComment[] };
}

/**
 * Publie sur une Page Facebook via la Graph API.
 * - texte + lien        → POST /{page-id}/feed
 * - texte + image (URL) → POST /{page-id}/photos (caption)
 * Le token est signé avec appsecret_proof (HMAC-SHA256) quand META_APP_SECRET
 * est disponible, comme recommandé par Meta.
 */
export class GraphApiMetaProvider implements MetaProvider {
  private readonly apiVersion: string;
  private readonly appSecret: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchImpl;

  constructor(options: GraphApiMetaProviderOptions = {}) {
    this.apiVersion = options.apiVersion ?? process.env.META_GRAPH_API_VERSION ?? 'v23.0';
    this.appSecret = options.appSecret ?? process.env.META_APP_SECRET;
    this.baseUrl = (options.baseUrl ?? 'https://graph.facebook.com').replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? (globalThis.fetch as unknown as FetchImpl);
  }

  private appSecretProof(token: string): string | null {
    if (!this.appSecret) return null;
    return crypto.createHmac('sha256', this.appSecret).update(token).digest('hex');
  }

  private authParams(token: string): URLSearchParams {
    const params = new URLSearchParams();
    params.set('access_token', token);
    const proof = this.appSecretProof(token);
    if (proof) params.set('appsecret_proof', proof);
    return params;
  }

  private async parseResponse(res: Awaited<ReturnType<FetchImpl>>) {
    const data = (await res.json().catch(() => ({}))) as GraphApiErrorBody & {
      id?: string;
      post_id?: string;
      data?: GraphRawComment[];
    };
    if (!res.ok || data.error) {
      throw new Error(
        `Meta Graph API error (${res.status}): ${data.error?.message ?? res.statusText}`
      );
    }
    return data;
  }

  async publishToPage(input: MetaPublishInput): Promise<MetaPublishResult> {
    const params = this.authParams(input.pageAccessToken);

    let path: string;
    if (input.imageUrl) {
      path = `/${encodeURIComponent(input.pageId)}/photos`;
      params.set('url', input.imageUrl);
      params.set('caption', input.message);
    } else {
      path = `/${encodeURIComponent(input.pageId)}/feed`;
      params.set('message', input.message);
      if (input.link) params.set('link', input.link);
    }

    const res = await this.fetchImpl(`${this.baseUrl}/${this.apiVersion}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await this.parseResponse(res);
    const id = data.post_id ?? data.id;
    if (!id) {
      throw new Error('Meta Graph API: missing post id in response');
    }
    return { id };
  }

  async listPostComments(input: MetaListCommentsInput): Promise<MetaComment[]> {
    const params = this.authParams(input.pageAccessToken);
    params.set(
      'fields',
      'id,from{id,name},message,created_time,comments.limit(50){id,from{id,name},message,created_time}'
    );
    params.set('limit', '100');

    const res = await this.fetchImpl(
      `${this.baseUrl}/${this.apiVersion}/${encodeURIComponent(input.postId)}/comments?${params.toString()}`,
      { method: 'GET' }
    );
    const data = await this.parseResponse(res);

    const mapReply = (raw: GraphRawComment): MetaCommentReply => ({
      id: raw.id,
      message: raw.message ?? '',
      authorId: raw.from?.id ?? null,
      authorName: raw.from?.name ?? 'Utilisateur Facebook',
      createdTime: raw.created_time ?? new Date(0).toISOString(),
    });

    return (data.data ?? []).map((raw) => ({
      ...mapReply(raw),
      replies: (raw.comments?.data ?? []).map(mapReply),
    }));
  }

  async replyToComment(input: MetaReplyInput): Promise<MetaPublishResult> {
    const params = this.authParams(input.pageAccessToken);
    params.set('message', input.message);

    const res = await this.fetchImpl(
      `${this.baseUrl}/${this.apiVersion}/${encodeURIComponent(input.commentId)}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );
    const data = await this.parseResponse(res);
    if (!data.id) {
      throw new Error('Meta Graph API: missing comment id in response');
    }
    return { id: data.id };
  }
}

export interface MetaPublishInput {
  pageId: string;
  /** Page access token DÉCHIFFRÉ — ne jamais le logger. */
  pageAccessToken: string;
  message: string;
  link?: string | null;
  imageUrl?: string | null;
}

export interface MetaPublishResult {
  /** Identifiant du post retourné par la Graph API (ou synthétique en console). */
  id: string;
}

export interface MetaCommentReply {
  /** Id du commentaire sur la plateforme. */
  id: string;
  message: string;
  /** Null si l'utilisateur a restreint/supprimé son profil. */
  authorId: string | null;
  authorName: string;
  /** ISO-8601. */
  createdTime: string;
}

export interface MetaComment extends MetaCommentReply {
  /** Réponses imbriquées (dont celles de notre Page). */
  replies: MetaCommentReply[];
}

export interface MetaListCommentsInput {
  pageId: string;
  pageAccessToken: string;
  postId: string;
}

export interface MetaReplyInput {
  pageAccessToken: string;
  /** Id du commentaire racine auquel répondre (le fil). */
  commentId: string;
  message: string;
}

export interface MetaProvider {
  publishToPage(input: MetaPublishInput): Promise<MetaPublishResult>;
  listPostComments(input: MetaListCommentsInput): Promise<MetaComment[]>;
  replyToComment(input: MetaReplyInput): Promise<MetaPublishResult>;
}

import { GraphApiMetaProvider } from './graph-api.provider';
export { GraphApiMetaProvider };

export class ConsoleMetaProvider implements MetaProvider {
  public readonly published: Omit<MetaPublishInput, 'pageAccessToken'>[] = [];
  public readonly replies: { commentId: string; message: string }[] = [];
  /** Commentaires simulés par postId — rend toute la chaîne inbox testable sans app Meta. */
  private readonly fakeComments = new Map<string, MetaComment[]>();

  async publishToPage(input: MetaPublishInput): Promise<MetaPublishResult> {
    const { pageAccessToken: _token, ...safe } = input;
    this.published.push(safe);
    const id = `fb-console-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.info(
      `[meta:console] page=${input.pageId} chars=${input.message.length} ` +
        `image=${input.imageUrl ? 'yes' : 'no'} postId=${id}`
    );
    return { id };
  }

  async listPostComments(input: MetaListCommentsInput): Promise<MetaComment[]> {
    let comments = this.fakeComments.get(input.postId);
    if (!comments) {
      comments = [
        {
          id: `cmt-${input.postId}-1`,
          message: "Bonjour ! Publication très intéressante, pouvez-vous m'en dire plus ?",
          authorId: 'console-user-1',
          authorName: 'Jean Testeur',
          createdTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          replies: [],
        },
      ];
      this.fakeComments.set(input.postId, comments);
    }
    return comments;
  }

  async replyToComment(input: MetaReplyInput): Promise<MetaPublishResult> {
    this.replies.push({ commentId: input.commentId, message: input.message });
    const id = `cmt-reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Rattache la réponse au fil simulé : les synchros suivantes la voient
    // (dédoublonnée côté service grâce à l'externalId).
    for (const comments of this.fakeComments.values()) {
      const parent = comments.find((c) => c.id === input.commentId);
      if (parent) {
        parent.replies.push({
          id,
          message: input.message,
          authorId: 'console-page',
          authorName: 'Votre Page',
          createdTime: new Date().toISOString(),
        });
      }
    }
    console.info(
      `[meta:console] reply comment=${input.commentId} chars=${input.message.length} replyId=${id}`
    );
    return { id };
  }
}

let cached: MetaProvider | undefined;

export function getMetaProvider(): MetaProvider {
  if (cached) return cached;

  switch (process.env.META_PROVIDER) {
    case 'graph-api':
      cached = new GraphApiMetaProvider();
      break;
    case 'console':
    case undefined:
    default:
      // Par défaut on ne publie rien réellement : il faut META_PROVIDER=graph-api.
      cached = new ConsoleMetaProvider();
      break;
  }

  return cached;
}

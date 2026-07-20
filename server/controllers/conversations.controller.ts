import type { Request, Response } from 'express';
import { parseBody } from '../lib/validate';
import { conversationReplySchema, conversationUpdateSchema } from '../lib/schemas';
import * as conversationService from '../services/conversation.service';
import { syncTenantInboxes } from '../services/social-inbox-sync.service';

export async function list(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const status = req.query.status as string | undefined;
    const platform = req.query.platform as string | undefined;
    const unreadRaw = req.query.unread as string | undefined;
    const rows = await conversationService.listConversations(tenantId, {
      status: status === 'unresolved' || status === 'resolved' ? status : undefined,
      platform: platform?.trim() || undefined,
      unread: unreadRaw === 'true' ? true : unreadRaw === 'false' ? false : undefined,
    });
    res.json(rows);
  } catch (error) {
    console.error('GET /api/conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

export async function messages(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const rows = await conversationService.listMessages(tenantId, req.params.id as string);
    if (!rows) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(rows);
  } catch (error) {
    console.error('GET /api/conversations/:id/messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export async function reply(req: Request, res: Response) {
  try {
    const body = parseBody(conversationReplySchema, req, res);
    if (!body) return;
    const tenantId = req.authorizedTenantId!;
    const created = await conversationService.replyToConversation(
      tenantId,
      req.params.id as string,
      body.message
    );
    if (!created) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof Error && error.message === 'connection_not_active') {
      res.status(409).json({ error: 'Connection is not active' });
      return;
    }
    console.error('POST /api/conversations/:id/reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const body = parseBody(conversationUpdateSchema, req, res);
    if (!body) return;
    const tenantId = req.authorizedTenantId!;
    const row = await conversationService.updateConversation(tenantId, req.params.id as string, body);
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(row);
  } catch (error) {
    console.error('PATCH /api/conversations/:id:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
}

/** Synchro manuelle (bouton "Actualiser") — ignore le throttle, force=false par défaut côté scheduler. */
export async function sync(req: Request, res: Response) {
  try {
    const tenantId = req.authorizedTenantId!;
    const result = await syncTenantInboxes(tenantId, { force: true });
    res.json(result);
  } catch (error) {
    console.error('POST /api/conversations/sync:', error);
    res.status(500).json({ error: 'Failed to sync conversations' });
  }
}

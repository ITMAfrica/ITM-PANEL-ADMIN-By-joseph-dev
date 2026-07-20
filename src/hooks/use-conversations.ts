'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { InboxSyncResult, SocialConversation, SocialMessage } from '@/lib/types';

export function useConversations(tenantId: string) {
  return useQuery({
    queryKey: ['conversations', tenantId],
    queryFn: async (): Promise<SocialConversation[]> => {
      const res = await apiFetch(`/conversations?tenantId=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
    enabled: !!tenantId,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async (): Promise<SocialMessage[]> => {
      const res = await apiFetch(`/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!conversationId,
  });
}

export function useReplyToConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const res = await apiFetch(`/conversations/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      return res.json() as Promise<SocialMessage>;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['conversation-messages', vars.id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tenantId,
      data,
    }: {
      id: string;
      tenantId: string;
      data: { status?: 'unresolved' | 'resolved'; unread?: boolean };
    }) => {
      const res = await apiFetch(`/conversations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...data, tenantId }),
      });
      if (!res.ok) throw new Error('Failed to update conversation');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSyncConversations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const res = await apiFetch('/conversations/sync', {
        method: 'POST',
        body: JSON.stringify({ tenantId }),
      });
      if (!res.ok) throw new Error('Failed to sync conversations');
      return res.json() as Promise<InboxSyncResult>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
}

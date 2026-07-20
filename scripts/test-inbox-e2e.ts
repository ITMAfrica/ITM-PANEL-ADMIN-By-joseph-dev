/**
 * Test E2E de la boîte de réception sociale — SANS app Meta (ConsoleMetaProvider).
 *
 * Chaîne validée contre la vraie base de dev :
 *   fixtures (connexion + canal + post publié) → synchro → 1 conversation/1 message
 *   → réponse in-app → re-synchro → dédoublonnage (0 nouveau) → fil complet
 *
 * Usage : node --env-file=.env --import tsx scripts/test-inbox-e2e.ts
 * Le script crée ses propres fixtures et les supprime à la fin.
 */
import assert from 'node:assert/strict';
import { db } from '../server/lib/prisma';
import { encryptSecret } from '../server/lib/crypto';
import { ConsoleMetaProvider } from '../server/lib/meta/provider';
import { syncTenantInboxes } from '../server/services/social-inbox-sync.service';
import {
  listConversations,
  listMessages,
  replyToConversation,
} from '../server/services/conversation.service';

async function main() {
  const tenant = await db.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!tenant) {
    throw new Error("Aucun workspace en base — lancez d'abord l'app et créez un compte.");
  }
  const site = await db.site.findFirst({ where: { tenantId: tenant.id } });
  if (!site) {
    throw new Error('Aucun site pour ce workspace — connectez un site dans Settings d\'abord.');
  }

  const provider = new ConsoleMetaProvider();
  const marker = `e2e-${Date.now()}`;

  const connection = await db.socialConnection.create({
    data: {
      tenantId: tenant.id,
      platform: 'facebook',
      pageId: `page-${marker}`,
      pageName: 'Page E2E',
      pageAccessToken: encryptSecret('token-e2e'),
      status: 'connected',
    },
  });
  const channel = await db.distributionChannel.create({
    data: {
      tenantId: tenant.id,
      name: 'Page E2E',
      type: 'social',
      icon: 'facebook',
      socialConnectionId: connection.id,
    },
  });
  const content = await db.content.create({
    data: {
      id: `cnt-${marker}`,
      type: 'social',
      status: 'published',
      title: 'Post E2E inbox',
      body: 'Contenu de test E2E',
      tenantId: tenant.id,
      siteId: site.id,
      scheduledAt: new Date(),
      metadata: {
        facebook: { [channel.id]: { postId: `post-${marker}`, publishedAt: new Date().toISOString() } },
      },
    },
  });

  try {
    // 1. Première synchro → le commentaire simulé arrive en inbox.
    const sync1 = await syncTenantInboxes(tenant.id, { provider, force: true });
    console.log('→ sync1:', JSON.stringify(sync1));
    assert.equal(sync1.newConversations, 1, 'sync1.newConversations');
    assert.equal(sync1.newMessages, 1, 'sync1.newMessages');

    // 2. La conversation est visible côté lecture.
    const conversations = await listConversations(tenant.id, {});
    const conversation = conversations.find((c) => c.externalPostId === `post-${marker}`);
    assert.ok(conversation, 'conversation non trouvée dans la liste');
    assert.equal(conversation.unread, true);
    assert.equal(conversation.status, 'unresolved');
    assert.ok(conversation.preview.length > 0);
    console.log(`→ conversation: "${conversation.authorName}" — ${conversation.preview}`);

    // 3. Réponse in-app (outbound).
    const reply = await replyToConversation(
      tenant.id,
      conversation.id,
      'Merci pour votre message !',
      { provider }
    );
    assert.ok(reply, 'reply null');
    assert.equal(reply.direction, 'outbound');
    console.log('→ réponse enregistrée:', reply.id);

    // 4. Re-synchro → dédoublonnage intégral (ni doublon, ni régression unread).
    const sync2 = await syncTenantInboxes(tenant.id, { provider, force: true });
    console.log('→ sync2:', JSON.stringify(sync2));
    assert.equal(sync2.newConversations, 0, 'sync2.newConversations');
    assert.equal(sync2.newMessages, 0, 'sync2.newMessages');

    // 5. Le fil complet : 2 messages (1 inbound, 1 outbound), ordre chronologique.
    const messages = await listMessages(tenant.id, conversation.id);
    assert.ok(messages, 'messages null');
    assert.equal(messages.length, 2, 'messages.length');
    assert.equal(messages[0].direction, 'inbound');
    assert.equal(messages[1].direction, 'outbound');
    console.log(`→ fil: [${messages.map((m) => m.direction).join(' → ')}]`);

    console.log('\n✅ E2E inbox : toute la chaîne est fonctionnelle.');
  } finally {
    // Nettoyage (la connexion cascade conversations + messages).
    await db.socialConnection.delete({ where: { id: connection.id } });
    await db.distributionChannel.delete({ where: { id: channel.id } });
    await db.content.delete({ where: { id: content.id } });
    await db.$disconnect();
  }
}

main().catch(async (error) => {
  console.error('❌ E2E inbox échoué:', error);
  await db.$disconnect();
  process.exit(1);
});

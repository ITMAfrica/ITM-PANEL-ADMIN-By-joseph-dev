import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Rattrapage : rattache tous les abonnés `subscribed` d'un tenant à un ou
 * plusieurs canaux de distribution, en recréant les SubscriptionSource et
 * Subscription manquants.
 *
 * À utiliser quand des canaux ont été créés hors du flux applicatif (ex. en
 * base directement) et n'ont donc ni source ni abonnés — ce qui bloque
 * silencieusement l'envoi des newsletters sur ces canaux.
 *
 * Usage (depuis le conteneur api) :
 *   docker compose exec api npx tsx scripts/backfill-channel-subscriptions.ts <channelId> [channelId...]
 *   docker compose exec api npx tsx scripts/backfill-channel-subscriptions.ts --tenant <tenantId>
 */

const db = new PrismaClient();

async function ensureSubscriptionSource(channelId: string, tenantId: string) {
  return db.subscriptionSource.upsert({
    where: { channelId_formKey: { channelId, formKey: 'default' } },
    update: {},
    create: {
      id: `src_${channelId}`,
      tenantId,
      channelId,
      formKey: 'default',
      type: 'site',
    },
  });
}

async function backfillChannel(channelId: string) {
  const channel = await db.distributionChannel.findUnique({ where: { id: channelId } });
  if (!channel) {
    console.warn(`[backfill] canal introuvable: ${channelId} — ignoré.`);
    return;
  }

  const source = await ensureSubscriptionSource(channelId, channel.tenantId);

  const subscribers = await db.subscriber.findMany({
    where: { tenantId: channel.tenantId, status: 'subscribed' },
  });

  let attached = 0;
  for (const subscriber of subscribers) {
    try {
      await db.subscription.upsert({
        where: {
          subscriberId_channelId: {
            subscriberId: subscriber.id,
            channelId,
          },
        },
        update: { status: 'subscribed' },
        create: {
          subscriberId: subscriber.id,
          sourceId: source.id,
          channelId,
          status: 'subscribed',
        },
      });
      attached += 1;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        attached += 1;
        continue;
      }
      throw error;
    }
  }

  const subscriberCount = await db.subscription.count({
    where: { channelId, status: 'subscribed' },
  });
  await db.distributionChannel.update({
    where: { id: channelId },
    data: { subscriberCount },
  });

  console.info(
    `[backfill] canal ${channelId} (${channel.name}): ${attached}/${subscribers.length} abonné(s) rattaché(s), total actif = ${subscriberCount}.`
  );
}

async function backfillTenant(tenantId: string) {
  const channels = await db.distributionChannel.findMany({ where: { tenantId } });
  if (channels.length === 0) {
    console.warn(`[backfill] aucun canal pour le tenant ${tenantId}.`);
    return;
  }
  console.info(`[backfill] tenant ${tenantId}: ${channels.length} canal(x) à traiter.`);
  for (const channel of channels) {
    await backfillChannel(channel.id);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      'Usage:\n' +
        '  npx ts-node scripts/backfill-channel-subscriptions.ts <channelId> [channelId...]\n' +
        '  npx ts-node scripts/backfill-channel-subscriptions.ts --tenant <tenantId>'
    );
    process.exit(1);
  }

  if (args[0] === '--tenant') {
    const tenantId = args[1];
    if (!tenantId) {
      console.error('[backfill] --tenant requiert un tenantId.');
      process.exit(1);
    }
    await backfillTenant(tenantId);
    return;
  }

  for (const channelId of args) {
    await backfillChannel(channelId);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

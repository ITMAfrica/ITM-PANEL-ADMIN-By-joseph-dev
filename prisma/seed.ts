import { PrismaClient, Prisma } from '@prisma/client';
import { NEWSLETTER_TEMPLATE_SEEDS } from '../server/lib/newsletter-templates-data';

const db = new PrismaClient();

const DEMO_SUBSCRIBERS = [
  'demo.reader1@example.com',
  'demo.reader2@example.com',
  'demo.reader3@example.com',
];

/** Canaux dédiés : un seul abonné chacun. */
const JOEL_CHANNEL = {
  name: 'Joel Musema',
  email: 'joel.musema@itmafrica.com',
} as const;

const JOSEPH_CHANNEL = {
  name: 'Joseph Nyandu',
  email: 'joseph.nyandu@itmafrica.com',
} as const;

async function ensureSubscription(params: {
  subscriberId: string;
  channelId: string;
  sourceId: string;
}) {
  const existing = await db.subscription.findUnique({
    where: {
      subscriberId_channelId: {
        subscriberId: params.subscriberId,
        channelId: params.channelId,
      },
    },
  });
  if (existing) {
    if (existing.status !== 'subscribed' || existing.sourceId !== params.sourceId) {
      await db.subscription.update({
        where: { id: existing.id },
        data: { status: 'subscribed', sourceId: params.sourceId },
      });
    }
    return;
  }

  try {
    await db.subscription.create({
      data: {
        subscriberId: params.subscriberId,
        sourceId: params.sourceId,
        channelId: params.channelId,
        status: 'subscribed',
      },
    });
  } catch (error) {
    // Course possible si le seed est relancé en parallèle : contrainte @@unique déjà satisfaite
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return;
    }
    throw error;
  }
}

async function ensureEmailChannel(params: {
  tenantId: string;
  name: string;
  emails: string[];
}) {
  let channel = await db.distributionChannel.findFirst({
    where: { tenantId: params.tenantId, type: 'email', name: params.name },
  });
  if (!channel) {
    channel = await db.distributionChannel.create({
      data: {
        name: params.name,
        type: 'email',
        icon: 'mail',
        tenantId: params.tenantId,
      },
    });
    console.info(`[seed] canal email créé: ${channel.id} (${params.name})`);
  }

  const source = await db.subscriptionSource.upsert({
    where: { channelId_formKey: { channelId: channel.id, formKey: 'default' } },
    update: {},
    create: {
      tenantId: params.tenantId,
      channelId: channel.id,
      formKey: 'default',
      type: 'site',
    },
  });

  for (const email of params.emails) {
    const subscriber = await db.subscriber.upsert({
      where: { tenantId_email: { tenantId: params.tenantId, email } },
      update: {},
      create: { email, tenantId: params.tenantId },
    });

    await ensureSubscription({
      subscriberId: subscriber.id,
      channelId: channel.id,
      sourceId: source.id,
    });
  }

  const count = await db.subscription.count({ where: { channelId: channel.id } });
  await db.distributionChannel.update({
    where: { id: channel.id },
    data: { subscriberCount: count },
  });
  console.info(`[seed] ${count} abonné(s) sur le canal ${channel.id} (${params.name})`);
  return channel;
}

async function main() {
  const workspace = await db.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!workspace) {
    console.info('[seed] aucun workspace trouvé — seed abonnés ignoré.');
    return;
  }

  await ensureEmailChannel({
    tenantId: workspace.id,
    name: 'Newsletter principale',
    emails: DEMO_SUBSCRIBERS,
  });

  await ensureEmailChannel({
    tenantId: workspace.id,
    name: JOEL_CHANNEL.name,
    emails: [JOEL_CHANNEL.email],
  });

  await ensureEmailChannel({
    tenantId: workspace.id,
    name: JOSEPH_CHANNEL.name,
    emails: [JOSEPH_CHANNEL.email],
  });

  for (const seed of NEWSLETTER_TEMPLATE_SEEDS) {
    await db.newsletterTemplate.upsert({
      where: { id: `nlt_${seed.name}` },
      update: {
        name: seed.name,
        description: seed.description,
        subject: seed.subject,
        preheader: seed.preheader,
        category: seed.category,
        thumbnail: seed.thumbnail,
        body: seed.body,
        isPremium: seed.isPremium,
      },
      create: {
        id: `nlt_${seed.name}`,
        tenantId: workspace.id,
        ...seed,
      },
    });
  }
  console.info(`[seed] ${NEWSLETTER_TEMPLATE_SEEDS.length} templates de newsletter ITM HR créés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

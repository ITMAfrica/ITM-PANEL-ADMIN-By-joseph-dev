import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const tenant = await db.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!tenant) {
    console.error('Aucun workspace trouvé.');
    process.exit(1);
  }
  const site = await db.site.findFirst({ where: { tenantId: tenant.id } });
  if (!site) {
    console.error('Aucun site trouvé pour le workspace.');
    process.exit(1);
  }

  const subject = `Newsletter de test ${new Date().toLocaleString('fr-FR')}`;
  const body = '<h1>Bonjour Joseph</h1><p>Ceci est une newsletter de test envoyée depuis le panel.</p><a href="https://itmafrica.com">Voir le site</a>';

  let channel = await db.distributionChannel.findFirst({
    where: { tenantId: tenant.id, type: 'email', name: 'Test NL E2E' },
  });
  if (!channel) {
    channel = await db.distributionChannel.create({
      data: { name: 'Test NL E2E', type: 'email', icon: 'mail', tenantId: tenant.id },
    });
  }

  await db.subscriber.upsert({
    where: { channelId_email: { channelId: channel.id, email: 'Josephbasix@gmail.com' } },
    update: {},
    create: { email: 'Josephbasix@gmail.com', channelId: channel.id, tenantId: tenant.id },
  });

  const content = await db.content.create({
    data: {
      id: `cnt-test-${Date.now()}`,
      type: 'newsletter',
      title: 'Newsletter de test',
      excerpt: 'Extrait de test',
      body,
      tenantId: tenant.id,
      siteId: site.id,
      status: 'published',
      scheduledAt: new Date(),
      publishedAt: new Date(),
      metadata: { emailSubject: subject, channelIds: [channel.id] },
    },
  });

  console.log(`Newsletter créée: ${content.id}`);
  console.log(`Sujet: ${subject}`);
  console.log(`Canal: ${channel.id} | Abonné: Josephbasix@gmail.com`);
  console.log(`EMAIL_PROVIDER=${process.env.EMAIL_PROVIDER} ITM_SEND_EMAIL_URL=${process.env.ITM_SEND_EMAIL_URL}`);

  const { dispatchDueNewsletters } = await import('../server/services/newsletter.service');
  const { SmtpEmailProvider } = await import('../server/lib/email/smtp.provider');

  try {
    const provider =
      process.env.SMTP_MOCK === '1'
        ? new SmtpEmailProvider({
            from: process.env.EMAIL_FROM,
            transporter: {
              sendMail: async (msg: Record<string, unknown>) => {
                console.log('📧 MOCK SEND ->', JSON.stringify({ from: msg.from, to: msg.to, subject: msg.subject }));
                return { messageId: `mock-${Date.now()}` };
              },
            } as never,
          })
        : undefined;
    const result = await dispatchDueNewsletters({ provider });
    console.log('Résultat dispatch:', JSON.stringify(result));
    if (result.recipients > 0) {
      console.log('✅ Envoi déclenché (SMTP/MOCK).');
    } else {
      console.log('⚠️ Aucun destinataire traité.');
    }
  } catch (err) {
    console.error('❌ Échec du dispatch:', err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

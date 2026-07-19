-- CreateTable SubscriptionSource
CREATE TABLE "SubscriptionSource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT,
    "channelId" TEXT NOT NULL,
    "formKey" TEXT NOT NULL DEFAULT 'default',
    "type" TEXT NOT NULL DEFAULT 'site',
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable Subscription
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'subscribed',
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable ContentChannel
CREATE TABLE "ContentChannel" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentChannel_pkey" PRIMARY KEY ("id")
);

-- Backfill SubscriptionSource + Subscription from existing Subscriber.channelId.
-- One source per (channelId, 'default') so we keep the link to the capture channel.
INSERT INTO "SubscriptionSource" ("id", "tenantId", "channelId", "formKey", "type", "consentedAt", "createdAt")
SELECT
    'src_' || s."channelId",
    s."tenantId",
    s."channelId",
    'default',
    'site',
    MIN(s."createdAt"),
    MIN(s."createdAt")
FROM "Subscriber" s
WHERE s."channelId" IS NOT NULL
GROUP BY s."tenantId", s."channelId";

INSERT INTO "Subscription" ("id", "subscriberId", "sourceId", "channelId", "status", "consentedAt", "createdAt")
SELECT
    'sub_' || s."id",
    s."id",
    'src_' || s."channelId",
    s."channelId",
    s."status",
    s."createdAt",
    s."createdAt"
FROM "Subscriber" s
WHERE s."channelId" IS NOT NULL;

-- Backfill ContentChannel from Content.metadata.channelIds (JSON array of text).
INSERT INTO "ContentChannel" ("id", "contentId", "channelId", "tenantId", "createdAt")
SELECT
    'cc_' || c."id" || '_' || ch."value",
    c."id",
    ch."value",
    c."tenantId",
    c."createdAt"
FROM "Content" c,
     LATERAL jsonb_array_elements_text(
         COALESCE(c."metadata" -> 'channelIds', '[]'::jsonb)
     ) AS ch("value")
WHERE ch."value" IS NOT NULL
  AND ch."value" <> ''
  AND EXISTS (
      SELECT 1 FROM "DistributionChannel" dc WHERE dc."id" = ch."value"
  );

-- DropForeignKey (implicit) and remove the now-migrated channelId column on Subscriber.
ALTER TABLE "Subscriber" DROP COLUMN "channelId";

-- Add unique constraint [tenantId, email] on Subscriber.
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_tenantId_email_key" UNIQUE ("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionSource_channelId_formKey_key" ON "SubscriptionSource"("channelId", "formKey");
CREATE INDEX "SubscriptionSource_tenantId_idx" ON "SubscriptionSource"("tenantId");
CREATE INDEX "SubscriptionSource_channelId_idx" ON "SubscriptionSource"("channelId");
CREATE INDEX "SubscriptionSource_siteId_idx" ON "SubscriptionSource"("siteId");

CREATE UNIQUE INDEX "Subscription_subscriberId_channelId_key" ON "Subscription"("subscriberId", "channelId");
CREATE INDEX "Subscription_subscriberId_idx" ON "Subscription"("subscriberId");
CREATE INDEX "Subscription_sourceId_idx" ON "Subscription"("sourceId");
CREATE INDEX "Subscription_channelId_idx" ON "Subscription"("channelId");

CREATE UNIQUE INDEX "ContentChannel_contentId_channelId_key" ON "ContentChannel"("contentId", "channelId");
CREATE INDEX "ContentChannel_contentId_idx" ON "ContentChannel"("contentId");
CREATE INDEX "ContentChannel_channelId_idx" ON "ContentChannel"("channelId");
CREATE INDEX "ContentChannel_tenantId_idx" ON "ContentChannel"("tenantId");

-- AddForeignKey
ALTER TABLE "SubscriptionSource" ADD CONSTRAINT "SubscriptionSource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionSource" ADD CONSTRAINT "SubscriptionSource_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SubscriptionSource" ADD CONSTRAINT "SubscriptionSource_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "DistributionChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SubscriptionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "DistributionChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentChannel" ADD CONSTRAINT "ContentChannel_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentChannel" ADD CONSTRAINT "ContentChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "DistributionChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentChannel" ADD CONSTRAINT "ContentChannel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('subscribed', 'unsubscribed');

-- CreateEnum
CREATE TYPE "SendStatus" AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'bounced');

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "channelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'subscribed',
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSend" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "status" "SendStatus" NOT NULL DEFAULT 'sent',
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_channelId_email_key" ON "Subscriber"("channelId", "email");

-- CreateIndex
CREATE INDEX "Subscriber_tenantId_idx" ON "Subscriber"("tenantId");

-- CreateIndex
CREATE INDEX "Subscriber_channelId_idx" ON "Subscriber"("channelId");

-- CreateIndex
CREATE INDEX "NewsletterSend_contentId_idx" ON "NewsletterSend"("contentId");

-- CreateIndex
CREATE INDEX "NewsletterSend_subscriberId_idx" ON "NewsletterSend"("subscriberId");

-- CreateIndex
CREATE INDEX "NewsletterSend_channelId_idx" ON "NewsletterSend"("channelId");

-- AddForeignKey
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "DistributionChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterSend" ADD CONSTRAINT "NewsletterSend_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterSend" ADD CONSTRAINT "NewsletterSend_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

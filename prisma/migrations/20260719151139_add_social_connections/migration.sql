-- AlterTable
ALTER TABLE "DistributionChannel" ADD COLUMN     "socialConnectionId" TEXT;

-- CreateTable
CREATE TABLE "SocialConnection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'facebook',
    "pageId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "pageAccessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'connected',
    "connectedBy" TEXT,
    "lastPublishAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialConnection_tenantId_idx" ON "SocialConnection"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_tenantId_platform_pageId_key" ON "SocialConnection"("tenantId", "platform", "pageId");

-- CreateIndex
CREATE INDEX "DistributionChannel_socialConnectionId_idx" ON "DistributionChannel"("socialConnectionId");

-- AddForeignKey
ALTER TABLE "DistributionChannel" ADD CONSTRAINT "DistributionChannel_socialConnectionId_fkey" FOREIGN KEY ("socialConnectionId") REFERENCES "SocialConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

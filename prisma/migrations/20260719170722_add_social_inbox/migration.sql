-- AlterTable
ALTER TABLE "SocialConnection" ADD COLUMN     "lastInboxSyncAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SocialConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'facebook',
    "externalThreadId" TEXT NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "contentId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorExternalId" TEXT,
    "preview" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'unresolved',
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorExternalId" TEXT,
    "body" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialConversation_tenantId_status_lastMessageAt_idx" ON "SocialConversation"("tenantId", "status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "SocialConversation_tenantId_platform_idx" ON "SocialConversation"("tenantId", "platform");

-- CreateIndex
CREATE INDEX "SocialConversation_connectionId_idx" ON "SocialConversation"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialConversation_connectionId_externalThreadId_key" ON "SocialConversation"("connectionId", "externalThreadId");

-- CreateIndex
CREATE INDEX "SocialMessage_conversationId_publishedAt_idx" ON "SocialMessage"("conversationId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMessage_conversationId_externalId_key" ON "SocialMessage"("conversationId", "externalId");

-- AddForeignKey
ALTER TABLE "SocialConversation" ADD CONSTRAINT "SocialConversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialConversation" ADD CONSTRAINT "SocialConversation_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "SocialConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialConversation" ADD CONSTRAINT "SocialConversation_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMessage" ADD CONSTRAINT "SocialMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SocialConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

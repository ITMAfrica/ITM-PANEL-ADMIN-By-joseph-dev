-- CreateTable
CREATE TABLE "WidgetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WidgetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WidgetToken_token_key" ON "WidgetToken"("token");

-- CreateIndex
CREATE INDEX "WidgetToken_token_idx" ON "WidgetToken"("token");

-- CreateIndex
CREATE INDEX "WidgetToken_channelId_idx" ON "WidgetToken"("channelId");

-- CreateIndex
CREATE INDEX "WidgetToken_tenantId_idx" ON "WidgetToken"("tenantId");

-- AddForeignKey
ALTER TABLE "WidgetToken" ADD CONSTRAINT "WidgetToken_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "DistributionChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetToken" ADD CONSTRAINT "WidgetToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

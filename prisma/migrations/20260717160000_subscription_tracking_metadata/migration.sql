-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "consentNewsletter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "consentPrivacy" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "consentTextVersion" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_country_idx" ON "Subscription"("country");

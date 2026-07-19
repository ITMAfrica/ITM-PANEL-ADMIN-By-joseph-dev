-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'social';

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "icon" SET DEFAULT '📋';

-- AlterTable
ALTER TABLE "WikiPage" ALTER COLUMN "icon" SET DEFAULT '📄';

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "icon" SET DEFAULT '🏢';

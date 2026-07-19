ALTER TABLE "WorkspaceMember" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "WorkspaceMember"
  ALTER COLUMN "role" TYPE "UserRole"
  USING (
    CASE "role"
      WHEN 'super_admin'   THEN 'super_admin'::"UserRole"
      WHEN 'tenant_admin'  THEN 'tenant_admin'::"UserRole"
      WHEN 'editor'        THEN 'editor'::"UserRole"
      WHEN 'contributor'   THEN 'contributor'::"UserRole"
      WHEN 'reader'        THEN 'reader'::"UserRole"
      WHEN 'member'        THEN 'member'::"UserRole"
      ELSE 'member'::"UserRole"
    END
  );

ALTER TABLE "WorkspaceMember" ALTER COLUMN "role" SET DEFAULT 'member'::"UserRole";

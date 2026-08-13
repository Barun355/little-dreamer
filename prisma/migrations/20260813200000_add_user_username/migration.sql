-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill existing users from email local-part + id suffix
UPDATE "User"
SET "username" = lower(
  regexp_replace(
    regexp_replace(split_part("email", '@', 1), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
) || '-' || lower(left(regexp_replace("id", '[^a-zA-Z0-9]', '', 'g'), 6));

-- Handle empty slug edge cases
UPDATE "User"
SET "username" = 'user-' || lower(left(regexp_replace("id", '[^a-zA-Z0-9]', '', 'g'), 6))
WHERE "username" IS NULL OR "username" = '' OR "username" LIKE '-%';

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "storageProvisionedAt" TIMESTAMP(3);

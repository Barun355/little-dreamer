ALTER TABLE "User"
ADD COLUMN "subscription" JSONB NOT NULL DEFAULT '{"storybooksPerDay": 1}';

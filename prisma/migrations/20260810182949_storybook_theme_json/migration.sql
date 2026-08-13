/*
  Warnings:

  - Changed the type of `theme` on the `Storybook` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Storybook" DROP COLUMN "theme",
ADD COLUMN     "theme" JSONB NOT NULL;

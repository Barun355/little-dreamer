/*
  Warnings:

  - You are about to drop the column `dislikes` on the `Storybook` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `Storybook` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Storybook` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Storybook" DROP COLUMN "dislikes",
DROP COLUMN "interests",
DROP COLUMN "likes";

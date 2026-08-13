-- CreateEnum
CREATE TYPE "StorybookStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storybook" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "childName" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "likes" TEXT,
    "dislikes" TEXT,
    "interests" TEXT,
    "photoUrl" TEXT,
    "theme" TEXT NOT NULL,
    "status" "StorybookStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storybook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Storybook_userId_idx" ON "Storybook"("userId");

-- CreateIndex
CREATE INDEX "Storybook_status_idx" ON "Storybook"("status");

-- AddForeignKey
ALTER TABLE "Storybook" ADD CONSTRAINT "Storybook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

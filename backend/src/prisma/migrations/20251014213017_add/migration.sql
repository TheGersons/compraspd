/*
  Warnings:

  - Added the required column `updatedAt` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `Assignment` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."FollowStatus" AS ENUM ('EN_PROGRESO', 'PAUSADO', 'CANCELADO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "eta" TIMESTAMP(3),
ADD COLUMN     "followStatus" "public"."FollowStatus" NOT NULL DEFAULT 'EN_PROGRESO',
ADD COLUMN     "priorityRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileAttachment" (
    "id" TEXT NOT NULL,
    "chatMessageId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileAttachment_chatMessageId_idx" ON "public"."FileAttachment"("chatMessageId");

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileAttachment" ADD CONSTRAINT "FileAttachment_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES "public"."ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

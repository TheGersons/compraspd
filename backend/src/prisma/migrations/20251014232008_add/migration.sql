/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `PurchaseRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assignmentId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `PurchaseRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignedToId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignmentId` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_assigneeId_fkey";

-- AlterTable
ALTER TABLE "public"."Assignment" DROP COLUMN "assigneeId",
ADD COLUMN     "assignedToId" TEXT NOT NULL,
ADD COLUMN     "assignmentId" TEXT NOT NULL,
ADD COLUMN     "purchaseRequestId" TEXT;

-- AlterTable
ALTER TABLE "public"."PurchaseRequest" DROP COLUMN "comment",
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "deliveryPlace" TEXT,
ADD COLUMN     "finalClient" TEXT,
ADD COLUMN     "requestType" TEXT,
ADD COLUMN     "scope" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_assignmentId_key" ON "public"."Assignment"("assignmentId");

-- CreateIndex
CREATE INDEX "Assignment_assignedToId_idx" ON "public"."Assignment"("assignedToId");

-- CreateIndex
CREATE INDEX "ChatMessage_assignmentId_idx" ON "public"."ChatMessage"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequest_reference_key" ON "public"."PurchaseRequest"("reference");

-- CreateIndex
CREATE INDEX "PurchaseRequest_reference_idx" ON "public"."PurchaseRequest"("reference");

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "public"."PurchaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

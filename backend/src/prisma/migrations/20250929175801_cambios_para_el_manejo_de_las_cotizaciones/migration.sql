/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProcurementType" AS ENUM ('NATIONAL', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "public"."DeliveryType" AS ENUM ('WAREHOUSE', 'PROJECT');

-- CreateEnum
CREATE TYPE "public"."ItemType" AS ENUM ('PRODUCT', 'SERVICE', 'RENTAL', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "messageId" TEXT;

-- AlterTable
ALTER TABLE "public"."PRItem" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "extraSpecs" JSONB,
ADD COLUMN     "itemType" "public"."ItemType" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "public"."PurchaseRequest" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "deliveryType" "public"."DeliveryType",
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "procurement" "public"."ProcurementType" NOT NULL DEFAULT 'NATIONAL',
ADD COLUMN     "quoteDeadline" TIMESTAMP(3),
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "warehouseId" TEXT;

-- AlterTable
ALTER TABLE "public"."Quote" ADD COLUMN     "customsNotes" TEXT,
ADD COLUMN     "incoterm" TEXT,
ADD COLUMN     "isInternational" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originCountry" TEXT;

-- AlterTable
ALTER TABLE "public"."QuoteOffer" ADD COLUMN     "deliveryTerms" TEXT,
ADD COLUMN     "leadTimeDays" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentTerms" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "department",
ADD COLUMN     "departmentId" TEXT;

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "contact" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Thread" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThreadParticipant" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "ThreadParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "public"."Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_taxId_key" ON "public"."Client"("taxId");

-- CreateIndex
CREATE INDEX "Thread_entityType_entityId_idx" ON "public"."Thread"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadParticipant_threadId_userId_key" ON "public"."ThreadParticipant"("threadId", "userId");

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "public"."Message"("threadId");

-- CreateIndex
CREATE INDEX "PRItem_sku_idx" ON "public"."PRItem"("sku");

-- CreateIndex
CREATE INDEX "PRItem_barcode_idx" ON "public"."PRItem"("barcode");

-- CreateIndex
CREATE INDEX "PurchaseRequest_departmentId_idx" ON "public"."PurchaseRequest"("departmentId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_clientId_idx" ON "public"."PurchaseRequest"("clientId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_deliveryType_idx" ON "public"."PurchaseRequest"("deliveryType");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Thread" ADD CONSTRAINT "Thread_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The values [EN_PROGRESO,PAUSADO,CANCELADO,FINALIZADO] on the enum `FollowStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."FollowStatus_new" AS ENUM ('IN_PROGRESS', 'PAUSED', 'CANCELLED', 'COMPLETED');
ALTER TABLE "public"."Assignment" ALTER COLUMN "followStatus" DROP DEFAULT;
ALTER TABLE "public"."Assignment" ALTER COLUMN "followStatus" TYPE "public"."FollowStatus_new" USING ("followStatus"::text::"public"."FollowStatus_new");
ALTER TYPE "public"."FollowStatus" RENAME TO "FollowStatus_old";
ALTER TYPE "public"."FollowStatus_new" RENAME TO "FollowStatus";
DROP TYPE "public"."FollowStatus_old";
ALTER TABLE "public"."Assignment" ALTER COLUMN "followStatus" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Assignment" ALTER COLUMN "followStatus" SET DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "public"."PurchaseOrder" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "public"."PurchaseRequest" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

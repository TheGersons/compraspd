-- CreateEnum
CREATE TYPE "public"."RequestCategory" AS ENUM ('SUMINISTROS', 'LICITACIONES', 'INVENTARIOS', 'PROYECTOS');

-- AlterTable
ALTER TABLE "public"."PurchaseRequest" ADD COLUMN     "requestCategory" "public"."RequestCategory" NOT NULL DEFAULT 'LICITACIONES';

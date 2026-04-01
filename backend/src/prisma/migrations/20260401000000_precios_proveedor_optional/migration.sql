-- AlterTable: make proveedor_id nullable in precios
ALTER TABLE "precios" ALTER COLUMN "proveedor_id" DROP NOT NULL;

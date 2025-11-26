/*
  Warnings:

  - You are about to drop the column `compra_detalle_id` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `compra_id` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `con_bl` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacion_detalle_id` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacion_id` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `dias_retraso` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `en_cif` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `en_fob` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `estado_general` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_comprado` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_con_bl` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_con_descuento` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_cotizado` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_en_cif` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_en_fob` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_pagado` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_primer_seguimiento` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_recibido` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_segundo_seguimiento` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `precio_total` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `precio_unitario` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `primer_seguimiento` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `proyecto_id` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to drop the column `segundo_seguimiento` on the `estado_producto` table. All the data in the column will be lost.
  - You are about to alter the column `sku` on the `estado_producto` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `proveedor` on the `estado_producto` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `responsable` on the `estado_producto` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Made the column `sku` on table `estado_producto` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."medio_transporte" AS ENUM ('MARITIMO', 'TERRESTRE', 'AEREO');

-- DropForeignKey
ALTER TABLE "public"."estado_producto" DROP CONSTRAINT "estado_producto_compra_detalle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."estado_producto" DROP CONSTRAINT "estado_producto_compra_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."estado_producto" DROP CONSTRAINT "estado_producto_cotizacion_detalle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."estado_producto" DROP CONSTRAINT "estado_producto_cotizacion_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."estado_producto" DROP CONSTRAINT "estado_producto_proyecto_id_fkey";

-- DropIndex
DROP INDEX "public"."estado_producto_compra_detalle_id_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_compra_id_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_cotizacion_detalle_id_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_cotizacion_id_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_cotizado_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_en_cif_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_estado_general_idx";

-- DropIndex
DROP INDEX "public"."estado_producto_proyecto_id_idx";

-- AlterTable
ALTER TABLE "public"."estado_producto" DROP COLUMN "compra_detalle_id",
DROP COLUMN "compra_id",
DROP COLUMN "con_bl",
DROP COLUMN "cotizacion_detalle_id",
DROP COLUMN "cotizacion_id",
DROP COLUMN "dias_retraso",
DROP COLUMN "en_cif",
DROP COLUMN "en_fob",
DROP COLUMN "estado_general",
DROP COLUMN "fecha_comprado",
DROP COLUMN "fecha_con_bl",
DROP COLUMN "fecha_con_descuento",
DROP COLUMN "fecha_cotizado",
DROP COLUMN "fecha_en_cif",
DROP COLUMN "fecha_en_fob",
DROP COLUMN "fecha_pagado",
DROP COLUMN "fecha_primer_seguimiento",
DROP COLUMN "fecha_recibido",
DROP COLUMN "fecha_segundo_seguimiento",
DROP COLUMN "precio_total",
DROP COLUMN "precio_unitario",
DROP COLUMN "primer_seguimiento",
DROP COLUMN "proyecto_id",
DROP COLUMN "segundo_seguimiento",
ADD COLUMN     "compraDetalleId" UUID,
ADD COLUMN     "compraId" UUID,
ADD COLUMN     "conBL" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cotizacionDetalleId" UUID,
ADD COLUMN     "cotizacionId" UUID,
ADD COLUMN     "criticidad" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "diasRetrasoActual" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "enCIF" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enFOB" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estadoGeneral" VARCHAR(20) NOT NULL DEFAULT 'warn',
ADD COLUMN     "fechaComprado" TIMESTAMP(3),
ADD COLUMN     "fechaConBL" TIMESTAMP(3),
ADD COLUMN     "fechaConDescuento" TIMESTAMP(3),
ADD COLUMN     "fechaCotizado" TIMESTAMP(3),
ADD COLUMN     "fechaEnCIF" TIMESTAMP(3),
ADD COLUMN     "fechaEnFOB" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteComprado" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteConBL" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteConDescuento" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteCotizado" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteEnCIF" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteEnFOB" TIMESTAMP(3),
ADD COLUMN     "fechaLimitePagado" TIMESTAMP(3),
ADD COLUMN     "fechaLimitePrimerSeguimiento" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteRecibido" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteSegundoSeguimiento" TIMESTAMP(3),
ADD COLUMN     "fechaPagado" TIMESTAMP(3),
ADD COLUMN     "fechaPrimerSeguimiento" TIMESTAMP(3),
ADD COLUMN     "fechaRecibido" TIMESTAMP(3),
ADD COLUMN     "fechaSegundoSeguimiento" TIMESTAMP(3),
ADD COLUMN     "medioTransporte" "public"."medio_transporte",
ADD COLUMN     "nivelCriticidad" TEXT NOT NULL DEFAULT 'MEDIO',
ADD COLUMN     "paisOrigenId" UUID,
ADD COLUMN     "precioTotal" DECIMAL(15,4),
ADD COLUMN     "precioUnitario" DECIMAL(15,4),
ADD COLUMN     "primerSeguimiento" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proyectoId" UUID,
ADD COLUMN     "segundoSeguimiento" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "sku" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "proveedor" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "responsable" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "public"."pais" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."timeline_sku" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(255) NOT NULL,
    "paisOrigenId" UUID,
    "medioTransporte" "public"."medio_transporte" NOT NULL DEFAULT 'MARITIMO',
    "diasCotizadoADescuento" INTEGER,
    "diasDescuentoAComprado" INTEGER,
    "diasCompradoAPagado" INTEGER,
    "diasPagadoASeguimiento1" INTEGER,
    "diasSeguimiento1AFob" INTEGER,
    "diasFobABl" INTEGER,
    "diasBlASeguimiento2" INTEGER,
    "diasSeguimiento2ACif" INTEGER,
    "diasCifARecibido" INTEGER,
    "diasTotalesEstimados" INTEGER NOT NULL,
    "notas" TEXT,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proceso_personalizado" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "orden" INTEGER NOT NULL,
    "esObligatorio" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proceso_personalizado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pais_nombre_key" ON "public"."pais"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "pais_codigo_key" ON "public"."pais"("codigo");

-- CreateIndex
CREATE INDEX "pais_activo_idx" ON "public"."pais"("activo");

-- CreateIndex
CREATE INDEX "timeline_sku_sku_idx" ON "public"."timeline_sku"("sku");

-- CreateIndex
CREATE INDEX "timeline_sku_paisOrigenId_idx" ON "public"."timeline_sku"("paisOrigenId");

-- CreateIndex
CREATE UNIQUE INDEX "timeline_sku_sku_key" ON "public"."timeline_sku"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "proceso_personalizado_codigo_key" ON "public"."proceso_personalizado"("codigo");

-- CreateIndex
CREATE INDEX "proceso_personalizado_activo_idx" ON "public"."proceso_personalizado"("activo");

-- CreateIndex
CREATE INDEX "proceso_personalizado_orden_idx" ON "public"."proceso_personalizado"("orden");

-- CreateIndex
CREATE INDEX "estado_producto_proyectoId_idx" ON "public"."estado_producto"("proyectoId");

-- CreateIndex
CREATE INDEX "estado_producto_cotizacionId_idx" ON "public"."estado_producto"("cotizacionId");

-- CreateIndex
CREATE INDEX "estado_producto_criticidad_idx" ON "public"."estado_producto"("criticidad");

-- CreateIndex
CREATE INDEX "estado_producto_nivelCriticidad_idx" ON "public"."estado_producto"("nivelCriticidad");

-- CreateIndex
CREATE INDEX "estado_producto_paisOrigenId_idx" ON "public"."estado_producto"("paisOrigenId");

-- CreateIndex
CREATE INDEX "estado_producto_medioTransporte_idx" ON "public"."estado_producto"("medioTransporte");

-- AddForeignKey
ALTER TABLE "public"."timeline_sku" ADD CONSTRAINT "timeline_sku_paisOrigenId_fkey" FOREIGN KEY ("paisOrigenId") REFERENCES "public"."pais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_paisOrigenId_fkey" FOREIGN KEY ("paisOrigenId") REFERENCES "public"."pais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_cotizacionDetalleId_fkey" FOREIGN KEY ("cotizacionDetalleId") REFERENCES "public"."cotizacion_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "public"."compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_compraDetalleId_fkey" FOREIGN KEY ("compraDetalleId") REFERENCES "public"."compra_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO pais (id, nombre, codigo, activo) VALUES
  (gen_random_uuid(), 'China', 'CN', true),        -- Principal proveedor equipos
  (gen_random_uuid(), 'Estados Unidos', 'US', true), -- Equipos especializados
  (gen_random_uuid(), 'México', 'MX', true),       -- Logística cercana
  (gen_random_uuid(), 'Alemania', 'DE', true),     -- Equipos de alta tecnología
  (gen_random_uuid(), 'Japón', 'JP', true),        -- Equipos de precisión
  (gen_random_uuid(), 'Corea del Sur', 'KR', true); -- Electrónica industrial


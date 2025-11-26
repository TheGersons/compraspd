/*
  Warnings:

  - Added the required column `tipo` to the `area` table without a default value. This is not possible if the table is not empty.

*/
-- Modificar tabla Area
ALTER TABLE "area" 
  ADD COLUMN "tipo" VARCHAR(50) NOT NULL DEFAULT 'proyectos',
  ADD COLUMN "icono" VARCHAR(50);

-- Actualizar datos existentes
UPDATE "area" SET "tipo" = 'proyectos', "icono" = '🏗️' 
WHERE "nombre_area" = 'Proyectos';

UPDATE "area" SET "tipo" = 'comercial', "icono" = '💼' 
WHERE "nombre_area" = 'Comercial';

UPDATE "area" SET "tipo" = 'tecnica', "icono" = '🔌' 
WHERE "nombre_area" = 'Área Técnica';

UPDATE "area" SET "tipo" = 'operativa', "icono" = '🖥️' 
WHERE "nombre_area" = 'Operativa';

UPDATE "area" SET "tipo" = 'otros', "icono" = '📦' 
WHERE "nombre_area" = 'Equipos de Oficina';

-- Crear índice
CREATE INDEX "idx_area_tipo" ON "area"("tipo");

-- Resto de la migración (criticidad en proyecto, etc.)
-- ... (el resto se genera automáticamente)

-- AlterTable
ALTER TABLE "public"."proyecto" ADD COLUMN     "criticidad" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "public"."estado_producto" (
    "id" UUID NOT NULL,
    "proyecto_id" UUID,
    "cotizacion_id" UUID,
    "cotizacion_detalle_id" UUID,
    "compra_id" UUID,
    "compra_detalle_id" UUID,
    "sku" TEXT,
    "descripcion" TEXT NOT NULL,
    "cotizado" BOOLEAN NOT NULL DEFAULT false,
    "conDescuento" BOOLEAN NOT NULL DEFAULT false,
    "comprado" BOOLEAN NOT NULL DEFAULT false,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "primer_seguimiento" BOOLEAN NOT NULL DEFAULT false,
    "en_fob" BOOLEAN NOT NULL DEFAULT false,
    "con_bl" BOOLEAN NOT NULL DEFAULT false,
    "segundo_seguimiento" BOOLEAN NOT NULL DEFAULT false,
    "en_cif" BOOLEAN NOT NULL DEFAULT false,
    "recibido" BOOLEAN NOT NULL DEFAULT false,
    "fecha_cotizado" TIMESTAMP(3),
    "fecha_con_descuento" TIMESTAMP(3),
    "fecha_comprado" TIMESTAMP(3),
    "fecha_pagado" TIMESTAMP(3),
    "fecha_primer_seguimiento" TIMESTAMP(3),
    "fecha_en_fob" TIMESTAMP(3),
    "fecha_con_bl" TIMESTAMP(3),
    "fecha_segundo_seguimiento" TIMESTAMP(3),
    "fecha_en_cif" TIMESTAMP(3),
    "fecha_recibido" TIMESTAMP(3),
    "proveedor" TEXT,
    "responsable" TEXT,
    "precio_unitario" DECIMAL(15,4),
    "precio_total" DECIMAL(15,4),
    "cantidad" INTEGER,
    "dias_retraso" INTEGER,
    "observaciones" TEXT,
    "estado_general" TEXT NOT NULL DEFAULT 'warn',
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_producto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "estado_producto_proyecto_id_idx" ON "public"."estado_producto"("proyecto_id");

-- CreateIndex
CREATE INDEX "estado_producto_cotizacion_id_idx" ON "public"."estado_producto"("cotizacion_id");

-- CreateIndex
CREATE INDEX "estado_producto_cotizacion_detalle_id_idx" ON "public"."estado_producto"("cotizacion_detalle_id");

-- CreateIndex
CREATE INDEX "estado_producto_compra_id_idx" ON "public"."estado_producto"("compra_id");

-- CreateIndex
CREATE INDEX "estado_producto_compra_detalle_id_idx" ON "public"."estado_producto"("compra_detalle_id");

-- CreateIndex
CREATE INDEX "estado_producto_sku_idx" ON "public"."estado_producto"("sku");

-- CreateIndex
CREATE INDEX "estado_producto_estado_general_idx" ON "public"."estado_producto"("estado_general");

-- CreateIndex
CREATE INDEX "estado_producto_cotizado_idx" ON "public"."estado_producto"("cotizado");

-- CreateIndex
CREATE INDEX "estado_producto_en_cif_idx" ON "public"."estado_producto"("en_cif");

-- CreateIndex
CREATE INDEX "area_tipo_idx" ON "public"."area"("tipo");

-- CreateIndex
CREATE INDEX "cotizacion_fecha_limite_idx" ON "public"."cotizacion"("fecha_limite");

-- CreateIndex
CREATE INDEX "proyecto_criticidad_idx" ON "public"."proyecto"("criticidad");

-- CreateIndex
CREATE INDEX "proyecto_estado_idx" ON "public"."proyecto"("estado");

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_cotizacion_detalle_id_fkey" FOREIGN KEY ("cotizacion_detalle_id") REFERENCES "public"."cotizacion_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "public"."compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_compra_detalle_id_fkey" FOREIGN KEY ("compra_detalle_id") REFERENCES "public"."compra_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

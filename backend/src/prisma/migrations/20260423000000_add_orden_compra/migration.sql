-- CreateTable
CREATE TABLE "public"."orden_compra" (
    "id" UUID NOT NULL,
    "cotizacion_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero_oc" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_compra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orden_compra_cotizacion_id_idx" ON "public"."orden_compra"("cotizacion_id");

-- CreateIndex
CREATE INDEX "orden_compra_estado_idx" ON "public"."orden_compra"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "orden_compra_cotizacion_id_nombre_key" ON "public"."orden_compra"("cotizacion_id", "nombre");

-- AddForeignKey
ALTER TABLE "public"."orden_compra" ADD CONSTRAINT "orden_compra_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable estado_producto: agregar columna orden_compra_id
ALTER TABLE "public"."estado_producto" ADD COLUMN "orden_compra_id" UUID;

-- CreateIndex
CREATE INDEX "estado_producto_orden_compra_id_idx" ON "public"."estado_producto"("orden_compra_id");

-- AddForeignKey
ALTER TABLE "public"."estado_producto" ADD CONSTRAINT "estado_producto_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "public"."orden_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

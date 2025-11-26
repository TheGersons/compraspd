/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `cotizacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."estado_cotizacion" AS ENUM ('PENDIENTE', 'EN_CONFIGURACION', 'APROBADA_PARCIAL', 'APROBADA_COMPLETA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- DropIndex
DROP INDEX "public"."cotizacion_fecha_limite_idx";

-- AlterTable
ALTER TABLE "public"."cotizacion" ADD COLUMN     "aprobada_parcialmente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "chat_id" UUID,
ADD COLUMN     "fecha_aprobacion" TIMESTAMP(3),
ADD COLUMN     "supervisor_responsable_id" UUID,
ADD COLUMN     "todos_productos_aprobados" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "public"."estado_producto" ADD COLUMN     "aprobado_por_supervisor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_aprobacion" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."historial_cotizacion" (
    "id" UUID NOT NULL,
    "cotizacion_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "accion" TEXT NOT NULL,
    "detalles" JSONB NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_cotizacion_cotizacion_id_idx" ON "public"."historial_cotizacion"("cotizacion_id");

-- CreateIndex
CREATE INDEX "historial_cotizacion_usuario_id_idx" ON "public"."historial_cotizacion"("usuario_id");

-- CreateIndex
CREATE INDEX "historial_cotizacion_creado_idx" ON "public"."historial_cotizacion"("creado");

-- CreateIndex
CREATE UNIQUE INDEX "cotizacion_chat_id_key" ON "public"."cotizacion"("chat_id");

-- CreateIndex
CREATE INDEX "cotizacion_supervisor_responsable_id_idx" ON "public"."cotizacion"("supervisor_responsable_id");

-- CreateIndex
CREATE INDEX "cotizacion_chat_id_idx" ON "public"."cotizacion"("chat_id");

-- AddForeignKey
ALTER TABLE "public"."cotizacion" ADD CONSTRAINT "cotizacion_supervisor_responsable_id_fkey" FOREIGN KEY ("supervisor_responsable_id") REFERENCES "public"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion" ADD CONSTRAINT "cotizacion_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_cotizacion" ADD CONSTRAINT "historial_cotizacion_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_cotizacion" ADD CONSTRAINT "historial_cotizacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

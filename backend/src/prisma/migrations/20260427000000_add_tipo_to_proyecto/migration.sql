-- AlterTable: agregar columna tipo_id a proyecto (nullable)
ALTER TABLE "public"."proyecto" ADD COLUMN "tipo_id" UUID;

-- Backfill: asignar a cada proyecto el primer tipo (más antiguo) de su área
UPDATE "public"."proyecto" p
SET "tipo_id" = (
    SELECT t."id"
    FROM "public"."tipo" t
    WHERE t."area_id" = p."area_id"
    ORDER BY t."creado" ASC
    LIMIT 1
)
WHERE p."area_id" IS NOT NULL;

-- CreateIndex
CREATE INDEX "proyecto_tipo_id_idx" ON "public"."proyecto"("tipo_id");

-- AddForeignKey
ALTER TABLE "public"."proyecto" ADD CONSTRAINT "proyecto_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

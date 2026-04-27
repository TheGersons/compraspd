-- ============================================================================
-- 1. Crear tabla moneda
-- ============================================================================
CREATE TABLE "public"."moneda" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(3) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "simbolo" VARCHAR(5) NOT NULL,
    "decimales" INTEGER NOT NULL DEFAULT 2,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moneda_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "moneda_codigo_key" ON "public"."moneda"("codigo");
CREATE INDEX "moneda_activo_idx" ON "public"."moneda"("activo");

-- ============================================================================
-- 2. Seed inicial: HNL y USD
-- ============================================================================
INSERT INTO "public"."moneda" ("id", "codigo", "nombre", "simbolo", "decimales", "activo", "orden")
VALUES
  (gen_random_uuid(), 'HNL', 'Lempira',              'L.', 2, true, 1),
  (gen_random_uuid(), 'USD', 'Dólar estadounidense', '$',  2, true, 2);

-- ============================================================================
-- 3. Agregar columnas moneda_id (todas nullable para backfill seguro)
-- ============================================================================
ALTER TABLE "public"."cotizacion"          ADD COLUMN "moneda_id" UUID;
ALTER TABLE "public"."precios"             ADD COLUMN "moneda_id" UUID;
ALTER TABLE "public"."compra_detalle"      ADD COLUMN "moneda_id" UUID;
ALTER TABLE "public"."estado_producto"     ADD COLUMN "moneda_id" UUID;
ALTER TABLE "public"."licitacion_producto" ADD COLUMN "moneda_id" UUID;
ALTER TABLE "public"."oferta_producto"     ADD COLUMN "moneda_id" UUID;

-- ============================================================================
-- 4. Backfill: asignar moneda según tipo_compra de la cotización
--    NACIONAL → HNL, INTERNACIONAL → USD
-- ============================================================================

-- 4.1 Cotización (fuente de verdad)
UPDATE "public"."cotizacion" c
SET "moneda_id" = (
    SELECT m."id" FROM "public"."moneda" m
    WHERE m."codigo" = CASE
        WHEN c."tipo_compra" = 'INTERNACIONAL' THEN 'USD'
        ELSE 'HNL'
    END
);

-- 4.2 Precios (heredan de la cotización a través de cotizacion_detalle)
UPDATE "public"."precios" p
SET "moneda_id" = (
    SELECT c."moneda_id"
    FROM "public"."cotizacion_detalle" cd
    INNER JOIN "public"."cotizacion" c ON c."id" = cd."cotizacion_id"
    WHERE cd."id" = p."cotizacion_detalle_id"
);

-- 4.3 CompraDetalle (heredan de la cotización a través de compra)
UPDATE "public"."compra_detalle" cd
SET "moneda_id" = (
    SELECT c."moneda_id"
    FROM "public"."compra" co
    INNER JOIN "public"."cotizacion" c ON c."id" = co."cotizacion_id"
    WHERE co."id" = cd."compra_id"
);

-- 4.4 EstadoProducto (heredan de la cotización directa)
-- Nota: en estado_producto las FKs usan camelCase ("cotizacionId"), no snake_case
UPDATE "public"."estado_producto" ep
SET "moneda_id" = (
    SELECT c."moneda_id"
    FROM "public"."cotizacion" c
    WHERE c."id" = ep."cotizacionId"
)
WHERE ep."cotizacionId" IS NOT NULL;

-- 4.5 LicitacionProducto (a través de licitación → cotización)
UPDATE "public"."licitacion_producto" lp
SET "moneda_id" = (
    SELECT c."moneda_id"
    FROM "public"."licitacion" l
    INNER JOIN "public"."cotizacion" c ON c."id" = l."cotizacion_id"
    WHERE l."id" = lp."licitacion_id"
);

-- 4.6 OfertaProducto (a través de oferta → cotización)
UPDATE "public"."oferta_producto" op
SET "moneda_id" = (
    SELECT c."moneda_id"
    FROM "public"."oferta" o
    INNER JOIN "public"."cotizacion" c ON c."id" = o."cotizacion_id"
    WHERE o."id" = op."oferta_id"
);

-- ============================================================================
-- 5. Índices y FKs
-- ============================================================================
CREATE INDEX "cotizacion_moneda_id_idx"          ON "public"."cotizacion"("moneda_id");
CREATE INDEX "precios_moneda_id_idx"             ON "public"."precios"("moneda_id");
CREATE INDEX "compra_detalle_moneda_id_idx"      ON "public"."compra_detalle"("moneda_id");
CREATE INDEX "estado_producto_moneda_id_idx"     ON "public"."estado_producto"("moneda_id");
CREATE INDEX "licitacion_producto_moneda_id_idx" ON "public"."licitacion_producto"("moneda_id");
CREATE INDEX "oferta_producto_moneda_id_idx"     ON "public"."oferta_producto"("moneda_id");

ALTER TABLE "public"."cotizacion"          ADD CONSTRAINT "cotizacion_moneda_id_fkey"          FOREIGN KEY ("moneda_id") REFERENCES "public"."moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."precios"             ADD CONSTRAINT "precios_moneda_id_fkey"             FOREIGN KEY ("moneda_id") REFERENCES "public"."moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."compra_detalle"      ADD CONSTRAINT "compra_detalle_moneda_id_fkey"      FOREIGN KEY ("moneda_id") REFERENCES "public"."moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."estado_producto"     ADD CONSTRAINT "estado_producto_moneda_id_fkey"     FOREIGN KEY ("moneda_id") REFERENCES "public"."moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."licitacion_producto" ADD CONSTRAINT "licitacion_producto_moneda_id_fkey" FOREIGN KEY ("moneda_id") REFERENCES "public"."moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."oferta_producto"     ADD CONSTRAINT "oferta_producto_moneda_id_fkey"     FOREIGN KEY ("moneda_id") REFERENCES "public"."moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- POST-MIGRATE TRIGGERS
-- Se ejecuta automáticamente en cada startup de Docker,
-- después de "prisma migrate deploy".
-- Usar siempre CREATE OR REPLACE (idempotente).
--
-- Para agregar un nuevo trigger:
--   1. Crear la función con CREATE OR REPLACE FUNCTION
--   2. Eliminar el trigger si existe: DROP TRIGGER IF EXISTS
--   3. Crear el trigger: CREATE TRIGGER
-- ============================================================


-- ============================================================
-- [1] trigger_generate_sku
-- Tabla: cotizacion_detalle
-- Genera automáticamente el código SKU (PROD-XXXX) en INSERT
-- si el campo sku viene NULL o vacío.
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_sku TEXT;
  counter INTEGER;
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(sku FROM 'PROD-([0-9]+)') AS INTEGER)
    ), 0) + 1
    INTO counter
    FROM cotizacion_detalle
    WHERE sku LIKE 'PROD-%';

    new_sku := 'PROD-' || LPAD(counter::TEXT, 4, '0');
    NEW.sku := new_sku;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_sku ON public.cotizacion_detalle;

CREATE TRIGGER trigger_generate_sku
  BEFORE INSERT ON public.cotizacion_detalle
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_sku();


-- ============================================================
-- [2] Sincronizar supervisor_responsable_id desde responsable_seguimiento_id
-- Corrige registros existentes donde la cotización no tiene
-- supervisor_responsable_id pero sus productos sí tienen
-- responsable_seguimiento_id asignado.
-- Idempotente: solo actualiza donde supervisor_responsable_id IS NULL.
-- ============================================================

UPDATE cotizacion c
SET supervisor_responsable_id = (
  SELECT ep.responsable_seguimiento_id
  FROM estado_producto ep
  WHERE ep."cotizacionId" = c.id
    AND ep.responsable_seguimiento_id IS NOT NULL
  LIMIT 1
)
WHERE c.supervisor_responsable_id IS NULL
  AND EXISTS (
    SELECT 1 FROM estado_producto ep
    WHERE ep."cotizacionId" = c.id
      AND ep.responsable_seguimiento_id IS NOT NULL
  );

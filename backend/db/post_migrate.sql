-- ===========================================
--  Asegurar columnas nuevas en "Client"
-- ===========================================
ALTER TABLE "public"."Client"
  ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "departmentId" text NULL;

-- Opcional: si Department existe y quieres FK (ajusta tipos/tabla/columna)
-- ALTER TABLE "public"."Client"
--   ADD CONSTRAINT "Client_departmentId_fkey"
--   FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- ===========================================
--  Función auxiliar: upsert de cliente espejo
-- ===========================================
CREATE OR REPLACE FUNCTION public.ensure_client_for_active_user(p_user_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_active boolean;
  v_full_name text;
  v_department_id text;
BEGIN
  SELECT "isActive", "fullName", "departmentId"
    INTO v_is_active, v_full_name, v_department_id
  FROM "public"."User"
  WHERE "id" = p_user_id;

  -- Si el user no existe, nada que hacer
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Si el user NO está activo, no crear/activar cliente
  IF v_is_active IS DISTINCT FROM true THEN
    -- si existe un cliente espejo, lo desactiva
    UPDATE "public"."Client"
       SET "isActive" = false
     WHERE "id" = p_user_id; -- espejo por id
    RETURN;
  END IF;

  -- User activo: crear/actualizar cliente espejo con MISMO id
  INSERT INTO "public"."Client" ("id", "name", "taxId", "contact", "isActive", "departmentId")
  VALUES (p_user_id, v_full_name, NULL, NULL, true, v_department_id)
  ON CONFLICT ("id") DO UPDATE
    SET "name" = EXCLUDED."name",
        "isActive" = true,
        "departmentId" = EXCLUDED."departmentId";
END;
$$;

-- ===========================================
--  Trigger: después de INSERT/UPDATE/DELETE en "User"
-- ===========================================
CREATE OR REPLACE FUNCTION public.tr_user_sync_client()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- INSERT o UPDATE: sincroniza según NEW
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE') THEN
    PERFORM public.ensure_client_for_active_user(NEW."id");
    RETURN NEW;
  END IF;

  -- DELETE: si borran el user, puedes desactivar el client espejo
  IF (TG_OP = 'DELETE') THEN
    UPDATE "public"."Client"
       SET "isActive" = false
     WHERE "id" = OLD."id";
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Limpia triggers previos (idempotencia)
DROP TRIGGER IF EXISTS "trg_user_sync_client" ON "public"."User";

CREATE TRIGGER "trg_user_sync_client"
AFTER INSERT OR UPDATE OF "isActive", "fullName", "departmentId" OR DELETE
ON "public"."User"
FOR EACH ROW
EXECUTE FUNCTION public.tr_user_sync_client();

-- ===========================================
--  Backfill inicial: garantizar clientes de users activos
-- ===========================================
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT "id"
    FROM "public"."User"
    WHERE "isActive" = true
  LOOP
    PERFORM public.ensure_client_for_active_user(r."id");
  END LOOP;
END;
$$;

-- ============================================================
-- Limpieza de áreas y tipos incorrectos
-- UUIDs correctos (ya existen en producción):
--   Áreas:   Operativa, Proyectos, Comercial, Técnica
--   Tipos:   Area operativa, Proyectos, Ofertas, Licitaciones, Area tecnica
-- ============================================================

-- 1. Reasignar cotizaciones que apunten a tipos incorrectos
--    (onDelete: Restrict impide borrar tipos con cotizaciones)
--    Se asignan al tipo "Ofertas" como fallback.
UPDATE cotizacion
SET tipo_id = '25dae96a-6888-4a07-b5fa-c9cbb5b391f8'   -- Ofertas (Comercial)
WHERE tipo_id NOT IN (
  '8adeab3d-d2d4-4af5-98d1-e2aadfccb96f',  -- Area operativa
  'e20b476c-8af5-4002-81b6-19a1c585176e',  -- Proyectos
  '25dae96a-6888-4a07-b5fa-c9cbb5b391f8',  -- Ofertas
  '552548ae-4fb7-45a5-88f6-d02b8af0dfdd',  -- Licitaciones
  '01df3243-e582-4cad-b13a-2baf5dbd3af2'   -- Area tecnica
);

-- 2. Eliminar tipos incorrectos (los no listados arriba)
DELETE FROM tipo
WHERE id NOT IN (
  '8adeab3d-d2d4-4af5-98d1-e2aadfccb96f',
  'e20b476c-8af5-4002-81b6-19a1c585176e',
  '25dae96a-6888-4a07-b5fa-c9cbb5b391f8',
  '552548ae-4fb7-45a5-88f6-d02b8af0dfdd',
  '01df3243-e582-4cad-b13a-2baf5dbd3af2'
);

-- 3. Eliminar áreas incorrectas (las no listadas abajo)
--    Proyectos relacionados a áreas incorrectas se desvinculan primero.
UPDATE proyecto
SET area_id = NULL
WHERE area_id NOT IN (
  '9dbd6206-8f42-49f0-af91-8dded16da58b',  -- Proyectos
  '8700d5ed-2c72-478a-a1dd-aa494253bbf0',  -- Comercial
  '7bffbfd8-eb90-4798-b418-9ae58a4242f5',  -- Operativa
  'a815a7cd-1e40-45b7-9544-1af8bd20da1c'   -- Técnica
)
AND area_id IS NOT NULL;

DELETE FROM area
WHERE id NOT IN (
  '9dbd6206-8f42-49f0-af91-8dded16da58b',
  '8700d5ed-2c72-478a-a1dd-aa494253bbf0',
  '7bffbfd8-eb90-4798-b418-9ae58a4242f5',
  'a815a7cd-1e40-45b7-9544-1af8bd20da1c'
);

-- 4. Verificar resultado final
SELECT 'Areas' as tabla, id, nombre_area, tipo, icono FROM area ORDER BY tipo;
SELECT 'Tipos' as tabla, t.id, t.nombre, a.nombre_area FROM tipo t JOIN area a ON a.id = t.area_id ORDER BY a.tipo;

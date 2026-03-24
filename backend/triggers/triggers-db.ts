/**
 * ============================================================
 * TRIGGERS Y JOBS DEL SISTEMA — Script ejecutable
 * ============================================================
 * Ejecutar con:
 *   npx ts-node src/scripts/triggers.ts
 *
 * IMPORTANTE: Prisma NO persiste triggers SQL en migraciones.
 * Este script es la fuente de verdad de todos los triggers.
 * Ejecutar manualmente después de cada reset/migración de BD.
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IDs fijos de tipos comerciales
const TIPO_LICITACION_ID = '552548ae-4fb7-45a5-88f6-d02b8af0dfdd';
const TIPO_OFERTA_ID = '25dae96a-6888-4a07-b5fa-c9cbb5b391f8';

async function main() {
  console.log('▶ Ejecutando triggers del sistema...\n');

  await trigger_1_placeholder();
  await trigger_2_archivado_automatico_licitaciones();
  await trigger_3_archivado_automatico_ofertas();
  await trigger_4_migrar_comercial_existentes();

  console.log('\n✅ Todos los triggers ejecutados correctamente.');
}

// ============================================================
// [1] TRIGGER EXISTENTE
// Documenta aquí el trigger que ya tenías antes
// ============================================================
async function trigger_1_placeholder() {
  console.log('[1] Trigger existente — pendiente de documentar');
  // TODO: agregar aquí el SQL del trigger original
  // await prisma.$executeRawUnsafe(`...`);
}

// ============================================================
// [2] ARCHIVADO AUTOMÁTICO — LICITACIONES (30 días)
// Fecha: 2026-03-24
// Licitaciones activas donde algún producto tiene:
//   - con_descuento = true
//   - aprobacion_compra = false
//   - fecha_con_descuento <= NOW() - 30 días
// Implementado también como NestJS Cron (2:00 AM diario)
// Archivo: src/modules/cron-services/archivado-automatico.service.ts
// ============================================================
async function trigger_2_archivado_automatico_licitaciones() {
  console.log('[2] Archivado automático de licitaciones (30 días)...');

  const resultado = await prisma.$executeRawUnsafe(`
    UPDATE licitacion l
    SET
      estado         = 'ARCHIVADA',
      motivo_archivo = 'Archivado automáticamente: 30 días sin avanzar desde Con Descuento',
      fecha_archivo  = NOW()
    WHERE
      l.estado = 'ACTIVA'
      AND EXISTS (
        SELECT 1 FROM licitacion_producto lp
        WHERE lp.licitacion_id = l.id
          AND lp.con_descuento = true
          AND lp.aprobacion_compra = false
          AND lp.fecha_con_descuento <= NOW() - INTERVAL '30 days'
      )
  `);

  console.log('   → ' + resultado + ' licitacion(es) archivada(s)');
}

// ============================================================
// [3] ARCHIVADO AUTOMÁTICO — OFERTAS (30 días)
// Fecha: 2026-03-24
// Ofertas activas donde algún producto tiene:
//   - con_descuento = true
//   - aprobacion_compra = false
//   - fecha_con_descuento <= NOW() - 30 días
// Implementado también como NestJS Cron (2:00 AM diario)
// Archivo: src/modules/cron-services/archivado-automatico.service.ts
// ============================================================
async function trigger_3_archivado_automatico_ofertas() {
  console.log('[3] Archivado automático de ofertas (30 días)...');

  const resultado = await prisma.$executeRawUnsafe(`
    UPDATE oferta o
    SET
      estado         = 'ARCHIVADA',
      motivo_archivo = 'Archivado automáticamente: 30 días sin avanzar desde Con Descuento',
      fecha_archivo  = NOW()
    WHERE
      o.estado = 'ACTIVA'
      AND EXISTS (
        SELECT 1 FROM oferta_producto op
        WHERE op.oferta_id = o.id
          AND op.con_descuento = true
          AND op.aprobacion_compra = false
          AND op.fecha_con_descuento <= NOW() - INTERVAL '30 days'
      )
  `);

  console.log('   → ' + resultado + ' oferta(s) archivada(s)');
}

// ============================================================
// [4] MIGRACIÓN: Cotizaciones comerciales existentes
// Fecha: 2026-03-24
// Crea registros en licitacion/oferta para cotizaciones
// comerciales que existían antes de implementar el trigger.
// NOTA: Seguro de re-ejecutar, solo crea los que faltan.
// ============================================================
async function trigger_4_migrar_comercial_existentes() {
  console.log('[4] Migración de cotizaciones comerciales existentes...');

  const sinLicitacion = await prisma.cotizacion.findMany({
    where: { tipoId: TIPO_LICITACION_ID, licitacion: null },
    select: { id: true, nombreCotizacion: true },
  });

  for (const cot of sinLicitacion) {
    await prisma.licitacion.create({
      data: {
        cotizacionId: cot.id,
        nombre: cot.nombreCotizacion,
        estado: 'ACTIVA',
      },
    });
    console.log('   → Licitación creada: ' + cot.nombreCotizacion);
  }

  const sinOferta = await prisma.cotizacion.findMany({
    where: { tipoId: TIPO_OFERTA_ID, oferta: null },
    select: { id: true, nombreCotizacion: true },
  });

  for (const cot of sinOferta) {
    await prisma.oferta.create({
      data: {
        cotizacionId: cot.id,
        nombre: cot.nombreCotizacion,
        estado: 'ACTIVA',
      },
    });
    console.log('   → Oferta creada: ' + cot.nombreCotizacion);
  }

  console.log(
    '   → ' +
      sinLicitacion.length +
      ' licitacion(es) + ' +
      sinOferta.length +
      ' oferta(s) migradas',
  );
}

// ============================================================
// INSTRUCCIONES PARA AGREGAR NUEVOS TRIGGERS
// ============================================================
// 1. Crear nueva función: async function trigger_N_nombre() {}
// 2. Agregarla al main() arriba
// 3. Documentar fecha y descripción en el comentario del bloque
// ============================================================

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

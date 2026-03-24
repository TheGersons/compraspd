/**
 * ============================================================
 * MIGRACIÓN: Cotizaciones comerciales existentes
 * ============================================================
 * Crea registros en licitacion/oferta para todas las
 * cotizaciones comerciales que no tienen uno todavía.
 *
 * Ejecutar con:
 *   npx ts-node src/scripts/migrate-comercial.ts
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TIPO_LICITACION_ID = '552548ae-4fb7-45a5-88f6-d02b8af0dfdd';
const TIPO_OFERTA_ID = '25dae96a-6888-4a07-b5fa-c9cbb5b391f8';

async function main() {
  console.log('▶ Iniciando migración de cotizaciones comerciales...\n');

  // ============================================================
  // 1. Cotizaciones de tipo Licitación sin registro en licitacion
  // ============================================================
  const cotizacionesSinLicitacion = await prisma.cotizacion.findMany({
    where: {
      tipoId: TIPO_LICITACION_ID,
      licitacion: null,
    },
    select: { id: true, nombreCotizacion: true, fechaSolicitud: true },
  });

  console.log(`Licitaciones a migrar: ${cotizacionesSinLicitacion.length}`);
  for (const cot of cotizacionesSinLicitacion) {
    await prisma.licitacion.create({
      data: {
        cotizacionId: cot.id,
        nombre: cot.nombreCotizacion,
        estado: 'ACTIVA',
      },
    });
    console.log(
      `  ✅ Licitación creada para: ${cot.nombreCotizacion} (${cot.id})`,
    );
  }

  // ============================================================
  // 2. Cotizaciones de tipo Oferta sin registro en oferta
  // ============================================================
  const cotizacionesSinOferta = await prisma.cotizacion.findMany({
    where: {
      tipoId: TIPO_OFERTA_ID,
      oferta: null,
    },
    select: { id: true, nombreCotizacion: true, fechaSolicitud: true },
  });

  console.log(`\nOfertas a migrar: ${cotizacionesSinOferta.length}`);
  for (const cot of cotizacionesSinOferta) {
    await prisma.oferta.create({
      data: {
        cotizacionId: cot.id,
        nombre: cot.nombreCotizacion,
        estado: 'ACTIVA',
      },
    });
    console.log(`  ✅ Oferta creada para: ${cot.nombreCotizacion} (${cot.id})`);
  }

  console.log('\n✅ Migración completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * ============================================================
 * MIGRACIÓN: Reasignar cotizaciones de auxiliaroperaciones
 *            al tipo "logistica"
 * ============================================================
 * Busca todas las cotizaciones que tienen al menos un producto
 * con responsableSeguimiento = auxiliaroperaciones@energiapd.com
 * y cambia su tipoId al tipo "logistica".
 *
 * Si el tipo "logistica" no existe, lo crea bajo el área
 * que tenga tipo = "operativa" (o la primera área disponible).
 *
 * Ejecutar con:
 *   npx ts-node scripts/migrate-logistica.ts
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AUXILIAR_EMAIL = 'auxiliaroperaciones@energiapd.com';

async function main() {
  console.log('▶ Iniciando migración logística...\n');

  // ── 1. Obtener (o crear) el tipo "logistica" ────────────────
  let tipoLogistica = await prisma.tipo.findFirst({
    where: { nombre: { equals: 'logistica', mode: 'insensitive' } },
    include: { area: { select: { nombreArea: true } } },
  });

  if (!tipoLogistica) {
    console.log('  Tipo "logistica" no encontrado, creando...');

    // Buscar área operativa primero, luego la primera disponible
    const area = await prisma.area.findFirst({
      where: { tipo: 'operativa' },
    }) ?? await prisma.area.findFirst();

    if (!area) {
      throw new Error('No hay áreas en la base de datos. Crea al menos una antes de ejecutar este script.');
    }

    tipoLogistica = await prisma.tipo.create({
      data: { nombre: 'logistica', areaId: area.id },
      include: { area: { select: { nombreArea: true } } },
    });
    console.log(`  ✅ Tipo "logistica" creado bajo área "${tipoLogistica.area.nombreArea}"\n`);
  } else {
    console.log(`  ✅ Tipo "logistica" encontrado (id: ${tipoLogistica.id}, área: ${tipoLogistica.area.nombreArea})\n`);
  }

  // ── 2. Buscar el usuario auxiliaroperaciones ────────────────
  const auxiliar = await prisma.usuario.findFirst({
    where: { email: { equals: AUXILIAR_EMAIL, mode: 'insensitive' } },
    select: { id: true, nombre: true, email: true },
  });

  if (!auxiliar) {
    throw new Error(`Usuario "${AUXILIAR_EMAIL}" no encontrado en la base de datos.`);
  }
  console.log(`  👤 Auxiliar: ${auxiliar.nombre} (${auxiliar.email})\n`);

  // ── 3. Buscar cotizaciones afectadas ────────────────────────
  // Son las cotizaciones que tienen al menos un estadoProducto
  // asignado al auxiliar Y cuyo tipo actual NO sea ya logistica.
  const cotizaciones = await prisma.cotizacion.findMany({
    where: {
      detalles: {
        some: {
          estadosProductos: {
            some: { responsableSeguimientoId: auxiliar.id },
          },
        },
      },
      NOT: { tipoId: tipoLogistica.id },
    },
    select: {
      id: true,
      nombreCotizacion: true,
      tipo: { select: { nombre: true } },
      _count: { select: { detalles: true } },
    },
    orderBy: { fechaSolicitud: 'desc' },
  });

  console.log(`  📋 Cotizaciones a migrar: ${cotizaciones.length}\n`);

  if (cotizaciones.length === 0) {
    console.log('  Sin cambios necesarios. Todas las cotizaciones de auxiliaroperaciones ya son tipo logistica (o no existen).');
    return;
  }

  // ── 4. Actualizar tipo a logistica ─────────────────────────
  for (const cot of cotizaciones) {
    await prisma.cotizacion.update({
      where: { id: cot.id },
      data: { tipoId: tipoLogistica.id },
    });
    console.log(
      `  ✅ "${cot.nombreCotizacion}"  (${cot._count.detalles} productos)  [antes: ${cot.tipo.nombre}]`,
    );
  }

  console.log(`\n✅ Migración completada — ${cotizaciones.length} cotizacion(es) actualizadas.`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error durante la migración:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

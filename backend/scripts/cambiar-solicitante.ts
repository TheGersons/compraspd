/**
 * Reasigna solicitanteId en Cotizacion: las cotizaciones cuyo solicitante
 * actual sea Gerson Murillo, Loany o Brennedy pasan a Carla Sanchez
 * (gespro@energiapd.com).
 *
 * Cotizacion.solicitante_id es la única columna en el schema que apunta a
 * "solicitante"; Compra/CompraDetalle/EstadoProducto/etc. heredan al
 * solicitante a través de la cotización, así que con un solo UPDATE
 * queda consistente todo.
 *
 * Uso:
 *   npx ts-node --project tsconfig.json scripts/cambiar-solicitante.ts            # dry-run
 *   npx ts-node --project tsconfig.json scripts/cambiar-solicitante.ts --apply
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const NOMBRES_REEMPLAZO = ['gerson murillo', 'loany', 'brennedy'];
const EMAIL_DESTINO = 'gespro@energiapd.com';
const NOMBRE_DESTINO = 'carla sanchez';

async function main() {
  console.log(`\n🔄 Reasignar solicitante (${APPLY ? 'APPLY' : 'DRY-RUN'})\n`);

  // 1. Identificar usuario destino
  const destino = await prisma.usuario.findFirst({
    where: {
      OR: [
        { email: EMAIL_DESTINO },
        { nombre: { contains: NOMBRE_DESTINO, mode: 'insensitive' } },
      ],
    },
    select: { id: true, nombre: true, email: true },
  });

  if (!destino) {
    console.error(`❌ No se encontró el usuario destino (email=${EMAIL_DESTINO} o nombre=${NOMBRE_DESTINO}).`);
    process.exit(1);
  }
  if (destino.email !== EMAIL_DESTINO) {
    console.warn(`⚠️  El usuario destino tiene email ${destino.email}, no ${EMAIL_DESTINO}. Continuando con id=${destino.id}.`);
  }
  console.log(`✅ Usuario destino: ${destino.nombre} <${destino.email}>  id=${destino.id}\n`);

  // 2. Identificar usuarios a reemplazar
  const candidatos = await prisma.usuario.findMany({
    where: {
      OR: NOMBRES_REEMPLAZO.map((n) => ({
        nombre: { contains: n, mode: 'insensitive' as const },
      })),
    },
    select: { id: true, nombre: true, email: true },
  });

  if (candidatos.length === 0) {
    console.log('No hay usuarios candidatos a reemplazar. Saliendo.');
    return;
  }

  console.log(`Usuarios a reemplazar (${candidatos.length}):`);
  for (const u of candidatos) {
    console.log(`  - ${u.nombre} <${u.email}>  id=${u.id}`);
  }

  const idsReemplazar = candidatos.map((u) => u.id);
  if (idsReemplazar.includes(destino.id)) {
    console.error(`❌ El usuario destino (${destino.nombre}) está incluido en los candidatos a reemplazar. Abortando.`);
    process.exit(1);
  }

  // 3. Contar cotizaciones afectadas
  const total = await prisma.cotizacion.count({
    where: { solicitanteId: { in: idsReemplazar } },
  });
  console.log(`\n📋 Cotizaciones afectadas: ${total}`);

  if (total === 0) {
    console.log('Nada que actualizar.');
    return;
  }

  // Desglose por solicitante actual y por estado
  const desglose = await prisma.cotizacion.groupBy({
    by: ['solicitanteId', 'estado'],
    where: { solicitanteId: { in: idsReemplazar } },
    _count: { _all: true },
  });
  const userMap = new Map(candidatos.map((u) => [u.id, u.nombre]));
  console.log('\n   Desglose por solicitante / estado:');
  for (const row of desglose) {
    console.log(`     - ${userMap.get(row.solicitanteId)?.padEnd(30)}  ${row.estado.padEnd(20)}  ${row._count._all}`);
  }

  // Listado breve (primeros 15)
  const muestra = await prisma.cotizacion.findMany({
    where: { solicitanteId: { in: idsReemplazar } },
    select: {
      id: true,
      nombreCotizacion: true,
      estado: true,
      solicitanteId: true,
      solicitante: { select: { nombre: true } },
    },
    take: 15,
    orderBy: { fechaSolicitud: 'desc' },
  });
  console.log('\n   Muestra (máx 15):');
  for (const c of muestra) {
    console.log(`     ${c.id}  "${c.nombreCotizacion}"  estado=${c.estado}  solicitante=${c.solicitante.nombre}`);
  }

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se aplicó nada. Re-ejecuta con --apply para reasignar las ${total} cotizaciones a ${destino.nombre}.\n`);
    return;
  }

  // 4. Aplicar
  console.log(`\n💾 Reasignando ${total} cotizaciones a ${destino.nombre}...`);
  const result = await prisma.cotizacion.updateMany({
    where: { solicitanteId: { in: idsReemplazar } },
    data: { solicitanteId: destino.id },
  });
  console.log(`✅ Listo. Cotizaciones actualizadas: ${result.count}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

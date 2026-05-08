/**
 * Reasigna a Carla Sanchez (gespro@energiapd.com) cualquier registro cuyo
 * "responsable activo" sea Gerson Murillo, Loany o Brennedy.
 *
 * Cubre los 5 campos que representan asignación activa (no historial):
 *   - Cotizacion.solicitanteId               (relación UsuarioSolicitante)
 *   - Cotizacion.supervisorResponsableId     (relación SupervisorCotizacion)
 *   - EstadoProducto.responsableSeguimientoId (relación ResponsableSeguimiento)
 *   - LicitacionProducto.responsableId       (relación ResponsableLicitacion)
 *   - OfertaProducto.responsableId           (relación ResponsableOferta)
 *
 * NO toca campos de auditoría/log (subidoPor, creadoPor, archivadaPor,
 * aprobadoCompraPor, *Log.usuarioId, etc.) para preservar trazabilidad
 * histórica de quién hizo qué.
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

type Campo = {
  label: string;
  // Tabla Prisma + columna del FK que se va a reasignar
  count: (ids: string[]) => Promise<number>;
  update: (ids: string[], destinoId: string) => Promise<number>;
  // Trae una muestra para el dry-run
  muestra: (ids: string[], userMap: Map<string, string>) => Promise<string[]>;
};

function buildCampos(): Campo[] {
  return [
    {
      label: 'Cotizacion.solicitanteId',
      count: (ids) => prisma.cotizacion.count({ where: { solicitanteId: { in: ids } } }),
      update: async (ids, destinoId) => {
        const r = await prisma.cotizacion.updateMany({
          where: { solicitanteId: { in: ids } },
          data: { solicitanteId: destinoId },
        });
        return r.count;
      },
      muestra: async (ids, userMap) => {
        const rows = await prisma.cotizacion.findMany({
          where: { solicitanteId: { in: ids } },
          select: { id: true, nombreCotizacion: true, estado: true, solicitanteId: true },
          take: 5,
          orderBy: { fechaSolicitud: 'desc' },
        });
        return rows.map(
          (r) =>
            `       ${r.id}  "${r.nombreCotizacion}"  estado=${r.estado}  actual=${userMap.get(r.solicitanteId) ?? r.solicitanteId}`,
        );
      },
    },
    {
      label: 'Cotizacion.supervisorResponsableId',
      count: (ids) =>
        prisma.cotizacion.count({ where: { supervisorResponsableId: { in: ids } } }),
      update: async (ids, destinoId) => {
        const r = await prisma.cotizacion.updateMany({
          where: { supervisorResponsableId: { in: ids } },
          data: { supervisorResponsableId: destinoId },
        });
        return r.count;
      },
      muestra: async (ids, userMap) => {
        const rows = await prisma.cotizacion.findMany({
          where: { supervisorResponsableId: { in: ids } },
          select: {
            id: true,
            nombreCotizacion: true,
            estado: true,
            supervisorResponsableId: true,
          },
          take: 5,
          orderBy: { fechaSolicitud: 'desc' },
        });
        return rows.map(
          (r) =>
            `       ${r.id}  "${r.nombreCotizacion}"  estado=${r.estado}  actual=${userMap.get(r.supervisorResponsableId ?? '') ?? r.supervisorResponsableId}`,
        );
      },
    },
    {
      label: 'EstadoProducto.responsableSeguimientoId',
      count: (ids) =>
        prisma.estadoProducto.count({ where: { responsableSeguimientoId: { in: ids } } }),
      update: async (ids, destinoId) => {
        const r = await prisma.estadoProducto.updateMany({
          where: { responsableSeguimientoId: { in: ids } },
          data: { responsableSeguimientoId: destinoId },
        });
        return r.count;
      },
      muestra: async (ids, userMap) => {
        const rows = await prisma.estadoProducto.findMany({
          where: { responsableSeguimientoId: { in: ids } },
          select: {
            id: true,
            cotizacionDetalle: { select: { sku: true, descripcionProducto: true } },
            responsableSeguimientoId: true,
          },
          take: 5,
        });
        return rows.map(
          (r) =>
            `       ${r.id}  ${r.cotizacionDetalle?.sku ?? ''}  "${r.cotizacionDetalle?.descripcionProducto?.slice(0, 40) ?? ''}"  actual=${userMap.get(r.responsableSeguimientoId ?? '') ?? r.responsableSeguimientoId}`,
        );
      },
    },
    {
      label: 'LicitacionProducto.responsableId',
      count: (ids) =>
        prisma.licitacionProducto.count({ where: { responsableId: { in: ids } } }),
      update: async (ids, destinoId) => {
        const r = await prisma.licitacionProducto.updateMany({
          where: { responsableId: { in: ids } },
          data: { responsableId: destinoId },
        });
        return r.count;
      },
      muestra: async (ids, userMap) => {
        const rows = await prisma.licitacionProducto.findMany({
          where: { responsableId: { in: ids } },
          select: { id: true, sku: true, descripcion: true, responsableId: true },
          take: 5,
        });
        return rows.map(
          (r) =>
            `       ${r.id}  ${r.sku}  "${r.descripcion?.slice(0, 40)}"  actual=${userMap.get(r.responsableId ?? '') ?? r.responsableId}`,
        );
      },
    },
    {
      label: 'OfertaProducto.responsableId',
      count: (ids) =>
        prisma.ofertaProducto.count({ where: { responsableId: { in: ids } } }),
      update: async (ids, destinoId) => {
        const r = await prisma.ofertaProducto.updateMany({
          where: { responsableId: { in: ids } },
          data: { responsableId: destinoId },
        });
        return r.count;
      },
      muestra: async (ids, userMap) => {
        const rows = await prisma.ofertaProducto.findMany({
          where: { responsableId: { in: ids } },
          select: { id: true, sku: true, descripcion: true, responsableId: true },
          take: 5,
        });
        return rows.map(
          (r) =>
            `       ${r.id}  ${r.sku}  "${r.descripcion?.slice(0, 40)}"  actual=${userMap.get(r.responsableId ?? '') ?? r.responsableId}`,
        );
      },
    },
  ];
}

async function main() {
  console.log(`\n🔄 Reasignar responsable activo (${APPLY ? 'APPLY' : 'DRY-RUN'})\n`);

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
    console.error(
      `❌ No se encontró el usuario destino (email=${EMAIL_DESTINO} o nombre=${NOMBRE_DESTINO}).`,
    );
    process.exit(1);
  }
  if (destino.email !== EMAIL_DESTINO) {
    console.warn(
      `⚠️  El usuario destino tiene email ${destino.email}, no ${EMAIL_DESTINO}. Continuando con id=${destino.id}.`,
    );
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
    console.error(
      `❌ El usuario destino (${destino.nombre}) está incluido en los candidatos a reemplazar. Abortando.`,
    );
    process.exit(1);
  }

  const userMap = new Map(candidatos.map((u) => [u.id, u.nombre]));
  const campos = buildCampos();

  // 3. Conteo + muestra por campo
  console.log('\n📋 Registros afectados por campo:');
  let totalGlobal = 0;
  const conteos: { label: string; total: number }[] = [];
  for (const c of campos) {
    const total = await c.count(idsReemplazar);
    conteos.push({ label: c.label, total });
    totalGlobal += total;
    console.log(`   ${c.label.padEnd(40)} ${total}`);
    if (total > 0) {
      const m = await c.muestra(idsReemplazar, userMap);
      for (const line of m) console.log(line);
    }
  }
  console.log(`\n   TOTAL filas a actualizar: ${totalGlobal}`);

  if (totalGlobal === 0) {
    console.log('\nNada que actualizar.');
    return;
  }

  if (!APPLY) {
    console.log(
      `\n[DRY-RUN] No se aplicó nada. Re-ejecuta con --apply para reasignar a ${destino.nombre}.\n`,
    );
    return;
  }

  // 4. Aplicar (transacción única)
  console.log(`\n💾 Reasignando ${totalGlobal} filas a ${destino.nombre}...`);
  const resultados = await prisma.$transaction(async () => {
    const out: { label: string; updated: number }[] = [];
    for (const c of campos) {
      const updated = await c.update(idsReemplazar, destino.id);
      out.push({ label: c.label, updated });
    }
    return out;
  });

  console.log('\n✅ Listo. Resumen:');
  for (const r of resultados) {
    console.log(`   ${r.label.padEnd(40)} actualizadas=${r.updated}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

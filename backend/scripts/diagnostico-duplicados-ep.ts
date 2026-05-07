/**
 * Diagnóstico: detectar EstadoProducto duplicados por cotizacionDetalleId.
 *
 * Causa raíz sospechada: followups.service.ts hace backfill de EstadoProductos
 * comparando por SKU. Si el SKU del EP cambia (o el de CotizacionDetalle queda
 * distinto), el backfill crea un EP nuevo apuntando al mismo detalle.
 *
 * Uso:
 *   npx ts-node --project tsconfig.json scripts/diagnostico-duplicados-ep.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Diagnóstico de EstadoProducto duplicados ===\n');

  // 1) Detalles con más de un EstadoProducto
  const eps = await prisma.estadoProducto.groupBy({
    by: ['cotizacionDetalleId'],
    where: { cotizacionDetalleId: { not: null } },
    _count: { _all: true },
    having: { cotizacionDetalleId: { _count: { gt: 1 } } as any },
  });

  console.log(`Detalles con >1 EstadoProducto: ${eps.length}`);

  for (const grp of eps) {
    const detalleId = grp.cotizacionDetalleId!;
    const items = await prisma.estadoProducto.findMany({
      where: { cotizacionDetalleId: detalleId },
      select: {
        id: true,
        sku: true,
        descripcion: true,
        cantidad: true,
        aprobadoCompra: true,
        comprado: true,
        rechazado: true,
        ordenCompraId: true,
        cotizacionId: true,
        precioUnitario: true,
        cotizado: true,
        creado: true,
      },
      orderBy: { creado: 'asc' },
    });
    const detalle = await prisma.cotizacionDetalle.findUnique({
      where: { id: detalleId },
      include: { cotizacion: { select: { id: true, nombreCotizacion: true } } },
    });
    console.log('---');
    console.log(
      `Cot: ${detalle?.cotizacion.nombreCotizacion} (${detalle?.cotizacion.id})`,
    );
    console.log(
      `Detalle ${detalleId} | SKU=${detalle?.sku} | desc="${detalle?.descripcionProducto}"`,
    );
    console.log(`EstadoProductos (${items.length}):`);
    for (const ep of items) {
      console.log(
        `  - id=${ep.id} sku=${ep.sku} cant=${ep.cantidad} ` +
          `apCompra=${ep.aprobadoCompra} comprado=${ep.comprado} rechazado=${ep.rechazado} ` +
          `cotizado=${ep.cotizado} ocId=${ep.ordenCompraId ?? 'null'} ` +
          `precioU=${ep.precioUnitario ?? 'null'} creado=${ep.creado.toISOString()}`,
      );
    }
  }

  // 2) Cotizaciones con desbalance (más EPs que CotizacionDetalle)
  console.log('\n=== Cotizaciones con desbalance (eps > detalles) ===');
  const cotizaciones = await prisma.cotizacion.findMany({
    select: {
      id: true,
      nombreCotizacion: true,
      _count: {
        select: {
          detalles: true,
          estadosProductos: true,
        },
      },
    },
  });
  const desbalanceadas = cotizaciones.filter(
    (c) => c._count.estadosProductos > c._count.detalles,
  );
  console.log(`Cotizaciones afectadas: ${desbalanceadas.length}`);
  for (const c of desbalanceadas) {
    const aprobados = await prisma.estadoProducto.count({
      where: { cotizacionId: c.id, aprobadoCompra: true },
    });
    console.log(
      `- "${c.nombreCotizacion}" (${c.id}) detalles=${c._count.detalles} eps=${c._count.estadosProductos} eps_aprobados=${aprobados}`,
    );
  }

  // 3) EstadoProductos huérfanos (cotizacionId set, cotizacionDetalleId null)
  console.log('\n=== EPs sin cotizacionDetalleId pero con cotizacionId ===');
  const huerfanos = await prisma.estadoProducto.findMany({
    where: { cotizacionId: { not: null }, cotizacionDetalleId: null },
    select: {
      id: true,
      sku: true,
      descripcion: true,
      aprobadoCompra: true,
      comprado: true,
      ordenCompraId: true,
      cotizacion: { select: { nombreCotizacion: true } },
    },
  });
  console.log(`Total huérfanos: ${huerfanos.length}`);
  for (const h of huerfanos.slice(0, 30)) {
    console.log(
      `  - id=${h.id} cot="${h.cotizacion?.nombreCotizacion}" sku=${h.sku} apCompra=${h.aprobadoCompra} comprado=${h.comprado} oc=${h.ordenCompraId ?? 'null'}`,
    );
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

/**
 * Limpieza de EstadoProducto duplicados por cotizacionDetalleId.
 *
 * Estrategia para cada grupo:
 *   - Mantener el EP "real": el que tenga aprobadoCompra=true, comprado=true,
 *     o precioUnitario != null (en orden de prioridad).
 *   - Si hay empate, mantener el más antiguo (creado primero).
 *   - Borrar los demás, validando que no tengan:
 *       documentosAdjuntos, historialFechas, justificacionesNoAplica,
 *       licitacionProductos, ofertaProductos.
 *
 * Modo:
 *   --dry-run  (default) → solo imprime lo que haría
 *   --apply              → ejecuta la limpieza
 *
 * Uso:
 *   npx ts-node --project tsconfig.json scripts/limpiar-duplicados-ep.ts
 *   npx ts-node --project tsconfig.json scripts/limpiar-duplicados-ep.ts --apply
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');

type EP = {
  id: string;
  sku: string;
  descripcion: string;
  cantidad: number | null;
  aprobadoCompra: boolean;
  comprado: boolean;
  rechazado: boolean;
  cotizado: boolean;
  precioUnitario: Prisma.Decimal | null;
  ordenCompraId: string | null;
  cotizacionId: string | null;
  creado: Date;
};

function elegirGanador(items: EP[]): EP {
  // Prioridad: aprobadoCompra > comprado > precioUnitario != null > más antiguo
  const sorted = [...items].sort((a, b) => {
    const score = (e: EP) =>
      (e.aprobadoCompra ? 1000 : 0) +
      (e.comprado ? 500 : 0) +
      (e.precioUnitario != null ? 250 : 0) +
      (e.cotizado ? 50 : 0) +
      (e.ordenCompraId ? 10 : 0);
    const sb = score(b);
    const sa = score(a);
    if (sb !== sa) return sb - sa;
    return a.creado.getTime() - b.creado.getTime(); // más antiguo gana
  });
  return sorted[0];
}

async function tieneRelacionesBloqueantes(epId: string) {
  const [docs, hist, just, licit, oferta] = await Promise.all([
    prisma.documentoAdjunto.count({ where: { estadoProductoId: epId } }),
    prisma.historialFechaLimite.count({ where: { estadoProductoId: epId } }),
    prisma.justificacionNoAplica.count({ where: { estadoProductoId: epId } }),
    prisma.licitacionProducto.count({ where: { estadoProductoId: epId } }),
    prisma.ofertaProducto.count({ where: { estadoProductoId: epId } }),
  ]);
  const total = docs + hist + just + licit + oferta;
  return { total, docs, hist, just, licit, oferta };
}

async function main() {
  console.log(`=== Limpieza duplicados EstadoProducto (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===\n`);

  const grupos = await prisma.estadoProducto.groupBy({
    by: ['cotizacionDetalleId'],
    where: { cotizacionDetalleId: { not: null } },
    _count: { _all: true },
    having: { cotizacionDetalleId: { _count: { gt: 1 } } as any },
  });

  console.log(`Grupos duplicados: ${grupos.length}\n`);

  let toDelete: string[] = [];
  let bloqueados: { id: string; rel: any }[] = [];
  type Transfer = { ganadorId: string; nuevoOcId: string };
  let transferencias: Transfer[] = [];
  let conflictosOC: { detalleId: string; ganador: string; ocGanador: string; perdedor: string; ocPerdedor: string }[] = [];

  for (const g of grupos) {
    const detalleId = g.cotizacionDetalleId!;
    const items = (await prisma.estadoProducto.findMany({
      where: { cotizacionDetalleId: detalleId },
      orderBy: { creado: 'asc' },
    })) as unknown as EP[];

    const ganador = elegirGanador(items);
    const perdedores = items.filter((x) => x.id !== ganador.id);

    console.log(`Detalle ${detalleId}`);
    console.log(`  KEEP   ${ganador.id} sku=${ganador.sku} apCompra=${ganador.aprobadoCompra} comprado=${ganador.comprado} precio=${ganador.precioUnitario} ocId=${ganador.ordenCompraId ?? 'null'}`);
    for (const p of perdedores) {
      const rel = await tieneRelacionesBloqueantes(p.id);
      if (rel.total > 0) {
        console.log(`  SKIP   ${p.id} sku=${p.sku} → tiene relaciones (${JSON.stringify(rel)})`);
        bloqueados.push({ id: p.id, rel });
        continue;
      }
      // Manejo de ordenCompraId del perdedor
      if (p.ordenCompraId && p.ordenCompraId !== ganador.ordenCompraId) {
        if (!ganador.ordenCompraId) {
          // Transferir OC al ganador
          console.log(`  TRANSFER ocId=${p.ordenCompraId} → ${ganador.id}`);
          transferencias.push({ ganadorId: ganador.id, nuevoOcId: p.ordenCompraId });
        } else {
          // Conflicto: ambos tienen OC distinta. Preservar la del ganador
          // (refleja el estado avanzado real, comprado=true).
          console.log(`  CONFLICT ⚠ ganador.ocId=${ganador.ordenCompraId} ≠ perdedor.ocId=${p.ordenCompraId} (se mantiene la del ganador)`);
          conflictosOC.push({
            detalleId,
            ganador: ganador.id,
            ocGanador: ganador.ordenCompraId,
            perdedor: p.id,
            ocPerdedor: p.ordenCompraId,
          });
        }
      }
      console.log(`  DELETE ${p.id} sku=${p.sku} apCompra=${p.aprobadoCompra} comprado=${p.comprado} precio=${p.precioUnitario} ocId=${p.ordenCompraId ?? 'null'}`);
      toDelete.push(p.id);
    }
  }

  console.log('\n=== Resumen ===');
  console.log(`A borrar:                     ${toDelete.length}`);
  console.log(`Transferencias de OC:         ${transferencias.length}`);
  console.log(`Conflictos de OC (revisar):   ${conflictosOC.length}`);
  console.log(`Bloqueados (tienen docs/etc): ${bloqueados.length}`);

  if (conflictosOC.length > 0) {
    console.log('\n⚠ CONFLICTOS DE OC (preservando OC del ganador):');
    for (const c of conflictosOC) {
      console.log(`   detalle=${c.detalleId}  ganador=${c.ganador} oc=${c.ocGanador}  ↔  perdedor=${c.perdedor} oc=${c.ocPerdedor}`);
    }
  }

  if (!APPLY) {
    console.log('\n[DRY-RUN] No se borró nada. Re-ejecuta con --apply para aplicar.');
    return;
  }

  if (toDelete.length === 0) {
    console.log('\nNada que borrar.');
    return;
  }

  console.log('\nAplicando transferencias de OC...');
  for (const t of transferencias) {
    await prisma.estadoProducto.update({
      where: { id: t.ganadorId },
      data: { ordenCompraId: t.nuevoOcId },
    });
  }
  console.log(`OCs transferidas: ${transferencias.length}`);

  console.log('Borrando duplicados...');
  const result = await prisma.estadoProducto.deleteMany({
    where: { id: { in: toDelete } },
  });
  console.log(`Borrados: ${result.count}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

/**
 * Analiza, para los EstadoProducto del área "proyectos", cuántos días hay
 * que mover la fechaLimite del primer estado pendiente para que el
 * proyecto quede en VERDE.
 *
 * Regla del dashboard (calcularEstadoProyecto):
 *   - DANGER: now > fechaLimite
 *   - WARN  : (fechaLimite - now) / (fechaLimite - fechaInicio) < 0.3
 *   - SUCCESS: el resto
 *
 * Donde fechaInicio = fecha[estadoEvaluado] || creado.
 *
 * Para que un EP esté en verde necesitamos:
 *   (fechaLimite - now) / (fechaLimite - fechaInicio) >= 0.3
 * Si llamamos D = fechaLimite - now y A = now - fechaInicio:
 *   D / (D + A) >= 0.3   →   D >= (3/7) * A
 *
 * Es decir: el buffer hacia el futuro debe ser >= 3/7 de la antigüedad
 * desde que arrancó el proceso. Mientras más viejo el proceso, más
 * buffer necesario. Reportamos el máximo D requerido entre todos los
 * EPs como "días mínimos para verde global" + simulamos varios N.
 *
 * Uso:
 *   npx ts-node --project tsconfig.json scripts/analizar-dias-verde.ts
 *   npx ts-node --project tsconfig.json scripts/analizar-dias-verde.ts --area proyectos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ESTADOS_INTERNACIONAL = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado',
  'aprobacionPlanos', 'primerSeguimiento', 'enFOB',
  'cotizacionFleteInternacional', 'conBL', 'segundoSeguimiento', 'enCIF',
  'recibido',
];
const ESTADOS_NACIONAL = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado', 'recibido',
];

const ESTADO_A_FECHA_LIMITE: Record<string, string> = {
  cotizado: 'fechaLimiteCotizado',
  conDescuento: 'fechaLimiteConDescuento',
  aprobacionCompra: 'fechaLimiteAprobacionCompra',
  comprado: 'fechaLimiteComprado',
  pagado: 'fechaLimitePagado',
  aprobacionPlanos: 'fechaLimiteAprobacionPlanos',
  primerSeguimiento: 'fechaLimitePrimerSeguimiento',
  enFOB: 'fechaLimiteEnFOB',
  cotizacionFleteInternacional: 'fechaLimiteCotizacionFleteInternacional',
  conBL: 'fechaLimiteConBL',
  segundoSeguimiento: 'fechaLimiteSegundoSeguimiento',
  enCIF: 'fechaLimiteEnCIF',
  recibido: 'fechaLimiteRecibido',
};
const ESTADO_A_FECHA: Record<string, string> = {
  cotizado: 'fechaCotizado',
  conDescuento: 'fechaConDescuento',
  aprobacionCompra: 'fechaAprobacionCompra',
  comprado: 'fechaComprado',
  pagado: 'fechaPagado',
  aprobacionPlanos: 'fechaAprobacionPlanos',
  primerSeguimiento: 'fechaPrimerSeguimiento',
  enFOB: 'fechaEnFOB',
  cotizacionFleteInternacional: 'fechaCotizacionFleteInternacional',
  conBL: 'fechaConBL',
  segundoSeguimiento: 'fechaSegundoSeguimiento',
  enCIF: 'fechaEnCIF',
  recibido: 'fechaRecibido',
};

const MS_DIA = 1000 * 60 * 60 * 24;

function parseArgs() {
  const args = process.argv.slice(2);
  let area = 'proyectos';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--area' && args[i + 1]) area = args[++i];
  }
  return { area };
}

async function main() {
  const { area } = parseArgs();
  const now = new Date();

  const eps = (await prisma.estadoProducto.findMany({
    where: {
      rechazado: false,
      cotizacion: {
        estado: { notIn: ['CANCELADA', 'RECHAZADA'] as any },
        NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
        proyecto: { area: { tipo: area } },
      },
    },
    include: {
      cotizacion: {
        select: {
          tipoCompra: true,
          nombreCotizacion: true,
          proyecto: { select: { id: true, nombre: true } },
        },
      },
      proyecto: { select: { id: true, nombre: true } },
    },
  })) as any[];

  console.log(`\n📊 Análisis de fechas — área: ${area}`);
  console.log(`   EPs evaluados: ${eps.length}\n`);

  type Item = {
    epId: string;
    proyecto: string;
    descripcion: string;
    estado: string;
    fechaLimite: Date;
    fechaInicio: Date;
    antiguedadDias: number;
    actualEstadoColor: 'success' | 'warn' | 'danger';
    diasMinParaVerde: number;
  };

  const items: Item[] = [];

  for (const ep of eps) {
    const tipoCompra = ep.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estados = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    const proyectoNombre =
      ep.proyecto?.nombre || ep.cotizacion?.proyecto?.nombre || 'Sin proyecto';

    for (const estadoKey of estados) {
      if (ep[estadoKey]) continue;

      const fechaLimite: Date | null = ep[ESTADO_A_FECHA_LIMITE[estadoKey]] ?? null;
      if (!fechaLimite) break;

      const fechaInicio: Date = ep[ESTADO_A_FECHA[estadoKey]] ?? ep.creado;
      const antiguedadMs = now.getTime() - new Date(fechaInicio).getTime();
      const antiguedadDias = Math.max(0, Math.ceil(antiguedadMs / MS_DIA));

      // Color actual
      const totalMs = new Date(fechaLimite).getTime() - new Date(fechaInicio).getTime();
      const restanteMs = new Date(fechaLimite).getTime() - now.getTime();
      let color: 'success' | 'warn' | 'danger' = 'success';
      if (now > new Date(fechaLimite)) color = 'danger';
      else if (totalMs > 0 && restanteMs / totalMs < 0.3) color = 'warn';

      // D mínimo (días desde HOY hasta la nueva fechaLimite) para verde:
      //   D >= (3/7) * antiguedad
      // +1 para evitar empate exacto en 0.3
      const diasMinParaVerde = Math.max(1, Math.ceil((3 / 7) * antiguedadDias) + 1);

      items.push({
        epId: ep.id,
        proyecto: proyectoNombre,
        descripcion: (ep.descripcion || ep.sku || '?').slice(0, 50),
        estado: estadoKey,
        fechaLimite: new Date(fechaLimite),
        fechaInicio: new Date(fechaInicio),
        antiguedadDias,
        actualEstadoColor: color,
        diasMinParaVerde,
      });
      break;
    }
  }

  // 1) Distribución actual
  const actualSum = items.reduce(
    (acc, i) => {
      acc[i.actualEstadoColor]++;
      return acc;
    },
    { success: 0, warn: 0, danger: 0 } as Record<string, number>,
  );
  console.log('🎨 Color actual del primer estado pendiente:');
  console.log(`   🟢 success: ${actualSum.success}`);
  console.log(`   🟡 warn   : ${actualSum.warn}`);
  console.log(`   🔴 danger : ${actualSum.danger}\n`);

  // 2) Por proyecto: días mínimos
  const porProyecto = new Map<string, Item[]>();
  for (const i of items) {
    if (!porProyecto.has(i.proyecto)) porProyecto.set(i.proyecto, []);
    porProyecto.get(i.proyecto)!.push(i);
  }

  console.log('📁 Días mínimos para llevar a VERDE por proyecto:');
  console.log('─'.repeat(110));
  console.log(
    'Proyecto'.padEnd(50) +
    'EPs'.padEnd(6) +
    'Color hoy'.padEnd(28) +
    'D mín verde'.padEnd(13) +
    'EP crítico (mayor antigüedad)',
  );
  console.log('─'.repeat(110));

  type Resumen = { proyecto: string; eps: number; dMin: number; danger: number; warn: number };
  const resumenes: Resumen[] = [];

  for (const [proyecto, list] of [...porProyecto.entries()].sort((a, b) => {
    const ma = Math.max(...a[1].map(x => x.diasMinParaVerde));
    const mb = Math.max(...b[1].map(x => x.diasMinParaVerde));
    return mb - ma;
  })) {
    const dMin = Math.max(...list.map(x => x.diasMinParaVerde));
    const critico = list.reduce((max, x) => (x.diasMinParaVerde > max.diasMinParaVerde ? x : max));
    const danger = list.filter(x => x.actualEstadoColor === 'danger').length;
    const warn = list.filter(x => x.actualEstadoColor === 'warn').length;
    const succ = list.filter(x => x.actualEstadoColor === 'success').length;
    resumenes.push({ proyecto, eps: list.length, dMin, danger, warn });

    console.log(
      proyecto.slice(0, 49).padEnd(50) +
      String(list.length).padEnd(6) +
      `🔴${danger} 🟡${warn} 🟢${succ}`.padEnd(28) +
      `+${dMin}d`.padEnd(13) +
      `${critico.descripcion} (ant=${critico.antiguedadDias}d, ${critico.estado})`,
    );
  }

  console.log('─'.repeat(110));

  // 3) Días mínimos GLOBALES
  const dMinGlobal = items.length > 0 ? Math.max(...items.map(i => i.diasMinParaVerde)) : 0;
  const dMinPromedio = items.length > 0
    ? Math.ceil(items.reduce((s, i) => s + i.diasMinParaVerde, 0) / items.length)
    : 0;
  console.log('\n🎯 Resumen global:');
  console.log(`   • Días mínimos para que TODO esté en verde: +${dMinGlobal} días`);
  console.log(`   • Días promedio entre EPs                 : +${dMinPromedio} días`);

  // 4) Simulación con varios N
  const candidatos = [7, 14, 21, 30, 45, 60, 90, 120, 180, dMinGlobal];
  const Ns = [...new Set(candidatos)].sort((a, b) => a - b);
  console.log('\n🧪 Simulación: si corro la fechaLimite del estado pendiente a (now + N días):');
  console.log('─'.repeat(70));
  console.log('  N (días)'.padEnd(12) + 'Verde'.padEnd(10) + 'Amarillo'.padEnd(12) + 'Rojo');
  console.log('─'.repeat(70));

  for (const N of Ns) {
    let s = 0, w = 0, d = 0;
    for (const it of items) {
      // Nueva fechaLimite simulada = now + N días
      const D = N; // días buffer
      const A = it.antiguedadDias;
      if (D <= 0) { d++; continue; }
      const ratio = D / (D + A);
      if (ratio >= 0.3) s++;
      else w++;
    }
    const ok = (s === items.length) ? '  ← ✅ todo verde' : '';
    console.log(
      `  +${N}d`.padEnd(12) +
      String(s).padEnd(10) +
      String(w).padEnd(12) +
      String(d) + ok,
    );
  }

  console.log('─'.repeat(70));
  console.log('\n💡 Recomendación:');
  console.log(`   Ejecutar:  npx ts-node --project tsconfig.json scripts/corregir-fechas.ts --dias ${dMinGlobal}`);
  console.log(`   Eso lleva el buffer del primer estado pendiente a +${dMinGlobal} días desde HOY,`);
  console.log(`   garantizando que TODOS los proyectos del área "${area}" queden en verde.\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

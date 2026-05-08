/**
 * Valida la integridad de la secuencia de fechas en todos los EstadoProducto.
 *
 * Para cada EP recorre la secuencia de estados (NACIONAL o INTERNACIONAL según
 * tipoCompra de la cotización) y detecta cuando el `fechaLimite*` (o
 * `fechaReal*`) de un estado posterior es <= que el del estado anterior. Eso
 * típicamente genera traslapes visuales en el dashboard (el estado "siguiente"
 * aparece como vencido aunque el actual fue extendido).
 *
 * Modos:
 *   --dry-run  (default) — solo reporta
 *   --apply               — aplica las correcciones (cascade forward, +1 día
 *                           de spacing entre estados consecutivos)
 *
 * Opciones extra:
 *   --area    TIPO        — filtra por tipo de área (ej: proyectos, comercial)
 *                           si se omite, valida TODAS las áreas
 *   --tipo-compra T       — filtra por NACIONAL | INTERNACIONAL
 *   --campos  c1,c2       — qué timelines validar: "limite", "real", "hecho"
 *                           (default: "limite,real")
 *   --gap     N           — días mínimos de spacing al corregir (default: 1)
 *
 * Ejemplos:
 *   npx ts-node --project tsconfig.json scripts/validar-secuencia-fechas.ts
 *   npx ts-node --project tsconfig.json scripts/validar-secuencia-fechas.ts --apply
 *   npx ts-node --project tsconfig.json scripts/validar-secuencia-fechas.ts --area proyectos --apply
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Secuencias por tipo de compra ──────────────────────────────────────────
const ESTADOS_INTERNACIONAL = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado',
  'aprobacionPlanos', 'primerSeguimiento', 'enFOB',
  'cotizacionFleteInternacional', 'conBL', 'segundoSeguimiento', 'enCIF',
  'recibido',
];
const ESTADOS_NACIONAL = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado', 'recibido',
];

const FECHA_LIMITE: Record<string, string> = {
  cotizado:                      'fechaLimiteCotizado',
  conDescuento:                  'fechaLimiteConDescuento',
  aprobacionCompra:              'fechaLimiteAprobacionCompra',
  comprado:                      'fechaLimiteComprado',
  pagado:                        'fechaLimitePagado',
  aprobacionPlanos:              'fechaLimiteAprobacionPlanos',
  primerSeguimiento:             'fechaLimitePrimerSeguimiento',
  enFOB:                         'fechaLimiteEnFOB',
  cotizacionFleteInternacional:  'fechaLimiteCotizacionFleteInternacional',
  conBL:                         'fechaLimiteConBL',
  segundoSeguimiento:            'fechaLimiteSegundoSeguimiento',
  enCIF:                         'fechaLimiteEnCIF',
  recibido:                      'fechaLimiteRecibido',
};
const FECHA_REAL: Record<string, string> = {
  cotizado:                      'fechaCotizado',                 // sin "Real"
  conDescuento:                  'fechaConDescuento',             // sin "Real"
  aprobacionCompra:              'fechaRealAprobacionCompra',
  comprado:                      'fechaRealComprado',
  pagado:                        'fechaRealPagado',
  aprobacionPlanos:              'fechaRealAprobacionPlanos',
  primerSeguimiento:             'fechaRealPrimerSeguimiento',
  enFOB:                         'fechaRealEnFOB',
  cotizacionFleteInternacional:  'fechaRealCotizacionFleteInternacional',
  conBL:                         'fechaRealConBL',
  segundoSeguimiento:            'fechaRealSegundoSeguimiento',
  enCIF:                         'fechaRealEnCIF',
  recibido:                      'fechaRealRecibido',
};
const FECHA_HECHO: Record<string, string> = {
  cotizado:                      'fechaCotizado',
  conDescuento:                  'fechaConDescuento',
  aprobacionCompra:              'fechaAprobacionCompra',
  comprado:                      'fechaComprado',
  pagado:                        'fechaPagado',
  aprobacionPlanos:              'fechaAprobacionPlanos',
  primerSeguimiento:             'fechaPrimerSeguimiento',
  enFOB:                         'fechaEnFOB',
  cotizacionFleteInternacional:  'fechaCotizacionFleteInternacional',
  conBL:                         'fechaConBL',
  segundoSeguimiento:            'fechaSegundoSeguimiento',
  enCIF:                         'fechaEnCIF',
  recibido:                      'fechaRecibido',
};

// ── Argumentos ─────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let apply = false;
  let area: string | null = null;
  let tipoCompra: string | null = null;
  let campos = ['limite', 'real'];
  let gap = 1;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--apply') apply = true;
    else if (args[i] === '--dry-run') apply = false;
    else if (args[i] === '--area' && args[i + 1]) area = args[++i];
    else if (args[i] === '--tipo-compra' && args[i + 1]) tipoCompra = args[++i].toUpperCase();
    else if (args[i] === '--campos' && args[i + 1]) campos = args[++i].split(',');
    else if (args[i] === '--gap' && args[i + 1]) gap = parseInt(args[++i], 10) || 1;
  }
  return { apply, area, tipoCompra, campos, gap };
}

function fmt(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : '—';
}

function addDias(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

type Violacion = {
  epId: string;
  proyecto: string;
  area: string;
  descripcion: string;
  timeline: 'limite' | 'real' | 'hecho';
  estadoPrev: string;
  estadoCur: string;
  valorPrev: Date;
  valorCur: Date;
  valorSugerido: Date;
};

/**
 * Valida una timeline (ej: fechaLimite*) en un EP. Devuelve violaciones y
 * un set de campos→nuevo valor para corregir (cascade forward).
 */
function validarTimeline(
  ep: any,
  secuencia: string[],
  mapaCampo: Record<string, string>,
  timeline: 'limite' | 'real' | 'hecho',
  gap: number,
  proyectoNombre: string,
  areaNombre: string,
): { violaciones: Violacion[]; correcciones: Record<string, Date> } {
  const violaciones: Violacion[] = [];
  const correcciones: Record<string, Date> = {};

  let prev: { estado: string; valor: Date } | null = null;
  for (const estado of secuencia) {
    const campo = mapaCampo[estado];
    const original: Date | null = ep[campo] ?? null;
    if (!original) continue;

    // Si ya corregimos antes, usamos el corregido para comparar con el siguiente
    const actual = correcciones[campo] ?? new Date(original);

    if (prev && actual.getTime() < prev.valor.getTime()) {
      // Violación: el estado actual está estrictamente ANTES que el anterior
      // (mismas fechas se permiten — no son traslape, solo coincidencia)
      const sugerido = addDias(prev.valor, gap);
      violaciones.push({
        epId: ep.id,
        proyecto: proyectoNombre,
        area: areaNombre,
        descripcion: (ep.descripcion || ep.sku || '?').slice(0, 50),
        timeline,
        estadoPrev: prev.estado,
        estadoCur: estado,
        valorPrev: prev.valor,
        valorCur: original,
        valorSugerido: sugerido,
      });
      correcciones[campo] = sugerido;
      prev = { estado, valor: sugerido };
    } else {
      prev = { estado, valor: actual };
    }
  }

  return { violaciones, correcciones };
}

async function main() {
  const { apply, area, tipoCompra, campos, gap } = parseArgs();

  console.log('\n🔎 Validación de secuencia de fechas en EstadoProducto');
  console.log(`   Modo:        ${apply ? '✏️  APPLY (escritura real)' : '🔍 DRY-RUN'}`);
  console.log(`   Área:        ${area ?? 'TODAS'}`);
  console.log(`   tipoCompra:  ${tipoCompra ?? 'TODOS'}`);
  console.log(`   Timelines:   ${campos.join(', ')}`);
  console.log(`   Gap mínimo:  +${gap} día${gap === 1 ? '' : 's'} entre estados`);
  console.log('─'.repeat(80));

  const where: any = {
    rechazado: false,
    cotizacion: {
      estado: { notIn: ['CANCELADA', 'RECHAZADA'] },
      NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
    },
  };
  if (area) where.cotizacion.proyecto = { area: { tipo: area } };
  if (tipoCompra) where.cotizacion.tipoCompra = tipoCompra;

  const eps = await (prisma.estadoProducto as any).findMany({
    where,
    include: {
      cotizacion: {
        select: {
          tipoCompra: true,
          nombreCotizacion: true,
          proyecto: {
            select: {
              nombre: true,
              area: { select: { tipo: true, nombreArea: true } },
            },
          },
        },
      },
      proyecto: {
        select: {
          nombre: true,
          area: { select: { tipo: true, nombreArea: true } },
        },
      },
    },
  });

  console.log(`   EPs evaluados: ${eps.length}\n`);

  const todasViolaciones: Violacion[] = [];
  const correccionesPorEp = new Map<string, Record<string, Date>>();

  for (const ep of eps) {
    const tc = ep.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const secuencia = tc === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    const proyectoNombre =
      ep.proyecto?.nombre || ep.cotizacion?.proyecto?.nombre || 'Sin proyecto';
    const areaNombre =
      ep.proyecto?.area?.nombreArea ||
      ep.cotizacion?.proyecto?.area?.nombreArea ||
      'Sin área';

    const correccionesEp: Record<string, Date> = {};

    if (campos.includes('limite')) {
      const r = validarTimeline(ep, secuencia, FECHA_LIMITE, 'limite', gap, proyectoNombre, areaNombre);
      todasViolaciones.push(...r.violaciones);
      Object.assign(correccionesEp, r.correcciones);
    }
    if (campos.includes('real')) {
      const r = validarTimeline(ep, secuencia, FECHA_REAL, 'real', gap, proyectoNombre, areaNombre);
      todasViolaciones.push(...r.violaciones);
      Object.assign(correccionesEp, r.correcciones);
    }
    if (campos.includes('hecho')) {
      const r = validarTimeline(ep, secuencia, FECHA_HECHO, 'hecho', gap, proyectoNombre, areaNombre);
      todasViolaciones.push(...r.violaciones);
      // No aplicamos correcciones a "hecho" — son fechas históricas reales,
      // mover eso reescribe el historial. Solo se reporta.
    }

    if (Object.keys(correccionesEp).length > 0) {
      correccionesPorEp.set(ep.id, correccionesEp);
    }
  }

  // ── Reporte ───────────────────────────────────────────────────────────────
  console.log(`📊 Total de violaciones: ${todasViolaciones.length}`);
  console.log(`   EPs con problemas:    ${correccionesPorEp.size}\n`);

  if (todasViolaciones.length === 0) {
    console.log('✅ Todas las secuencias están consistentes.');
    return;
  }

  // Por timeline
  const porTimeline = new Map<string, Violacion[]>();
  for (const v of todasViolaciones) {
    if (!porTimeline.has(v.timeline)) porTimeline.set(v.timeline, []);
    porTimeline.get(v.timeline)!.push(v);
  }
  console.log('Distribución por timeline:');
  for (const [t, list] of porTimeline) {
    console.log(`   ${t.padEnd(8)} ${list.length}`);
  }
  console.log();

  // Por proyecto
  const porProyecto = new Map<string, Violacion[]>();
  for (const v of todasViolaciones) {
    const k = `${v.area} / ${v.proyecto}`;
    if (!porProyecto.has(k)) porProyecto.set(k, []);
    porProyecto.get(k)!.push(v);
  }

  console.log('Top proyectos con violaciones:');
  console.log('─'.repeat(80));
  const topProy = [...porProyecto.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [proy, list] of topProy.slice(0, 15)) {
    console.log(`  ${proy.slice(0, 60).padEnd(62)} ${list.length}`);
  }
  console.log('─'.repeat(80));

  // Detalle por proyecto (primeras 5 violaciones de cada uno)
  console.log('\nDetalle (máx 5 por proyecto):');
  for (const [proy, list] of topProy) {
    console.log(`\n📁 ${proy}  — ${list.length} violación(es)`);
    for (const v of list.slice(0, 5)) {
      console.log(
        `   [${v.timeline}] ${v.descripcion.padEnd(50)} ` +
          `${v.estadoPrev}=${fmt(v.valorPrev)} → ${v.estadoCur}=${fmt(v.valorCur)} ` +
          `(sugerido: ${fmt(v.valorSugerido)})`,
      );
    }
    if (list.length > 5) console.log(`   …y ${list.length - 5} más`);
  }

  if (!apply) {
    console.log(`\n🔍 DRY-RUN: ningún cambio guardado. Re-ejecuta con --apply para corregir.`);
    console.log(`   Se actualizarán ${correccionesPorEp.size} EPs (${[...correccionesPorEp.values()].reduce((s, c) => s + Object.keys(c).length, 0)} campos).`);
    return;
  }

  // ── Aplicar ───────────────────────────────────────────────────────────────
  console.log(`\n💾 Aplicando correcciones a ${correccionesPorEp.size} EPs...`);
  let i = 0;
  for (const [epId, data] of correccionesPorEp.entries()) {
    await (prisma.estadoProducto as any).update({
      where: { id: epId },
      data,
    });
    i++;
    if (i % 10 === 0 || i === correccionesPorEp.size) {
      process.stdout.write(`\r   Progreso: ${i}/${correccionesPorEp.size}`);
    }
  }
  console.log(`\n\n✅ Listo. ${correccionesPorEp.size} EPs corregidos.`);
}

main()
  .catch((e) => { console.error('\n❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

/**
 * Corrige fechas límite vencidas en EstadoProducto para proyectos del área indicada.
 * Mueve hacia el futuro SOLO los campos fechaLimite* que ya pasaron, sumando N días.
 *
 * Uso:
 *   npx ts-node --project tsconfig.json scripts/corregir-fechas.ts [opciones]
 *
 * Opciones:
 *   --dias    N      Días a sumar a cada fecha vencida  (default: 20)
 *   --area    TIPO   Tipo de área a procesar            (default: proyectos)
 *   --dry-run        Solo muestra cambios, no guarda nada
 *
 * Ejemplos:
 *   npx ts-node --project tsconfig.json scripts/corregir-fechas.ts
 *   npx ts-node --project tsconfig.json scripts/corregir-fechas.ts --dias 60
 *   npx ts-node --project tsconfig.json scripts/corregir-fechas.ts --dry-run
 *   npx ts-node --project tsconfig.json scripts/corregir-fechas.ts --area comercial --dias 30
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Configuración ────────────────────────────────────────────────────────────

const ESTADO_A_FECHA_LIMITE: Record<string, string> = {
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

const ESTADOS_INTERNACIONAL = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado',
  'aprobacionPlanos', 'primerSeguimiento', 'enFOB',
  'cotizacionFleteInternacional', 'conBL', 'segundoSeguimiento', 'enCIF',
  'recibido',
];
const ESTADOS_NACIONAL = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado', 'recibido',
];

// ── Parseo de argumentos ─────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let dias = 20;
  let areaTipo = 'proyectos';
  let dryRun = false;
  let incluirAmarillos = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dias' && args[i + 1]) {
      dias = parseInt(args[++i], 10);
      if (isNaN(dias) || dias <= 0) { console.error('--dias debe ser un número positivo'); process.exit(1); }
    } else if (args[i] === '--area' && args[i + 1]) {
      areaTipo = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--incluir-amarillos') {
      incluirAmarillos = true;
    }
  }
  return { dias, areaTipo, dryRun, incluirAmarillos };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function addDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

function fmtFecha(d: Date | null | undefined): string {
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { dias, areaTipo, dryRun, incluirAmarillos } = parseArgs();
  const now = new Date();

  console.log(`\n📅  Corrección de fechas límite`);
  console.log(`    Área:       ${areaTipo}`);
  console.log(`    Buffer:     +${dias} días`);
  console.log(`    Incluir 🟡: ${incluirAmarillos ? 'sí (mover también amarillos a verde)' : 'no (solo vencidos 🔴)'}`);
  console.log(`    Modo:       ${dryRun ? '🔍 DRY-RUN (sin cambios en BD)' : '✏️  ESCRITURA REAL'}`);
  console.log('─'.repeat(70));

  // 1. Traer todos los EstadoProducto del área indicada con fechas
  const eps = await (prisma.estadoProducto as any).findMany({
    where: {
      rechazado: false,
      cotizacion: {
        estado: { notIn: ['CANCELADA', 'RECHAZADA'] },
        NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
        proyecto: {
          area: { tipo: areaTipo },
        },
      },
    },
    include: {
      cotizacion: {
        select: {
          tipoCompra: true,
          nombreCotizacion: true,
          proyecto: { select: { nombre: true } },
        },
      },
      proyecto: { select: { nombre: true } },
    },
  });

  console.log(`\n   Productos cargados: ${eps.length}`);

  // 2. Para cada EP, detectar qué campos fechaLimite* están vencidos
  type Actualizacion = {
    epId: string;
    proyecto: string;
    descripcion: string;
    cambios: Record<string, { anterior: Date; nueva: Date }>;
  };

  const actualizaciones: Actualizacion[] = [];

  for (const ep of eps) {
    const tipoCompra = ep.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estados = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    const proyectoNombre =
      ep.proyecto?.nombre || ep.cotizacion?.proyecto?.nombre || 'Sin proyecto';

    const cambios: Record<string, { anterior: Date; nueva: Date }> = {};

    let primerPendienteEvaluado = false;
    for (const estadoKey of estados) {
      if (ep[estadoKey]) continue; // completado, skip

      const campoFecha = ESTADO_A_FECHA_LIMITE[estadoKey];
      const fechaActual: Date | null = ep[campoFecha] ?? null;

      // ¿amarillo? regla del dashboard: restante/total < 30% — solo aplica
      // al primer estado pendiente, porque dashboard.calcularEstadoProyecto
      // solo evalúa ese.
      let amarilla = false;
      if (
        !primerPendienteEvaluado &&
        incluirAmarillos &&
        fechaActual &&
        now <= fechaActual
      ) {
        const fechaInicioKey = campoFecha.replace('Limite', '');
        const fechaInicio: Date = ep[fechaInicioKey] ?? ep.creado;
        const totalMs = fechaActual.getTime() - new Date(fechaInicio).getTime();
        const restanteMs = fechaActual.getTime() - now.getTime();
        if (totalMs > 0 && restanteMs / totalMs < 0.3) amarilla = true;
      }
      primerPendienteEvaluado = true;

      if (fechaActual && (now > fechaActual || amarilla)) {
        cambios[campoFecha] = {
          anterior: fechaActual,
          nueva: addDias(now, dias),
        };
      }
    }

    if (Object.keys(cambios).length > 0) {
      actualizaciones.push({
        epId: ep.id,
        proyecto: proyectoNombre,
        descripcion: (ep.descripcion || ep.sku || '?').slice(0, 60),
        cambios,
      });
    }
  }

  if (actualizaciones.length === 0) {
    console.log('\n✅ No hay fechas vencidas. Nada que corregir.');
    return;
  }

  // 3. Mostrar resumen por proyecto
  const porProyecto = new Map<string, Actualizacion[]>();
  for (const a of actualizaciones) {
    if (!porProyecto.has(a.proyecto)) porProyecto.set(a.proyecto, []);
    porProyecto.get(a.proyecto)!.push(a);
  }

  console.log(`\n   Productos a corregir: ${actualizaciones.length}`);
  console.log(`   Proyectos afectados:  ${porProyecto.size}\n`);

  for (const [proyecto, items] of porProyecto.entries()) {
    const totalCambios = items.reduce((s, i) => s + Object.keys(i.cambios).length, 0);
    console.log(`  PROYECTO: ${proyecto}  (${items.length} productos, ${totalCambios} campos)`);
    for (const item of items) {
      for (const [campo, { anterior, nueva }] of Object.entries(item.cambios)) {
        console.log(
          `    ${item.descripcion.padEnd(55)}  ${campo.padEnd(38)}  ${fmtFecha(anterior)} → ${fmtFecha(nueva)}`,
        );
      }
    }
    console.log();
  }

  if (dryRun) {
    console.log('🔍 DRY-RUN: ningún cambio guardado. Quitá --dry-run para aplicar.');
    return;
  }

  // 4. Aplicar cambios en BD
  console.log('─'.repeat(70));
  console.log('💾 Guardando cambios...\n');

  let actualizados = 0;
  for (const a of actualizaciones) {
    const data: Record<string, Date> = {};
    for (const [campo, { nueva }] of Object.entries(a.cambios)) {
      data[campo] = nueva;
    }
    await (prisma.estadoProducto as any).update({
      where: { id: a.epId },
      data,
    });
    actualizados++;
    process.stdout.write(`\r   Progreso: ${actualizados}/${actualizaciones.length}`);
  }

  console.log(`\n\n✅ Listo. ${actualizados} productos actualizados con +${dias} días en sus fechas vencidas.`);
  console.log(`   Nueva fecha aplicada: ${fmtFecha(addDias(now, dias))}\n`);
}

main()
  .catch(e => { console.error('\n❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

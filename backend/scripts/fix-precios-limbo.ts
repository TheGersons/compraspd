/**
 * ============================================================
 * MIGRACIÓN: Reparar precios en estado limbo
 * ============================================================
 * Encuentra todos los registros de `precios` que:
 *   - Están seleccionados (su id aparece en cotizacionDetalle.preciosId)
 *   - No tienen ComprobanteDescuento establecido
 *
 * Para cada uno:
 *   1. Aplica ComprobanteDescuento = 'NO_APLICA'
 *   2. Crea el EstadoProducto correspondiente si no existe
 *
 * Ejecutar con:
 *   npx ts-node scripts/fix-precios-limbo.ts
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando precios en estado limbo...');

  // Buscar precios seleccionados sin ComprobanteDescuento
  const preciosEnLimbo = await prisma.precios.findMany({
    where: {
      ComprobanteDescuento: null,
      cotizacionDetalle: {
        preciosId: { not: null },
      },
    },
    include: {
      cotizacionDetalle: {
        include: {
          cotizacion: {
            select: { id: true, proyectoId: true },
          },
        },
      },
      proveedor: { select: { id: true, nombre: true } },
    },
  });

  // Filtrar solo los que realmente están seleccionados (preciosId = this precio's id)
  const preciosRealesLimbo = preciosEnLimbo.filter(
    (p) => p.cotizacionDetalle.preciosId === p.id,
  );

  console.log(`📋 Encontrados ${preciosRealesLimbo.length} precios en limbo`);

  if (preciosRealesLimbo.length === 0) {
    console.log('✅ No hay precios en limbo. Nada que reparar.');
    return;
  }

  let reparados = 0;
  let estadosCreados = 0;
  let errores = 0;

  for (const precio of preciosRealesLimbo) {
    try {
      const detalle = precio.cotizacionDetalle;
      const cotizacion = detalle.cotizacion;

      console.log(`\n🔧 Reparando precio ${precio.id} (detalle: ${detalle.id})`);

      // 1. Aplicar NO_APLICA si no tiene comprobante
      await prisma.precios.update({
        where: { id: precio.id },
        data: { ComprobanteDescuento: 'NO_APLICA' },
      });
      console.log(`  ✅ ComprobanteDescuento = NO_APLICA`);

      // 2. Crear EstadoProducto si no existe
      const estadoExistente = await prisma.estadoProducto.findFirst({
        where: { cotizacionDetalleId: detalle.id },
      });

      if (!estadoExistente) {
        const precioUnitario = Number(precio.precio);
        const precioTotal = precioUnitario * detalle.cantidad;

        await prisma.estadoProducto.create({
          data: {
            cotizacionId: cotizacion.id,
            cotizacionDetalleId: detalle.id,
            proyectoId: cotizacion.proyectoId,
            sku: detalle.sku || `SKU-${detalle.id.substring(0, 8)}`,
            descripcion: detalle.descripcionProducto,

            cotizado: true,
            conDescuento: false,
            comprado: false,
            pagado: false,
            primerSeguimiento: false,
            enFOB: false,
            conBL: false,
            segundoSeguimiento: false,
            enCIF: false,
            recibido: false,

            fechaCotizado: new Date(),
            fechaConDescuento: null,

            proveedor: precio.proveedor?.nombre ?? '',
            cantidad: detalle.cantidad,
            precioUnitario,
            precioTotal,

            criticidad: 5,
            nivelCriticidad: 'MEDIO',
            diasRetrasoActual: 0,
            estadoGeneral: 'warn',

            aprobadoPorSupervisor: false,
          },
        });
        console.log(`  ✅ EstadoProducto creado`);
        estadosCreados++;
      } else {
        console.log(`  ℹ️  EstadoProducto ya existe (${estadoExistente.id}), omitiendo creación`);
      }

      reparados++;
    } catch (error) {
      console.error(`  ❌ Error reparando precio ${precio.id}:`, error);
      errores++;
    }
  }

  console.log('\n============================================================');
  console.log(`✅ Reparación completada:`);
  console.log(`   - Precios encontrados en limbo: ${preciosRealesLimbo.length}`);
  console.log(`   - Precios reparados: ${reparados}`);
  console.log(`   - EstadoProducto creados: ${estadosCreados}`);
  console.log(`   - Errores: ${errores}`);
  console.log('============================================================');
}

main()
  .catch((e) => { console.error('❌ Error fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

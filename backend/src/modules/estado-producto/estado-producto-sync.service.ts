import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Servicio de sincronización bidireccional entre Quotations y EstadoProducto
 * Mantiene integridad y no sobrescribe datos de productos avanzados
 */
@Injectable()
export class EstadoProductoSyncService {
  private readonly logger = new Logger(EstadoProductoSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sincroniza cuando se selecciona un precio
   * Crea EstadoProducto si no existe o actualiza solo campos permitidos
   */
  async sincronizarPrecioSeleccionado(
    precioId: string,
    cotizacionDetalleId: string
  ) {
    try {
      // Obtener precio con todas sus relaciones
      const precio = await this.prisma.precios.findUnique({
        where: { id: precioId },
        include: {
          proveedor: true,
          cotizacionDetalle: {
            include: {
              cotizacion: true,
            },
          },
        },
      });

      if (!precio) {
        throw new Error('Precio no encontrado');
      }

      const detalle = precio.cotizacionDetalle;
      const cotizacion = detalle.cotizacion;

      // Buscar EstadoProducto existente
      const estadoExistente = await this.prisma.estadoProducto.findFirst({
        where: { cotizacionDetalleId: detalle.id },
      });

      const tieneCotizacion = true;
      const tieneDescuento = !!precio.precioDescuento;
      
      const precioFinal = tieneDescuento 
        ? precio.precioDescuento 
        : precio.precio;

      const precioUnitario = Number(precioFinal);
      const precioTotal = precioUnitario * detalle.cantidad;

      if (!estadoExistente) {
        // CREAR NUEVO: No existe, entonces es seguro crear
        const nuevoEstado = await this.prisma.estadoProducto.create({
          data: {
            cotizacionId: cotizacion.id,
            cotizacionDetalleId: detalle.id,
            proyectoId: cotizacion.proyectoId,
            sku: detalle.sku || `SKU-${detalle.id.substring(0, 8)}`,
            descripcion: detalle.descripcionProducto,
            
            // Estados iniciales
            cotizado: tieneCotizacion,
            conDescuento: tieneDescuento,
            comprado: false,
            pagado: false,
            primerSeguimiento: false,
            enFOB: false,
            conBL: false,
            segundoSeguimiento: false,
            enCIF: false,
            recibido: false,
            
            // Fechas
            fechaCotizado: new Date(),
            fechaConDescuento: tieneDescuento ? new Date() : null,
            
            // Info del producto
            proveedor: precio.proveedor.nombre,
            cantidad: detalle.cantidad,
            precioUnitario,
            precioTotal,
            
            // Criticidad inicial
            criticidad: 5,
            nivelCriticidad: 'MEDIO',
            diasRetrasoActual: 0,
            estadoGeneral: 'warn',
            
            // Sin aprobar aún
            aprobadoPorSupervisor: false,
          },
        });

        this.logger.log(
          `EstadoProducto creado para detalle ${detalle.id}: ${nuevoEstado.sku}`
        );
        return nuevoEstado;
      } else {
        // ACTUALIZAR EXISTENTE: Validar que no esté muy avanzado
        return this.actualizarEstadoExistente(estadoExistente, precio);
      }
    } catch (error) {
      this.logger.error('Error al sincronizar precio seleccionado:', error);
      throw error;
    }
  }

  /**
   * Sincroniza cuando se aplica/modifica un descuento
   * Solo actualiza si el producto no ha pasado de "conDescuento"
   */
  async sincronizarDescuentoAplicado(precioId: string) {
    try {
      const precio = await this.prisma.precios.findUnique({
        where: { id: precioId },
        include: {
          proveedor: true,
          cotizacionDetalle: true,
        },
      });

      if (!precio || !precio.precioDescuento) {
        return;
      }

      const estadoProducto = await this.prisma.estadoProducto.findFirst({
        where: { cotizacionDetalleId: precio.cotizacionDetalleId },
      });

      if (!estadoProducto) {
        // Si no existe, no hacer nada (se creará cuando se seleccione el precio)
        return;
      }

      // VALIDACIÓN CRÍTICA: Solo actualizar si no ha avanzado más allá de "conDescuento"
      const haAvanzadoMas = 
        estadoProducto.comprado ||
        estadoProducto.pagado ||
        estadoProducto.primerSeguimiento ||
        estadoProducto.enFOB ||
        estadoProducto.conBL ||
        estadoProducto.segundoSeguimiento ||
        estadoProducto.enCIF ||
        estadoProducto.recibido;

      if (haAvanzadoMas) {
        this.logger.warn(
          `EstadoProducto ${estadoProducto.id} ya ha avanzado. No se actualiza el descuento.`
        );
        return estadoProducto;
      }

      // SEGURO ACTUALIZAR: Solo precios y estado de descuento
      const precioUnitario = Number(precio.precioDescuento);
      const precioTotal = precioUnitario * estadoProducto.cantidad!;

      const actualizado = await this.prisma.estadoProducto.update({
        where: { id: estadoProducto.id },
        data: {
          conDescuento: true,
          fechaConDescuento: new Date(),
          precioUnitario,
          precioTotal,
          proveedor: precio.proveedor.nombre, // Actualizar proveedor por si cambió
        },
      });

      this.logger.log(
        `EstadoProducto ${estadoProducto.id} actualizado con descuento`
      );
      return actualizado;
    } catch (error) {
      this.logger.error('Error al sincronizar descuento:', error);
      throw error;
    }
  }

  /**
   * Actualiza EstadoProducto existente con validaciones
   * NO sobrescribe estados avanzados
   */
  private async actualizarEstadoExistente(estadoExistente: any, precio: any) {
    // VALIDACIÓN: Determinar hasta qué punto es seguro actualizar
    const haAvanzadoMasAllaDeCotizado = 
      estadoExistente.comprado ||
      estadoExistente.pagado ||
      estadoExistente.primerSeguimiento ||
      estadoExistente.enFOB ||
      estadoExistente.conBL ||
      estadoExistente.segundoSeguimiento ||
      estadoExistente.enCIF ||
      estadoExistente.recibido;

    if (haAvanzadoMasAllaDeCotizado) {
      // Producto avanzado: SOLO actualizar proveedor y precios, NO tocar estados ni fechas
      const precioFinal = precio.precioDescuento || precio.precio;
      const precioUnitario = Number(precioFinal);
      const precioTotal = precioUnitario * estadoExistente.cantidad!;

      const actualizado = await this.prisma.estadoProducto.update({
        where: { id: estadoExistente.id },
        data: {
          proveedor: precio.proveedor.nombre,
          precioUnitario,
          precioTotal,
          // NO tocar: estados booleanos, fechas, criticidad, etc.
        },
      });

      this.logger.log(
        `EstadoProducto ${estadoExistente.id} actualizado (solo precios, producto avanzado)`
      );
      return actualizado;
    }

    // Producto en etapas iniciales: Actualizar precios y estados de cotización/descuento
    const tieneDescuento = !!precio.precioDescuento;
    const precioFinal = tieneDescuento ? precio.precioDescuento : precio.precio;
    const precioUnitario = Number(precioFinal);
    const precioTotal = precioUnitario * estadoExistente.cantidad!;

    const actualizado = await this.prisma.estadoProducto.update({
      where: { id: estadoExistente.id },
      data: {
        cotizado: true,
        conDescuento: tieneDescuento,
        fechaCotizado: new Date(),
        fechaConDescuento: tieneDescuento ? new Date() : estadoExistente.fechaConDescuento,
        proveedor: precio.proveedor.nombre,
        precioUnitario,
        precioTotal,
      },
    });

    this.logger.log(
      `EstadoProducto ${estadoExistente.id} actualizado (etapas iniciales)`
    );
    return actualizado;
  }

  /**
   * Sincroniza cuando se aprueba un producto
   * Marca como aprobado por supervisor
   */
  async sincronizarAprobacionProducto(
    cotizacionDetalleId: string,
    aprobado: boolean,
    fechaAprobacion?: Date
  ) {
    const estadoProducto = await this.prisma.estadoProducto.findFirst({
      where: { cotizacionDetalleId },
    });

    if (!estadoProducto) {
      this.logger.warn(
        `No se encontró EstadoProducto para detalle ${cotizacionDetalleId}`
      );
      return;
    }

    return this.prisma.estadoProducto.update({
      where: { id: estadoProducto.id },
      data: {
        aprobadoPorSupervisor: aprobado,
        fechaAprobacion: aprobado ? fechaAprobacion || new Date() : null,
      },
    });
  }

  /**
   * Sincronización masiva para cotizaciones aprobadas antiguas
   * (Para migración inicial)
   */
  async sincronizarCotizacionesAprobadas() {
    this.logger.log('Iniciando sincronización masiva de cotizaciones aprobadas...');

    const cotizacionesAprobadas = await this.prisma.cotizacion.findMany({
      where: { estado: 'APROBADA' },
      include: {
        detalles: {
          include: {
            precios: {
              include: {
                proveedor: true,
              },
            },
            estadosProductos: true,
          },
        },
      },
    });

    let creados = 0;
    let omitidos = 0;
    let errores = 0;

    for (const cotizacion of cotizacionesAprobadas) {
      for (const detalle of cotizacion.detalles) {
        // Verificar si ya existe
        if (detalle.estadosProductos.length > 0) {
          omitidos++;
          continue;
        }

        // Obtener precio seleccionado (es un objeto único, no un array)
        const precioSeleccionado = detalle.precios;

        if (!precioSeleccionado) {
          this.logger.warn(
            `Detalle ${detalle.id} no tiene precio seleccionado, omitiendo...`
          );
          omitidos++;
          continue;
        }

        try {
          // Usar la función de sincronización que ya tiene validaciones
          await this.sincronizarPrecioSeleccionado(
            precioSeleccionado.id,
            detalle.id
          );
          
          // Marcar como aprobado ya que viene de cotización aprobada
          await this.sincronizarAprobacionProducto(
            detalle.id,
            true,
            cotizacion.fechaAprobacion || undefined
          );
          
          creados++;
        } catch (error) {
          this.logger.error(
            `Error al sincronizar detalle ${detalle.id}:`,
            error
          );
          errores++;
        }
      }
    }

    const resultado = {
      total: cotizacionesAprobadas.reduce((acc, c) => acc + c.detalles.length, 0),
      creados,
      omitidos,
      errores,
    };

    this.logger.log('Sincronización masiva completada:', resultado);
    return resultado;
  }
}
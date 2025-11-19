import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';




@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar proveedores con filtros
   */
  async listProveedores(params?: { activo?: boolean; search?: string }) {
    const where: any = {};

    if (typeof params?.activo === 'boolean') {
      where.activo = params.activo;
    }

    if (params?.search) {
      where.OR = [
        { nombre: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { rtn: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.proveedor.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        rtn: true,
        email: true,
        telefono: true,
        direccion: true,
        activo: true,
        creado: true,
        _count: {
          select: {
            precios: true, // Ofertas enviadas
            compraDetalles: true // Compras realizadas
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Obtener proveedor por ID
   */
  async findById(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            precios: true,
            compraDetalles: true
          }
        }
      }
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return proveedor;
  }

  /**
   * Crear nuevo proveedor
   */
  async create(data: CreateProveedorDto) {
    // Validar que el RTN no exista (si se proporciona)
    if (data.rtn) {
      const exists = await this.prisma.proveedor.findFirst({
        where: { rtn: data.rtn }
      });

      if (exists) {
        throw new ConflictException('Ya existe un proveedor con ese RTN');
      }
    }

    // Validar que el email no exista (si se proporciona)
    if (data.email) {
      const exists = await this.prisma.proveedor.findFirst({
        where: { email: data.email }
      });

      if (exists) {
        throw new ConflictException('Ya existe un proveedor con ese email');
      }
    }

    return this.prisma.proveedor.create({
      data: {
        nombre: data.nombre,
        rtn: data.rtn,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        rtn: true,
        email: true,
        telefono: true,
        direccion: true,
        activo: true,
        creado: true
      }
    });
  }

  /**
   * Actualizar proveedor
   */
  async update(id: string, data: UpdateProveedorDto) {
    await this.ensureExists(id);

    // Validar RTN único si se actualiza
    if (data.rtn) {
      const exists = await this.prisma.proveedor.findFirst({
        where: {
          rtn: data.rtn,
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe un proveedor con ese RTN');
      }
    }

    // Validar email único si se actualiza
    if (data.email) {
      const exists = await this.prisma.proveedor.findFirst({
        where: {
          email: data.email,
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe un proveedor con ese email');
      }
    }

    return this.prisma.proveedor.update({
      where: { id },
      data: {
        nombre: data.nombre,
        rtn: data.rtn,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        activo: data.activo
      },
      select: {
        id: true,
        nombre: true,
        rtn: true,
        email: true,
        telefono: true,
        direccion: true,
        activo: true
      }
    });
  }

  /**
   * Desactivar proveedor
   */
  async deactivate(id: string) {
    await this.ensureExists(id);

    return this.prisma.proveedor.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Activar proveedor
   */
  async activate(id: string) {
    await this.ensureExists(id);

    return this.prisma.proveedor.update({
      where: { id },
      data: { activo: true }
    });
  }

  /**
   * Obtener estadísticas del proveedor
   */
  async getStats(id: string) {
    await this.ensureExists(id);

    const [totalOfertas, totalCompras] = await Promise.all([
      this.prisma.precios.count({
        where: { proveedorId: id }
      }),
      this.prisma.compraDetalle.count({
        where: { proveedorId: id }
      })
    ]);

    return {
      totalOfertas,
      totalCompras
    };
  }

  /**
   * Método privado: Verificar que el proveedor existe
   */
  private async ensureExists(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }
  }
}
import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todos los permisos
   */
  async listPermissions(params?: { 
    modulo?: string; 
    activo?: boolean;
    groupByModulo?: boolean;
  }) {
    const where: any = {};

    if (params?.modulo) {
      where.modulo = params.modulo;
    }

    if (typeof params?.activo === 'boolean') {
      where.activo = params.activo;
    }

    const permisos = await this.prisma.permisos.findMany({
      where,
      select: {
        id: true,
        modulo: true,
        accion: true,
        descripcion: true,
        activo: true,
        creado: true
      },
      orderBy: [
        { modulo: 'asc' },
        { accion: 'asc' }
      ]
    });

    // Si se solicita agrupación por módulo
    if (params?.groupByModulo) {
      return this.groupByModule(permisos);
    }

    return permisos;
  }

  /**
   * Obtener permiso por ID
   */
  async findById(id: string) {
    const permiso = await this.prisma.permisos.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rolPermisos: true }
        }
      }
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return {
      id: permiso.id,
      modulo: permiso.modulo,
      accion: permiso.accion,
      descripcion: permiso.descripcion,
      activo: permiso.activo,
      creado: permiso.creado,
      cantidadRoles: permiso._count.rolPermisos
    };
  }

  /**
   * Crear nuevo permiso
   */
  async create(data: CreatePermissionDto) {
    // Validar que no exista la combinación módulo + acción
    const exists = await this.prisma.permisos.findFirst({
      where: {
        modulo: data.modulo.toLowerCase(),
        accion: data.accion.toLowerCase()
      }
    });

    if (exists) {
      throw new ConflictException(
        `Ya existe el permiso ${data.modulo}:${data.accion}`
      );
    }

    return this.prisma.permisos.create({
      data: {
        modulo: data.modulo.toLowerCase(),
        accion: data.accion.toLowerCase(),
        descripcion: data.descripcion,
        activo: true
      },
      select: {
        id: true,
        modulo: true,
        accion: true,
        descripcion: true,
        activo: true,
        creado: true
      }
    });
  }

  /**
   * Actualizar permiso
   */
  async update(id: string, data: UpdatePermissionDto) {
    await this.ensureExists(id);

    // Si se cambia módulo o acción, validar que no exista
    if (data.modulo || data.accion) {
      const current = await this.prisma.permisos.findUnique({
        where: { id }
      });

      const newModulo = data.modulo?.toLowerCase() || current!.modulo;
      const newAccion = data.accion?.toLowerCase() || current!.accion;

      const exists = await this.prisma.permisos.findFirst({
        where: {
          modulo: newModulo,
          accion: newAccion,
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException(
          `Ya existe el permiso ${newModulo}:${newAccion}`
        );
      }
    }

    return this.prisma.permisos.update({
      where: { id },
      data: {
        modulo: data.modulo?.toLowerCase(),
        accion: data.accion?.toLowerCase(),
        descripcion: data.descripcion,
        activo: data.activo
      },
      select: {
        id: true,
        modulo: true,
        accion: true,
        descripcion: true,
        activo: true
      }
    });
  }

  /**
   * Desactivar permiso
   */
  async deactivate(id: string) {
    await this.ensureExists(id);

    return this.prisma.permisos.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Activar permiso
   */
  async activate(id: string) {
    await this.ensureExists(id);

    return this.prisma.permisos.update({
      where: { id },
      data: { activo: true }
    });
  }

  /**
   * Listar módulos únicos
   */
  async listModules() {
    const permisos = await this.prisma.permisos.findMany({
      where: { activo: true },
      select: { modulo: true },
      distinct: ['modulo'],
      orderBy: { modulo: 'asc' }
    });

    return permisos.map(p => p.modulo);
  }

  /**
   * Agrupar permisos por módulo
   */
  private groupByModule(permisos: any[]) {
    const grouped: Record<string, any[]> = {};

    permisos.forEach(permiso => {
      if (!grouped[permiso.modulo]) {
        grouped[permiso.modulo] = [];
      }
      grouped[permiso.modulo].push(permiso);
    });

    return Object.entries(grouped).map(([modulo, permisos]) => ({
      modulo,
      permisos
    }));
  }

  /**
   * Método privado: Verificar que el permiso existe
   */
  private async ensureExists(id: string) {
    const permiso = await this.prisma.permisos.findUnique({ where: { id } });
    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }
  }
}
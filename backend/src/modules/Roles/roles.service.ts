import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';



@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todos los roles activos
   */
  async listRoles(includeInactive = false) {
    const where = includeInactive ? {} : { activo: true };

    return this.prisma.rol.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        creado: true,
        actualizado: true,
        _count: {
          select: {
            usuarios: true, // Contar cuántos usuarios tienen este rol
            rolPermisos: true // Contar cuántos permisos tiene
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Obtener un rol por ID con sus permisos
   */
  async findById(id: string) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: {
        rolPermisos: {
          include: {
            permiso: {
              select: {
                id: true,
                modulo: true,
                accion: true,
                descripcion: true
              }
            }
          }
        },
        _count: {
          select: { usuarios: true }
        }
      }
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Formatear permisos para mejor legibilidad
    const permisos = rol.rolPermisos.map(rp => rp.permiso);

    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      activo: rol.activo,
      creado: rol.creado,
      actualizado: rol.actualizado,
      cantidadUsuarios: rol._count.usuarios,
      permisos
    };
  }

  /**
   * Crear nuevo rol
   */
  async create(data: CreateRolDto) {
    // Validar que el nombre no exista
    const exists = await this.prisma.rol.findFirst({
      where: { nombre: data.nombre.toUpperCase() }
    });

    if (exists) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }

    return this.prisma.rol.create({
      data: {
        nombre: data.nombre.toUpperCase(),
        descripcion: data.descripcion,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        creado: true
      }
    });
  }

  /**
   * Actualizar rol
   */
  async update(id: string, data: UpdateRolDto) {
    await this.ensureExists(id);

    // Si se cambia el nombre, validar que no exista
    if (data.nombre) {
      const exists = await this.prisma.rol.findFirst({
        where: { 
          nombre: data.nombre.toUpperCase(),
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe un rol con ese nombre');
      }
    }

    return this.prisma.rol.update({
      where: { id },
      data: {
        nombre: data.nombre?.toUpperCase(),
        descripcion: data.descripcion,
        activo: data.activo
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        actualizado: true
      }
    });
  }

  /**
   * Eliminar rol (borrado lógico)
   */
  async deactivate(id: string) {
    await this.ensureExists(id);

    // Verificar que no tenga usuarios asignados
    const usuariosCount = await this.prisma.usuario.count({
      where: { rolId: id, activo: true }
    });

    if (usuariosCount > 0) {
      throw new BadRequestException(
        `No se puede desactivar el rol. Tiene ${usuariosCount} usuario(s) activo(s) asignado(s)`
      );
    }

    return this.prisma.rol.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Activar rol
   */
  async activate(id: string) {
    await this.ensureExists(id);

    return this.prisma.rol.update({
      where: { id },
      data: { activo: true }
    });
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(id: string, data: AssignPermissionsDto) {
    await this.ensureExists(id);

    // Validar que todos los permisos existan
    const permisos = await this.prisma.permisos.findMany({
      where: { id: { in: data.permisoIds } }
    });

    if (permisos.length !== data.permisoIds.length) {
      throw new BadRequestException('Uno o más permisos no existen');
    }

    // Usar transacción para eliminar permisos actuales y agregar nuevos
    await this.prisma.$transaction(async (tx) => {
      // Eliminar permisos actuales
      await tx.rolPermisos.deleteMany({
        where: { rolId: id }
      });

      // Crear nuevos permisos
      await tx.rolPermisos.createMany({
        data: data.permisoIds.map(permisoId => ({
          rolId: id,
          permisoId
        }))
      });
    });

    return this.findById(id);
  }

  /**
   * Obtener permisos de un rol
   */
  async getPermissions(id: string) {
    await this.ensureExists(id);

    const rolPermisos = await this.prisma.rolPermisos.findMany({
      where: { rolId: id },
      include: {
        permiso: {
          select: {
            id: true,
            modulo: true,
            accion: true,
            descripcion: true,
            activo: true
          }
        }
      }
    });

    return rolPermisos.map(rp => rp.permiso);
  }

  /**
   * Método privado: Verificar que el rol existe
   */
  private async ensureExists(id: string) {
    const rol = await this.prisma.rol.findUnique({ where: { id } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
  }
}
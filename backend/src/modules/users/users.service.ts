import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear nuevo usuario
   */
  async create(data: CreateUserDto) {
    // Validar que el email no exista
    const exists = await this.prisma.usuario.findUnique({ 
      where: { email: data.email } 
    });
    if (exists) {
      throw new BadRequestException('Email ya registrado');
    }

    // Validar que el rol exista
    const rolExists = await this.prisma.rol.findUnique({
      where: { id: data.rolId }
    });
    if (!rolExists) {
      throw new BadRequestException('Rol no encontrado');
    }

    // Validar que el departamento exista
    const deptExists = await this.prisma.departamento.findUnique({
      where: { id: data.departamentoId }
    });
    if (!deptExists) {
      throw new BadRequestException('Departamento no encontrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        email: data.email,
        passwordHash,
        nombre: data.nombre,
        departamentoId: data.departamentoId,
        rolId: data.rolId,
        activo: true,
      },
      include: { 
        rol: {
          select: { id: true, nombre: true, descripcion: true }
        }, 
        departamento: {
          select: { id: true, nombre: true }
        } 
      },
    });

    // No devolver el passwordHash en la respuesta
    const { passwordHash: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        departamentoId: true,
        departamento: { 
          select: { id: true, nombre: true } 
        },
        activo: true,
        creado: true,
        actualizado: true,
        rol: { 
          select: { id: true, nombre: true, descripcion: true } 
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  /**
   * Listar todos los usuarios con filtros y paginación
   */
  async paginate(params: { 
    page?: number; 
    pageSize?: number; 
    search?: string; 
    rolId?: string; 
    activo?: boolean;
    departamentoId?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

    const where: any = {};
    const and: any[] = [];

    // Búsqueda por texto
    if (params.search) {
      and.push({
        OR: [
          { email: { contains: params.search, mode: 'insensitive' as const } },
          { nombre: { contains: params.search, mode: 'insensitive' as const } },
        ],
      });
    }

    // Filtro por rol
    if (params.rolId) {
      and.push({ rolId: params.rolId });
    }

    // Filtro por departamento
    if (params.departamentoId) {
      and.push({ departamentoId: params.departamentoId });
    }

    // Filtro por estado activo
    if (typeof params.activo === 'boolean') {
      and.push({ activo: params.activo });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    // Consulta con transacción para obtener total e items
    const [total, items] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        select: {
          id: true,
          email: true,
          nombre: true,
          departamentoId: true,
          activo: true,
          creado: true,
          actualizado: true,
          rol: {
            select: { id: true, nombre: true, descripcion: true }
          },
          departamento: {
            select: { id: true, nombre: true }
          }
        },
        orderBy: { creado: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { 
      page, 
      pageSize, 
      total, 
      totalPages: Math.ceil(total / pageSize),
      items 
    };
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, data: UpdateUserDto) {
    await this.ensureExists(id);

    // Validar rol si se proporciona
    if (data.rolId) {
      const rolExists = await this.prisma.rol.findUnique({
        where: { id: data.rolId }
      });
      if (!rolExists) {
        throw new BadRequestException('Rol no encontrado');
      }
    }

    // Validar departamento si se proporciona
    if (data.departamentoId) {
      const deptExists = await this.prisma.departamento.findUnique({
        where: { id: data.departamentoId }
      });
      if (!deptExists) {
        throw new BadRequestException('Departamento no encontrado');
      }
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: data.nombre,
        departamentoId: data.departamentoId,
        rolId: data.rolId,
        activo: typeof data.activo === 'boolean' ? data.activo : undefined,
      },
      include: { 
        rol: {
          select: { id: true, nombre: true, descripcion: true }
        }, 
        departamento: {
          select: { id: true, nombre: true }
        } 
      },
    });

    const { passwordHash: _, ...usuarioSinPassword } = updated;
    return usuarioSinPassword;
  }

  /**
   * Cambiar contraseña de usuario
   */
  async changePassword(id: string, newPassword: string, oldPassword: string) {
    const usuario = await this.prisma.usuario.findUnique({ 
      where: { id } 
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(oldPassword, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual no coincide');
    }

    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.usuario.update({ 
      where: { id }, 
      data: { passwordHash } 
    });

    return { ok: true, message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Desactivar usuario (borrado lógico)
   */
  async deactivate(id: string) {
    await this.ensureExists(id);
    return this.prisma.usuario.update({ 
      where: { id }, 
      data: { activo: false } 
    });
  }

  /**
   * Activar usuario
   */
  async activate(id: string) {
    await this.ensureExists(id);
    return this.prisma.usuario.update({ 
      where: { id }, 
      data: { activo: true } 
    });
  }

  /**
   * Listar supervisores activos
   */
  async supervisorsList() {
    const supervisorRole = await this.prisma.rol.findFirst({
      where: { nombre: 'SUPERVISOR' },
      select: { id: true },
    });

    if (!supervisorRole) {
      throw new NotFoundException('Rol de SUPERVISOR no encontrado en el sistema');
    }

    const supervisores = await this.prisma.usuario.findMany({
      where: { 
        activo: true, 
        rolId: supervisorRole.id 
      },
      select: { 
        id: true, 
        nombre: true, 
        email: true 
      },
      orderBy: { nombre: 'asc' },
    });

    if (supervisores.length === 0) {
      throw new NotFoundException('No se encontraron supervisores activos');
    }

    return supervisores;
  }

  /**
   * Listar todos los usuarios
   */
  async listUsers() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        activo: true,
        departamentoId: true,
        creado: true,
        rol: {
          select: { id: true, nombre: true, descripcion: true }
        },
        departamento: {
          select: { id: true, nombre: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Método privado: Verificar que el usuario existe
   */
  private async ensureExists(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ 
      where: { id } 
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
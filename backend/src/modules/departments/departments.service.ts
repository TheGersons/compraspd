import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todos los departamentos
   */
  async listDepartments() {
    return this.prisma.departamento.findMany({
      select: {
        id: true,
        nombre: true,
        creado: true,
        _count: {
          select: {
            usuarios: true // Contar usuarios del departamento
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Obtener departamento por ID
   */
  async findById(id: string) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
            activo: true
          },
          orderBy: { nombre: 'asc' }
        }
      }
    });

    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }

    return departamento;
  }

  /**
   * Crear nuevo departamento
   */
  async create(data: CreateDepartmentDto) {
    // Validar que el nombre no exista
    const exists = await this.prisma.departamento.findFirst({
      where: { 
        nombre: {
          equals: data.nombre,
          mode: 'insensitive' // Case-insensitive
        }
      }
    });

    if (exists) {
      throw new ConflictException('Ya existe un departamento con ese nombre');
    }

    return this.prisma.departamento.create({
      data: {
        nombre: data.nombre
      },
      select: {
        id: true,
        nombre: true,
        creado: true
      }
    });
  }

  /**
   * Actualizar departamento
   */
  async update(id: string, data: UpdateDepartmentDto) {
    await this.ensureExists(id);

    // Validar que el nuevo nombre no exista
    if (data.nombre) {
      const exists = await this.prisma.departamento.findFirst({
        where: {
          nombre: {
            equals: data.nombre,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe un departamento con ese nombre');
      }
    }

    return this.prisma.departamento.update({
      where: { id },
      data: {
        nombre: data.nombre
      },
      select: {
        id: true,
        nombre: true,
        creado: true
      }
    });
  }

  /**
   * Eliminar departamento
   */
  async remove(id: string) {
    await this.ensureExists(id);

    // Verificar que no tenga usuarios asignados
    const usuariosCount = await this.prisma.usuario.count({
      where: { departamentoId: id }
    });

    if (usuariosCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el departamento. Tiene ${usuariosCount} usuario(s) asignado(s)`
      );
    }

    await this.prisma.departamento.delete({
      where: { id }
    });

    return { ok: true, message: 'Departamento eliminado exitosamente' };
  }

  /**
   * Obtener estadísticas del departamento
   */
  async getStats(id: string) {
    await this.ensureExists(id);

    const [totalUsuarios, usuariosActivos, usuariosInactivos] = await Promise.all([
      this.prisma.usuario.count({
        where: { departamentoId: id }
      }),
      this.prisma.usuario.count({
        where: { departamentoId: id, activo: true }
      }),
      this.prisma.usuario.count({
        where: { departamentoId: id, activo: false }
      })
    ]);

    return {
      totalUsuarios,
      usuariosActivos,
      usuariosInactivos
    };
  }

  /**
   * Método privado: Verificar que el departamento existe
   */
  private async ensureExists(id: string) {
    const departamento = await this.prisma.departamento.findUnique({ 
      where: { id } 
    });
    if (!departamento) {
      throw new NotFoundException('Departamento no encontrado');
    }
  }
}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: {
    email: string; password: string; fullName: string;
    departmentId: string; costCenter?: string; roleId: string;
  }) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new BadRequestException('Email ya registrado');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        departmentId: data.departmentId,
        costCenter: data.costCenter,
        roleId: data.roleId,
      },
      include: { role: true, department: true },
    });
    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        costCenter: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true, description: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }



  async paginate(params: { page?: number; pageSize?: number; search?: string; roleId?: string; isActive?: boolean }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

    const where: any = {};
    const and: any[] = [];

    if (params.search) {
      and.push({
        OR: [
          { email: { contains: params.search, mode: 'insensitive' as const } },
          { fullName: { contains: params.search, mode: 'insensitive' as const } },
        ],
      });
    }
    if (params.roleId) {
      and.push({ roleId: params.roleId });
    }
    if (typeof params.isActive === 'boolean') {
      and.push({ isActive: params.isActive });
    }
    if (and.length > 0) {
      where.AND = and;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { page, pageSize, total, items };
  }

  async update(id: string, data: {
    fullName?: string; departmentId?: string; costCenter?: string; roleId?: string; isActive?: boolean
  }) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        departmentId: data.departmentId ?? undefined,
        costCenter: data.costCenter,
        roleId: data.roleId,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : undefined,
      },
      include: { role: true, department: true },
    });
  }
  async changePassword(id: string, newPassword: string, oldPassword: string) {
    await this.ensureExists(id);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const compare = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!compare) throw new BadRequestException('La contraseña actual no coincide');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { ok: true };
  }

  async remove(id: string) {
    await this.ensureExists(id);
    // borrado lógico recomendable; si quieres físico, deja esta línea
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  private async ensureExists(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
  }

  async supervisorsList() {
    const supervisorRole = await this.prisma.role.findFirst({
      where: { name: 'SUPERVISOR' }, select: { id: true },
    });
    console.log('Supervisor Role:', supervisorRole);
    if (!supervisorRole) {
      throw new NotFoundException('Rol de SUPERVISOR no encontrado');
    }
    const supervisors = await this.prisma.user.findMany({
      where: { isActive: true, roleId: supervisorRole!.id },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    });
    console.log('Supervisores encontrados:', supervisors);
    if (supervisors.length === 0) {
      throw new NotFoundException('No se encontraron supervisores activos');
    }

    return supervisors;
  }
}

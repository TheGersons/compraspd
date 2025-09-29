import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class CatalogsService {
    constructor(private prisma: PrismaClient) { }


    listDepartments(dto: { q?: string; skip: number; take: number }) {
        const where = dto.q ? { name: { contains: dto.q, mode: 'insensitive' as const } } : undefined;
        return this.prisma.department.findMany({ where, skip: dto.skip, take: dto.take, orderBy: { name: 'asc' } });
    }


    listClients(dto: { q?: string; skip: number; take: number }) {
        const where = dto.q ? { name: { contains: dto.q, mode: 'insensitive' as const } } : undefined;
        return this.prisma.client.findMany({ where, skip: dto.skip, take: dto.take, orderBy: { name: 'asc' } });
    }


    listProjects(dto: { q?: string; skip: number; take: number }) {
        const where = dto.q ? { name: { contains: dto.q, mode: 'insensitive' as const } } : undefined;
        return this.prisma.project.findMany({ where, skip: dto.skip, take: dto.take, orderBy: { createdAt: 'desc' } });
    }


    listLocations(dto: { q?: string; skip: number; take: number }) {
        const where = dto.q ? { name: { contains: dto.q, mode: 'insensitive' as const } } : undefined;
        return this.prisma.location.findMany({ where, skip: dto.skip, take: dto.take, orderBy: { name: 'asc' } });
    }


    listSuppliers(dto: { q?: string; skip: number; take: number }) {
        const where = dto.q ? { name: { contains: dto.q, mode: 'insensitive' as const } } : undefined;
        return this.prisma.supplier.findMany({ where, skip: dto.skip, take: dto.take, orderBy: { name: 'asc' } });
    }


    listProducts(dto: { q?: string; skip: number; take: number }) {
        const where = dto.q
            ? {
                OR: [
                    { name: { contains: dto.q, mode: 'insensitive' as const } },
                    { skuInternal: { contains: dto.q, mode: 'insensitive' as const } },
                ],
            }
            : undefined;
        return this.prisma.product.findMany({ where, skip: dto.skip, take: dto.take, orderBy: { updatedAt: 'desc' } });
    }
}
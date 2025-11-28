import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Ajusta la ruta

@Injectable()
export class PaisesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pais.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.pais.findUnique({
      where: { id },
    });
  }
}
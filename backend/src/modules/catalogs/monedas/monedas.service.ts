import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';

@Injectable()
export class MonedasService {
  constructor(private prisma: PrismaService) {}

  async list(activo?: boolean) {
    return this.prisma.moneda.findMany({
      where: typeof activo === 'boolean' ? { activo } : undefined,
      orderBy: [{ orden: 'asc' }, { codigo: 'asc' }],
    });
  }

  async findById(id: string) {
    const m = await this.prisma.moneda.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Moneda no encontrada');
    return m;
  }

  async create(dto: CreateMonedaDto) {
    const exists = await this.prisma.moneda.findUnique({
      where: { codigo: dto.codigo.toUpperCase() },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe una moneda con código "${dto.codigo.toUpperCase()}"`,
      );
    }
    return this.prisma.moneda.create({
      data: {
        codigo: dto.codigo.toUpperCase(),
        nombre: dto.nombre,
        simbolo: dto.simbolo,
        decimales: dto.decimales ?? 2,
        activo: dto.activo ?? true,
        orden: dto.orden ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateMonedaDto) {
    await this.findById(id);

    if (dto.codigo) {
      const exists = await this.prisma.moneda.findFirst({
        where: { codigo: dto.codigo.toUpperCase(), id: { not: id } },
      });
      if (exists) {
        throw new ConflictException(
          `Ya existe otra moneda con código "${dto.codigo.toUpperCase()}"`,
        );
      }
    }

    return this.prisma.moneda.update({
      where: { id },
      data: {
        codigo: dto.codigo ? dto.codigo.toUpperCase() : undefined,
        nombre: dto.nombre,
        simbolo: dto.simbolo,
        decimales: dto.decimales,
        activo: dto.activo,
        orden: dto.orden,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    const [cot, pre, cd, ep, lp, op] = await Promise.all([
      this.prisma.cotizacion.count({ where: { monedaId: id } }),
      this.prisma.precios.count({ where: { monedaId: id } }),
      this.prisma.compraDetalle.count({ where: { monedaId: id } }),
      this.prisma.estadoProducto.count({ where: { monedaId: id } }),
      this.prisma.licitacionProducto.count({ where: { monedaId: id } }),
      this.prisma.ofertaProducto.count({ where: { monedaId: id } }),
    ]);

    const total = cot + pre + cd + ep + lp + op;
    if (total > 0) {
      throw new BadRequestException(
        `No se puede eliminar: la moneda está en uso (${cot} cotizaciones, ${pre} precios, ${cd} compras, ${ep} estados de producto, ${lp} licitaciones, ${op} ofertas).`,
      );
    }

    await this.prisma.moneda.delete({ where: { id } });
    return { ok: true, message: 'Moneda eliminada exitosamente' };
  }
}

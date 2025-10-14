// src/locations/locations.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
// Asegúrate de que la ruta a PrismaService es correcta

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las ubicaciones que sean de tipo 'ALMACEN' o 'OFICINA'.
   * Se pueden ajustar los campos a devolver para optimizar el payload.
   */
  async findAllWarehouses(): Promise<{ id: string; name: string; type: string }[]> {
    return this.prisma.location.findMany({
      where: {
        OR: [
          { type: 'ALMACEN' },
          { type: 'OFICINA' }
        ],
        active: true, // Asumiendo que solo queremos ubicaciones activas
      },
      select: {
        id: true,
        name: true,
        type: true,
        // Puedes añadir más campos si los necesitas, pero `id` y `name` son clave.
      },
    });
  }
  
  /**
   * Busca el ID de una ubicación por su nombre exacto (utilidad para DTO/Mapeo).
   */
  async findIdByName(name: string): Promise<string | null> {
      const location = await this.prisma.location.findUnique({
          where: { name: name }, // Válido gracias al @unique que añadiste
          select: { id: true },
      });
      return location?.id ?? null;
  }
}
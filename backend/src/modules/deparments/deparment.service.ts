// src/locations/locations.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
// Asegúrate de que la ruta a PrismaService es correcta

@Injectable()
export class DeparmentService {
    constructor(private prisma: PrismaService) { }

    /**
     * Obtiene todas las ubicaciones que sean de tipo 'ALMACEN' o 'OFICINA'.
     * Se pueden ajustar los campos a devolver para optimizar el payload.
     */

    async CreateDepartment(departmentName: string): Promise<{ id: string; name: string; }[]> {
        // Lógica para crear un nuevo departamento
        const newDepartment = await this.prisma.department.create({
            data: {
                name: departmentName,
                // Otros campos necesarios
            },
        });
        return [{ id: newDepartment.id, name: newDepartment.name }];

    }
}
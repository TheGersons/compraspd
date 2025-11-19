import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({ 
    example: ['uuid-permiso-1', 'uuid-permiso-2'],
    description: 'Lista de IDs de permisos a asignar al rol'
  })
  @IsArray({ message: 'permisoIds debe ser un array' })
  @IsUUID('4', { each: true, message: 'Cada permisoId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'permisoIds es requerido' })
  permisoIds: string[];
}
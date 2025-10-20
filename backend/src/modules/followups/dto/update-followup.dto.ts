// src/followups/dtos/update-followup.dto.ts

import { IsNumber, IsOptional, IsDateString, IsBoolean, IsEnum, IsArray, IsString, MaxLength } from 'class-validator';

/**
 * Enumeración de estados de seguimiento.  Los valores deben coincidir con
 * los definidos en la enumeración `FollowStatus` del esquema de Prisma.
 * Utilizamos valores en español para reflejar el dominio del negocio y
 * asegurar que la capa de aplicación y la base de datos estén alineadas.
 */
export enum FollowStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
export class UpdateFollowupDto {
  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsDateString()
  eta?: string; // Se enviará como string ISO

  @IsOptional()
  @IsEnum(FollowStatus)
  followStatus?: FollowStatus;

  @IsOptional()
  @IsBoolean()
  priorityRequested?: boolean;
}

export class SendMessageDto {
    @IsOptional()
    @IsString()
    @MaxLength(5000) // Un buen límite para el cuerpo del mensaje
    body?: string;
  
    @IsArray()
    @IsString({ each: true })
    fileIds: string[]; // IDs de los archivos previamente subidos a /files
}
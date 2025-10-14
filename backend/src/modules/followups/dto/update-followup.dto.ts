// src/followups/dtos/update-followup.dto.ts

import { IsNumber, IsOptional, IsDateString, IsBoolean, IsEnum, IsArray, IsString, MaxLength } from 'class-validator';

export enum FollowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
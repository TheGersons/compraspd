// src/modules/tracking-quotes/dto/change-pr-status.dto.ts
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PurchaseRequestStatus } from '../../../common/enums/purchase-request-status.enum';

// Lista de estados permitidos para la validación de entrada
const STATUSES: PurchaseRequestStatus[] = [
    PurchaseRequestStatus.SUBMITTED, 
    PurchaseRequestStatus.UNDER_REVIEW, 
    PurchaseRequestStatus.APPROVED, 
    PurchaseRequestStatus.REJECTED, 
    PurchaseRequestStatus.CANCELLED
];

export class ChangePrStatusDto {
  @IsNotEmpty({ message: 'El estado es requerido.' })
  @IsString()
  @IsIn(STATUSES, { message: `El estado debe ser uno de: ${STATUSES.join(', ')}` })
  status: PurchaseRequestStatus; // Usamos tu tipo local

  @IsOptional()
  @IsString()
  reason?: string; 
}
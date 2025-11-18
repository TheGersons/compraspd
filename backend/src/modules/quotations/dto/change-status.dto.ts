import { IsIn, IsNotEmpty } from 'class-validator';

/**
 * Estados permitidos para Cotizacion
 * Basados en el nuevo flujo del schema
 */
export type QuotationStatus = 
  | 'ENVIADA'        // Default - Recién creada
  | 'EN_REVISION'    // En proceso de revisión
  | 'APROBADA'       // Aprobada, pasa a Compra
  | 'RECHAZADA'      // Rechazada
  | 'CANCELADA';     // Cancelada por el solicitante

export class ChangeQuotationStatusDto {
  @IsNotEmpty()
  @IsIn(['ENVIADA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'CANCELADA'])
  estado: QuotationStatus;
}
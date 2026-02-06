import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsDateString, 
  IsArray, 
  ValidateNested, 
  IsInt, 
  Min,
  IsUUID,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un ítem de cotización
 * Mapea a: CotizacionDetalle
 */
export class CreateQuotationItemDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty()
  @IsString()
  descripcionProducto: string ; // description → descripcionProducto

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number ; // quantity → cantidad

  @IsNotEmpty()
  @IsString()
  tipoUnidad: string ; // unit → tipoUnidad (ej: "UNIDAD", "CAJA", "METRO")

  @IsOptional()
  @IsString()
  notas?: string; // notes → notas
}

/**
 * DTO para crear una cotización completa (con items)
 * Mapea a: Cotizacion + CotizacionDetalle[]
 */
export class CreateQuotationDto {
  @IsNotEmpty()
  @IsString()
  nombreCotizacion: string ; // title → nombreCotizacion

  @IsNotEmpty()
  @IsUUID()
  tipoId: string ; // requestCategory → tipoId (UUID de tabla Tipo)

  @IsNotEmpty()
  @IsUUID()
  solicitanteId: string ; // requesterId → solicitanteId (UUID de usuario)

  @IsOptional()
  @IsUUID()
  proyectoId?: string; // projectId → proyectoId

  @IsNotEmpty()
  @IsIn(['NACIONAL', 'INTERNACIONAL'])
  tipoCompra: 'NACIONAL' | 'INTERNACIONAL' ; // procurement → tipoCompra

  @IsNotEmpty()
  @IsIn(['ALMACEN', 'PROYECTO', 'OFICINA'])
  lugarEntrega: 'ALMACEN' | 'PROYECTO' | 'OFICINA' ; // deliveryType → lugarEntrega

  @IsNotEmpty()
  @IsDateString()
  fechaLimite: string ; // quoteDeadline → fechaLimite

  @IsNotEmpty()
  @IsDateString()
  fechaEstimada: string ; // dueDate → fechaEstimada (NUEVO OBLIGATORIO)

  @IsOptional()
  @IsString()
  comentarios?: string; // comments → comentarios

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[] ; // Detalles de la cotización
}
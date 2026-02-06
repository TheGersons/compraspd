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
  descripcionProducto: string | undefined; // description → descripcionProducto

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number | undefined; // quantity → cantidad

  @IsNotEmpty()
  @IsString()
  tipoUnidad: string | undefined; // unit → tipoUnidad (ej: "UNIDAD", "CAJA", "METRO")

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
  nombreCotizacion: string | undefined; // title → nombreCotizacion

  @IsNotEmpty()
  @IsUUID()
  tipoId: string | undefined; // requestCategory → tipoId (UUID de tabla Tipo)

  @IsNotEmpty()
  @IsUUID()
  solicitanteId: string | undefined; // requesterId → solicitanteId (UUID de usuario)

  @IsOptional()
  @IsUUID()
  proyectoId?: string; // projectId → proyectoId

  @IsNotEmpty()
  @IsIn(['NACIONAL', 'INTERNACIONAL'])
  tipoCompra: 'NACIONAL' | 'INTERNACIONAL' | undefined; // procurement → tipoCompra

  @IsNotEmpty()
  @IsIn(['ALMACEN', 'PROYECTO', 'OFICINA'])
  lugarEntrega: 'ALMACEN' | 'PROYECTO' | 'OFICINA' | undefined; // deliveryType → lugarEntrega

  @IsNotEmpty()
  @IsDateString()
  fechaLimite: string | undefined; // quoteDeadline → fechaLimite

  @IsNotEmpty()
  @IsDateString()
  fechaEstimada: string | undefined; // dueDate → fechaEstimada (NUEVO OBLIGATORIO)

  @IsOptional()
  @IsString()
  comentarios?: string; // comments → comentarios

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[] | undefined; // Detalles de la cotización
}
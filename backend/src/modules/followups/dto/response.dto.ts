import { ApiProperty } from "@nestjs/swagger";
import { MedioTransporte } from "@prisma/client";
import { TimelineConfigDto } from "./timeline-config.dto";

export class HistorialResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accion: string;

  @ApiProperty()
  detalles: any;

  @ApiProperty()
  creado: Date;

  @ApiProperty({ 
    type: 'object',
    additionalProperties: true 
  })
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

export class CotizacionFollowUpResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombreCotizacion: string;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  fechaSolicitud: Date;

  @ApiProperty()
  fechaLimite: Date;

  @ApiProperty()
  aprobadaParcialmente: boolean;

  @ApiProperty()
  todosProductosAprobados: boolean;

  @ApiProperty({ 
    type: 'object',
    additionalProperties: true 
  })
  solicitante: {
    id: string;
    nombre: string;
    email: string;
  };

  @ApiProperty({ 
    type: 'object', 
    additionalProperties: true 
  })
  supervisorResponsable?: {
    id: string;
    nombre: string;
    email: string;
  };

  @ApiProperty({ 
    type: 'object', 
    additionalProperties: true 
  })
  proyecto?: {
    id: string;
    nombre: string;
  };

  @ApiProperty()
  chatId: string;

  @ApiProperty()
  totalProductos: number;

  @ApiProperty()
  productosAprobados: number;

  @ApiProperty()
  productosPendientes: number;

  @ApiProperty({ type: [Object] })
  productos: any[];
}

export class TimelineSKUResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty({ 
    type: 'object', 
    additionalProperties: true 
  })
  paisOrigen?: {
    id: string;
    nombre: string;
    codigo: string;
  };

  @ApiProperty({ enum: MedioTransporte })
  medioTransporte: MedioTransporte;

  @ApiProperty({ type: TimelineConfigDto })
  timeline: TimelineConfigDto;

  @ApiProperty()
  diasTotalesEstimados: number;

  @ApiProperty({ required: false })
  notas?: string;

  @ApiProperty()
  creado: Date;

  @ApiProperty()
  actualizado: Date;
}

export class EstadoProductoDetalleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  cantidad: number;

  @ApiProperty()
  aprobadoPorSupervisor: boolean;

  @ApiProperty({ required: false })
  fechaAprobacion?: Date;

  @ApiProperty({ 
    type: 'object', 
    additionalProperties: true 
  })
  paisOrigen?: {
    id: string;
    nombre: string;
    codigo: string;
  };

  @ApiProperty({ enum: MedioTransporte, required: false })
  medioTransporte?: MedioTransporte;

  @ApiProperty()
  diasRetrasoActual: number;

  @ApiProperty()
  criticidad: number;

  @ApiProperty()
  nivelCriticidad: string;

  @ApiProperty({ 
    type: 'object', 
    additionalProperties: true 
  })
  timeline?: TimelineSKUResponseDto;
}
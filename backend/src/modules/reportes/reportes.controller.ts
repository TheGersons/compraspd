import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportesService } from './reportes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Reportes de Compras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reportes de cotizaciones en proceso' })
  @ApiQuery({ name: 'desde', required: false })
  @ApiQuery({ name: 'hasta', required: false })
  listar(
    @CurrentUser() user: UserJwt,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.listar(user, { desde, hasta });
  }

  @Get('productos/filtros')
  @ApiOperation({ summary: 'Opciones de filtro para el reporte por producto' })
  getFiltrosProductos(@CurrentUser() user: UserJwt) {
    return this.service.getFiltrosProductos(user);
  }

  @Get('productos')
  @ApiOperation({ summary: 'Reporte de productos en seguimiento' })
  @ApiQuery({ name: 'desde',         required: false })
  @ApiQuery({ name: 'hasta',         required: false })
  @ApiQuery({ name: 'tipoCompra',    required: false, description: 'TODAS|NACIONAL|INTERNACIONAL' })
  @ApiQuery({ name: 'vista',         required: false, description: 'AMBOS|COTIZACION|COMPRA' })
  @ApiQuery({ name: 'proyectoId',    required: false })
  @ApiQuery({ name: 'responsableId', required: false })
  @ApiQuery({ name: 'proveedor',     required: false })
  @ApiQuery({ name: 'oc',            required: false })
  @ApiQuery({ name: 'descripcion',   required: false })
  listarProductos(
    @CurrentUser() user: UserJwt,
    @Query('desde')         desde?: string,
    @Query('hasta')         hasta?: string,
    @Query('tipoCompra')    tipoCompra?: string,
    @Query('vista')         vista?: string,
    @Query('proyectoId')    proyectoId?: string,
    @Query('responsableId') responsableId?: string,
    @Query('proveedor')     proveedor?: string,
    @Query('oc')            oc?: string,
    @Query('descripcion')   descripcion?: string,
  ) {
    return this.service.listarProductos(user, {
      desde, hasta, tipoCompra, vista, proyectoId, responsableId, proveedor, oc, descripcion,
    });
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Historial de cambios de un reporte' })
  getLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.getLogs(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar campos editables de un reporte' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Record<string, any>,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.actualizar(id, dto, user);
  }
}

import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SeguimientoService } from './seguimiento.service';
import { CreateSeguimientoDto, ListSeguimientoQueryDto } from './dto/seguimiento.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Seguimiento')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/seguimiento')
export class SeguimientoController {
  constructor(private readonly seguimientoService: SeguimientoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de seguimiento manual' })
  create(@Body() dto: CreateSeguimientoDto, @CurrentUser() user: UserJwt) {
    return this.seguimientoService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar seguimientos con filtros' })
  list(@Query() filters: ListSeguimientoQueryDto) {
    return this.seguimientoService.list(filters);
  }

  @Get('timeline/compra/:compraId')
  @ApiOperation({ summary: 'Timeline completo de una compra' })
  getTimelineCompra(@Param('compraId', ParseUUIDPipe) compraId: string) {
    return this.seguimientoService.getTimeline(compraId);
  }

  @Get('timeline/detalle/:detalleId')
  @ApiOperation({ summary: 'Timeline completo de un detalle' })
  getTimelineDetalle(@Param('detalleId', ParseUUIDPipe) detalleId: string) {
    return this.seguimientoService.getTimeline(undefined, detalleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener seguimiento por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seguimientoService.findById(id);
  }
}
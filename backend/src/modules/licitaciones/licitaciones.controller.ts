import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LicitacionesService } from './licitaciones.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Licitaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/licitaciones')
export class LicitacionesController {
  constructor(private readonly service: LicitacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar licitaciones' })
  listar(@Query('estado') estado?: string) {
    return this.service.listar(estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de licitación' })
  getDetalle(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getDetalle(id);
  }

  @Patch(':productoId/avanzar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Avanzar estado de producto' })
  avanzarEstado(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Body() body: { observaciones?: string },
  ) {
    return this.service.avanzarEstado(productoId, body.observaciones);
  }

  @Patch(':id/archivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archivar licitación' })
  archivar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { motivo: string },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.archivar(id, body.motivo, user);
  }

  @Patch(':id/rechazar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar licitación' })
  rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { motivo: string },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.rechazar(id, body.motivo, user);
  }

  @Patch(':id/reactivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivar licitación' })
  reactivar(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.reactivar(id);
  }
}

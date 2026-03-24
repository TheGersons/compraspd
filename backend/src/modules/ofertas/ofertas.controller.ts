import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { OfertasService } from './ofertas.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Ofertas Comerciales')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/ofertas')
export class OfertasController {
  constructor(private readonly service: OfertasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ofertas' })
  list(@Query('estado') estado: string, @CurrentUser() user: UserJwt) {
    return this.service.list(estado || 'ACTIVA', user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de oferta' })
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.getById(id, user);
  }

  @Patch(':id/avanzar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Avanzar estado de producto de oferta' })
  avanzar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { observaciones?: string },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.avanzarEstado(id, user, body.observaciones);
  }

  @Patch(':id/archivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archivar oferta manualmente' })
  archivar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { motivo: string },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.archivar(id, body.motivo, user);
  }

  @Patch(':id/reactivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivar oferta archivada' })
  reactivar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.reactivar(id, user);
  }

  @Patch(':id/rechazar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar oferta' })
  rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { motivo: string },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.rechazar(id, body.motivo, user);
  }
}

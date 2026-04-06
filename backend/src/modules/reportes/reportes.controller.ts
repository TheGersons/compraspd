import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Listar reportes de compras' })
  listar(@CurrentUser() user: UserJwt) {
    return this.service.listar(user);
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

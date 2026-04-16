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
import { ImportExportService } from './import-export.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Import-Export')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/import-export')
export class ImportExportController {
  constructor(private readonly service: ImportExportService) {}

  @Get()
  @ApiOperation({ summary: 'Listar seguimientos de importación' })
  listar(@CurrentUser() user: UserJwt) {
    return this.service.listar(user);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Historial de cambios' })
  getLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.getLogs(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar campos editables' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Record<string, any>,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.actualizar(id, dto, user);
  }
}

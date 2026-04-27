import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MonedasService } from './monedas.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';

@ApiTags('Monedas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/monedas')
export class MonedasController {
  constructor(private readonly monedasService: MonedasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar monedas' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de monedas' })
  list(
    @Query('activo', new ParseBoolPipe({ optional: true })) activo?: boolean,
  ) {
    return this.monedasService.list(activo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener moneda por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.monedasService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva moneda' })
  create(@Body() dto: CreateMonedaDto) {
    return this.monedasService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar moneda' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMonedaDto,
  ) {
    return this.monedasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar moneda (solo si no está en uso)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.monedasService.remove(id);
  }
}

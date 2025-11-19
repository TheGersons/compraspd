import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { TiposService } from './tipos.service';

@ApiTags('Tipos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/tipos')
export class TiposController {
  constructor(private readonly tiposService: TiposService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos' })
  @ApiQuery({ name: 'areaId', required: false, description: 'Filtrar por área' })
  @ApiResponse({ status: 200, description: 'Lista de tipos obtenida' })
  list(@Query('areaId') areaId?: string) {
    return this.tiposService.listTipos(areaId);
  }

  @Get('area/:areaId')
  @ApiOperation({ summary: 'Listar tipos por área' })
  @ApiResponse({ status: 200, description: 'Lista de tipos del área' })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  findByArea(@Param('areaId', ParseUUIDPipe) areaId: string) {
    return this.tiposService.findByArea(areaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo por ID' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tiposService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo' })
  @ApiResponse({ status: 201, description: 'Tipo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Área no encontrada' })
  @ApiResponse({ status: 409, description: 'El tipo ya existe en el área' })
  create(@Body() dto: CreateTipoDto) {
    return this.tiposService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo' })
  @ApiResponse({ status: 200, description: 'Tipo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTipoDto
  ) {
    return this.tiposService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tipo' })
  @ApiResponse({ status: 200, description: 'Tipo eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene cotizaciones)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tiposService.remove(id);
  }
}
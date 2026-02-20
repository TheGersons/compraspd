import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import { PrismaService } from '../../../prisma/prisma.service';

@ApiTags('Proveedores')
@Controller('api/v1/proveedores')
@UseGuards(AuthGuard('jwt'))
export class ProveedoresController {
  constructor(
    private readonly service: ProveedoresService,
    private readonly prisma: PrismaService,
  ) {}

  private async verificarPermisos(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    });
    const rol = usuario?.rol.nombre.toLowerCase() || '';
    if (!rol.includes('admin') && !rol.includes('supervisor')) {
      throw new ForbiddenException(
        'Solo ADMIN y SUPERVISOR pueden realizar esta acción',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar proveedores' })
  async findAll(
    @Query()
    query: {
      search?: string;
      activo?: string;
      page?: string;
      pageSize?: string;
    },
  ) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear proveedor' })
  async create(
    @Body()
    dto: {
      nombre: string;
      rtn?: string;
      email?: string;
      telefono?: string;
      direccion?: string;
    },
    @Req() req: any,
  ) {
    await this.verificarPermisos(req.user.sub);
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  async update(
    @Param('id') id: string,
    @Body()
    dto: {
      nombre?: string;
      rtn?: string;
      email?: string;
      telefono?: string;
      direccion?: string;
      activo?: boolean;
    },
    @Req() req: any,
  ) {
    await this.verificarPermisos(req.user.sub);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar/desactivar proveedor' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.verificarPermisos(req.user.sub);
    return this.service.remove(id);
  }
}

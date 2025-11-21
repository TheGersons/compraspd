import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto, ListNotificacionesQueryDto } from './dto/notificacion.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear notificación (admin)' })
  create(@Body() dto: CreateNotificacionDto) {
    return this.notificacionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario' })
  list(@Query() filters: ListNotificacionesQueryDto, @CurrentUser() user: UserJwt) {
    return this.notificacionService.list(user.sub, filters);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contador de no leídas' })
  getUnreadCount(@CurrentUser() user: UserJwt) {
    return this.notificacionService.getUnreadCount(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener notificación por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserJwt) {
    return this.notificacionService.findById(id, user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar como leída' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserJwt) {
    return this.notificacionService.markAsRead(id, user.sub);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  markAllAsRead(@CurrentUser() user: UserJwt) {
    return this.notificacionService.markAllAsRead(user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar notificación' })
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserJwt) {
    return this.notificacionService.delete(id, user.sub);
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar todas las notificaciones' })
  deleteAll(@CurrentUser() user: UserJwt) {
    return this.notificacionService.deleteAll(user.sub);
  }
}
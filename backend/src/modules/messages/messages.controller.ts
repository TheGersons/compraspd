import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Query, 
  UseGuards,
  ParseUUIDPipe,
  Patch
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { CreateChatDto, AddParticipantsDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para gestión de chats y mensajería
 * 
 * Endpoints principales:
 * - POST /messages - Crear nuevo chat
 * - GET /messages - Listar mis chats
 * - GET /messages/:chatId - Obtener chat específico
 * - POST /messages/:chatId/participants - Agregar participantes
 * - POST /messages/:chatId/messages - Enviar mensaje
 * - GET /messages/:chatId/messages - Listar mensajes
 * - PATCH /messages/:chatId/read - Marcar como leído
 * - GET /messages/unread/count - Contador de no leídos
 */
@ApiTags('Chats y Mensajería')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  /**
   * POST /api/v1/messages
   * Crea un nuevo chat con participantes
   */
  @Post()
  createChat(
    @CurrentUser() user: UserJwt,
    @Body() dto: CreateChatDto
  ) {
    return this.service.createChat(dto, user);
  }

  /**
   * GET /api/v1/messages
   * Lista todos los chats donde el usuario participa
   * Incluye último mensaje y contador de no leídos
   */
  @Get()
  listMyChats(
    @CurrentUser() user: UserJwt,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listMyChats(
      user,
      Number(page || 1),
      Number(pageSize || 20)
    );
  }

  /**
   * GET /api/v1/messages/unread/count
   * Obtiene el total de mensajes no leídos del usuario
   */
  @Get('unread/count')
  getUnreadCount(@CurrentUser() user: UserJwt) {
    return this.service.getUnreadCount(user);
  }

  /**
   * GET /api/v1/messages/:chatId
   * Obtiene información de un chat específico
   * Incluye participantes
   */
  @Get(':chatId')
  getChat(
    @CurrentUser() user: UserJwt,
    @Param('chatId', ParseUUIDPipe) chatId: string
  ) {
    return this.service.getChat(chatId, user);
  }

  /**
   * POST /api/v1/messages/:chatId/participants
   * Agrega nuevos participantes a un chat existente
   */
  @Post(':chatId/participants')
  addParticipants(
    @CurrentUser() user: UserJwt,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: AddParticipantsDto
  ) {
    return this.service.addParticipants(chatId, dto, user);
  }

  /**
   * POST /api/v1/messages/:chatId/messages
   * Envía un mensaje en un chat
   */
  @Post(':chatId/messages')
  createMessage(
    @CurrentUser() user: UserJwt,
    @Body() dto: CreateMessageDto
  ) {
    return this.service.createMessage(dto, user);
  }

  /**
   * GET /api/v1/messages/:chatId/messages
   * Lista los mensajes de un chat con paginación
   * Marca automáticamente como leídos
   */
  @Get(':chatId/messages')
  listMessages(
    @CurrentUser() user: UserJwt,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listMessages(
      chatId,
      user,
      Number(page || 1),
      Number(pageSize || 50)
    );
  }

  /**
   * PATCH /api/v1/messages/:chatId/read
   * Marca todos los mensajes del chat como leídos
   */
  @Patch(':chatId/read')
  markAsRead(
    @CurrentUser() user: UserJwt,
    @Param('chatId', ParseUUIDPipe) chatId: string
  ) {
    return this.service.markAsRead(chatId, user);
  }
}
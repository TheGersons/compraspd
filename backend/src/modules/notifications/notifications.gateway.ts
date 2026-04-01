import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://192.168.3.37:5173',
  'http://192.168.3.37:8080',
  'http://192.168.3.38:5173',
  'http://192.168.3.38:8080',
  'http://192.168.114.18:5173',
  'http://192.168.114.18:8080',
  'http://89.167.20.163:6080',
];

@WebSocketGateway({
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      // Decode JWT payload (no verify — only for room assignment)
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      );
      const userId: string = payload?.sub;
      if (!userId) throw new Error('No sub in token');

      client.data.userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`Socket connected: user=${userId} socket=${client.id}`);
    } catch {
      this.logger.warn(`Socket auth failed: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.logger.log(`Socket disconnected: user=${userId} socket=${client.id}`);
    }
  }

  /**
   * Emite un evento a todos los sockets de un usuario específico
   */
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emite un evento a múltiples usuarios
   */
  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((id) => this.emitToUser(id, event, data));
  }
}

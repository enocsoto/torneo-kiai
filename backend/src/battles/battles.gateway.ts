import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getFrontendCorsOrigins } from '../common/cors-origins';

@WebSocketGateway({
  namespace: '/battles',
  cors: { origin: getFrontendCorsOrigins(), credentials: true },
})
export class BattlesGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('watch')
  async handleWatch(
    @MessageBody() battleId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`battle:${battleId}`);
  }

  /**
   * Llamado por BattlesService tras aplicar una acción en modo online.
   * Emite el estado actualizado a ambos jugadores que observan la batalla.
   */
  notifyUpdate(battleId: string, battle: Record<string, unknown>) {
    this.server.to(`battle:${battleId}`).emit('battle:update', battle);
  }
}

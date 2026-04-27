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
  namespace: '/rooms',
  cors: { origin: getFrontendCorsOrigins(), credentials: true },
})
export class RoomsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('watch')
  async handleWatch(
    @MessageBody() code: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room:${(code ?? '').trim().toUpperCase()}`;
    await client.join(room);
  }

  /**
   * Llamado por MatchRoomService cuando alguien se une a la sala.
   * Notifica al anfitrión (que está en la sala socket) con el battleId listo.
   */
  notifyReady(code: string, battleId: string) {
    this.server
      .to(`room:${code.trim().toUpperCase()}`)
      .emit('room:ready', { battleId });
  }
}

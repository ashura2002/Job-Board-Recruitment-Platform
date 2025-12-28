import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const accessToken = client.handshake.auth?.accessToken;
      if (!accessToken) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(accessToken);
      const userId = payload.sub;
      client.join(`user-${userId}`);
      console.log(`User ${userId} connected`);
    } catch (error) {
      console.log('ERROR FROM WEBSOCKET', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Socket disconnected: ${client.id}`);
  }

  // server-side emit only
  notifyUser(userId: number, payload: any) {
    this.server.to(`user-${userId}`).emit('notification', payload);
  }
}

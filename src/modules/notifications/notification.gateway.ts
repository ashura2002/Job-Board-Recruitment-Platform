import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IJwtResponse } from 'src/common/types/jwt.types';
import { INotificationPayload } from 'src/common/types/notification-payload';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // extract the token to the handshake
      const accessToken = client.handshake.auth?.accessToken;
      if (!accessToken) {
        client.disconnect();
        return;
      }

      // verify the token if invalid or expired
      const payload = await this.jwtService.verifyAsync<IJwtResponse>(
        accessToken,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );
      client.join(`user-${payload.userId}`);
      console.log(
        `Connected: user with the ID of ${payload.userId} is connected to the server`,
      );
    } catch (error) {
      console.log('ERROR FROM HANDLE CONNECTION:', error);
    }
  }

  handleDisconnect(client: Socket) {
    client.disconnect();
    console.log(`ERROR FROM HANDLE DISCONNECT`);
  }

  notifyUser(userId: number, payload: INotificationPayload) {
    this.server.to(`user-${userId}`).emit('notification', payload);
  }
}

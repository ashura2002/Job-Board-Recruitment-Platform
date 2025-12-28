import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway()
export class NotificationGateway {
  @SubscribeMessage('notifications')
  handleNewNotification(@MessageBody() message: any) {
    console.log(message);
  }
}

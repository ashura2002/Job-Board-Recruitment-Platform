import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
})
export class NotificationsModule {}

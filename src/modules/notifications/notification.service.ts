import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Notification } from 'src/generated/prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(
    message: string,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.prismaService.notification.create({
      data: {
        message,
        userId,
      },
    });
    return notification;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    const notification = await this.prismaService.notification.findMany({
      where: { userId: userId },
    });
    return notification;
  }
}

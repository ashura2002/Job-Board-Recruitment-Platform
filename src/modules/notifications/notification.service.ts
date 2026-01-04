import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Notification } from 'src/generated/prisma/client';
import { CreateNotificationDTO } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(
    dto: CreateNotificationDTO,
    userId: number,
  ): Promise<Notification> {
    const { message } = dto;
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

  async getOneNotification(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId: userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification = await this.getOneNotification(notificationId, userId);
    await this.prismaService.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
  }

  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    const notification = await this.getOneNotification(notificationId, userId);
    await this.prismaService.notification.delete({
      where: { id: notification.id },
    });
  }
}

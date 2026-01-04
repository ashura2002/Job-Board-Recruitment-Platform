import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import type { AuthUser } from 'src/common/types/auth-user';
import { Notification } from 'src/generated/prisma/client';
import { CreateNotificationDTO } from './dto/create-notification.dto';

@Controller('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(
    @Req() req: AuthUser,
    @Body() dto: CreateNotificationDTO,
  ): Promise<Notification> {
    const { userId } = req.user;
    return await this.notificationService.createNotification(dto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotifications(@Req() req: AuthUser): Promise<Notification[]> {
    const { userId } = req.user;
    return await this.notificationService.getNotifications(userId);
  }

  @Get(':notificationId')
  @HttpCode(HttpStatus.OK)
  async getOneNotification(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Req() req: AuthUser,
  ): Promise<any> {
    const { userId } = req.user;
    return await this.notificationService.getOneNotification(
      notificationId,
      userId,
    );
  }

  @Patch(':notificationId')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Req() req: AuthUser,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.notificationService.markAsRead(notificationId, userId);
    return { message: 'Mark as read successfully' };
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Req() req: AuthUser,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.notificationService.deleteNotification(notificationId, userId);
    return { message: 'Deleted Successfully' };
  }
}

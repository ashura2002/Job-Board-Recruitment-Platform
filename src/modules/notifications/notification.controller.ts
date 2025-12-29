import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

@Controller('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(
    @Req() req: AuthUser,
    @Body() message: string,
  ): Promise<Notification> {
    const { userId } = req.user;
    return await this.notificationService.createNotification(message, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotifications(@Req() req: AuthUser): Promise<Notification[]> {
    const { userId } = req.user;
    return await this.notificationService.getNotifications(userId);
  }
}

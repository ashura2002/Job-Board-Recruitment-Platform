import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/generated/prisma/enums';
import type { AuthUser } from 'src/common/types/auth-user';
import { CreateApplicationDTO } from './dto/create-application.dto';
import { Application } from 'src/generated/prisma/client';

@Controller('applications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // understand the interceptor and the fileuploads
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Jobseeker)
  async applyJob(
    @Req() req: AuthUser,
    @Body() dto: CreateApplicationDTO,
  ): Promise<any> {
    const { userId } = req.user;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker)
  async getMyApplications(@Req() req: AuthUser): Promise<Application[]> {
    const { userId } = req.user;
    return await this.applicationsService.getMyApplications(userId);
  }
}

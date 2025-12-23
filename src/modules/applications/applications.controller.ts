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
import { FileInterceptor } from '@nestjs/platform-express';
import { resumeUploadConfig } from 'src/config/file-upload.config';

@Controller('applications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // jobseeker only
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('resume', resumeUploadConfig()))
  @Roles(Role.Jobseeker)
  async applyJob(
    @Req() req: AuthUser,
    @Body() dto: CreateApplicationDTO,
    @UploadedFile() resume: Express.Multer.File,
  ): Promise<Application> {
    const { userId } = req.user;
    return await this.applicationsService.applyJob(userId, dto, resume);
  }

  // jobseeker only
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker)
  async getMyApplications(@Req() req: AuthUser): Promise<Application[]> {
    const { userId } = req.user;
    return await this.applicationsService.getMyApplications(userId);
  }
}

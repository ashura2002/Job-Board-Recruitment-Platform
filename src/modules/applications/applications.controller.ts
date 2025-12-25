import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
import { UpdateApplicationStatusDTO } from './dto/update-status.dto';

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
  async getAllMyApplications(@Req() req: AuthUser): Promise<Application[]> {
    const { userId } = req.user;
    return await this.applicationsService.getAllMyApplications(userId);
  }

  @Get('me/:applicationId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker)
  async getOneOfMyApplication(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Req() req: AuthUser,
  ): Promise<Application> {
    const { userId } = req.user;
    return await this.applicationsService.getOneOfMyApplication(
      applicationId,
      userId,
    );
  }

  @Patch(':applicationId/status')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async updateApplicationStatus(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() updateDTO: UpdateApplicationStatusDTO,
    @Req() req: AuthUser,
  ): Promise<Application> {
    const { userId } = req.user;
    return await this.applicationsService.updateApplicationStatus(
      applicationId,
      updateDTO,
      userId,
    );
  }
}

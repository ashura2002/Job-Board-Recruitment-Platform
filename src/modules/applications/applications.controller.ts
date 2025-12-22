import {
  Body,
  Controller,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { resumeUploadConfig } from 'src/config/file-upload.config';

@Controller('applications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Jobseeker)
  @UseInterceptors(FileInterceptor('resume', resumeUploadConfig()))
  async applyJob(
    @Req() req: AuthUser,
    @Body() dto: CreateApplicationDTO,
    @UploadedFile() resume?: Express.Multer.File,
  ): Promise<any> {
    const { userId } = req.user;
  }
}

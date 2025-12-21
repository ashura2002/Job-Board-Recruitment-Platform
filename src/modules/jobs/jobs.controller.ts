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
import { JobsService } from './jobs.service';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CreateJobDTO } from './dto/create-job.dto';
import type { AuthUser } from 'src/common/types/auth-user';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/generated/prisma/enums';
import { Job } from 'src/generated/prisma/client';

@Controller('jobs')
@UseGuards(JwtGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Recruiter, Role.Admin)
  async createJob(
    @Body() dto: CreateJobDTO,
    @Req() req: AuthUser,
  ): Promise<Job> {
    const { userId } = req.user;
    return await this.jobsService.createJob(dto, userId);
  }

  // Recruiters
  @Get('own-jobs')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getAllOwnJobs(@Req() req: AuthUser): Promise<Job[]> {
    const { userId } = req.user;
    return await this.jobsService.getAllOwnJobs(userId);
  }

  // admin
  @Get('admin')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllJobsByAdmin(): Promise<Job[]> {
    return await this.jobsService.getAllJobsByAdmin();
  }
}

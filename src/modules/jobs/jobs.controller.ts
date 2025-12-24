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
import { JobsService } from './jobs.service';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CreateJobDTO } from './dto/create-job.dto';
import type { AuthUser } from 'src/common/types/auth-user';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/generated/prisma/enums';
import { Job } from 'src/generated/prisma/client';
import { UpdateJobs } from './dto/update-job.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JobWithApplicants } from 'src/common/types/job-with-applicants.types';

@Controller('jobs')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // recruiter
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

  // public route
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllJobs(): Promise<Job[]> {
    return await this.jobsService.getAllJobs();
  }

  // Recruiters
  @Get('own-posted-jobs')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getAllOwnJobs(@Req() req: AuthUser): Promise<Job[]> {
    const { userId } = req.user;
    return await this.jobsService.getAllOwnJobs(userId);
  }

  // recruiter
  @Patch('own-posted-jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async updatePostedJob(
    @Body() dto: UpdateJobs,
    @Req() req: AuthUser,
    @Param('jobId', ParseIntPipe) jobId: number,
  ): Promise<Job> {
    const { userId } = req.user;
    return await this.jobsService.updateOwnPostedJobs(dto, userId, jobId);
  }

  // recruiter
  @Delete('own-posted-jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async deleteJobByrecruiter(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Req() req: AuthUser,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.jobsService.deleteJobByrecruiter(jobId, userId);
    return { message: 'Job was deleted successfully' };
  }

  // admin
  @Delete('admin/:jobId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async deleteJobByadmin(
    @Param('jobId', ParseIntPipe) jobId: number,
  ): Promise<{ message: string }> {
    await this.jobsService.deleteJobByAdmin(jobId);
    return { message: 'Job was deleted successfully' };
  }

  // public route
  @Get('job-details/:jobId')
  @HttpCode(HttpStatus.OK)
  async getJobById(@Param('jobId', ParseIntPipe) jobId: number): Promise<Job> {
    return await this.jobsService.findJobById(jobId);
  }

  @Get('applications/:jobId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getApplicantsForJob(
    @Req() req: AuthUser,
    @Param('jobId', ParseIntPipe) jobId: number,
  ): Promise<JobWithApplicants[]> {
    const { userId } = req.user;
    return await this.jobsService.getApplicantsForJob(userId, jobId);
  }
}

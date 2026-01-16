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
  Query,
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
import { Application, Job } from 'src/generated/prisma/client';
import { UpdateJobs } from './dto/update-job.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobWithApplicants } from 'src/common/types/job-with-applicants.types';

@Controller('jobs')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // recruiter
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Recruiter)
  async createJob(
    @Body() dto: CreateJobDTO,
    @Req() req: AuthUser,
  ): Promise<Job> {
    const { userId } = req.user;
    return await this.jobsService.createJob(dto, userId);
  }

  // public route
  @Get()
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
    example: 10,
  })
  @HttpCode(HttpStatus.OK)
  async getAllJobs(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<any> {
    return await this.jobsService.getAllJobs(page, limit);
  }

  // Recruiters all jobs created
  @Get('own-posted-jobs')
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 10,
  })
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getAllOwnJobs(
    @Req() req: AuthUser,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<any> {
    const { userId } = req.user;
    return await this.jobsService.getAllOwnJobs(userId, page, limit);
  }

  // Recruiters get one all jobs created
  @Get('own-posted-jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getOneOnMyOwnJobs(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Req() req: AuthUser,
  ): Promise<any> {
    const { userId } = req.user;
    return await this.jobsService.getOneOnMyOwnJobs(jobId, userId);
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

  @Get('applications/:jobId/:applicationId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getOneApplicantOnOwnApplicationList(
    @Req() req: AuthUser,
    @Param('jobId', ParseIntPipe) jobId: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<Application> {
    const { userId } = req.user;
    return await this.jobsService.getOneApplicantOnOwnApplicationList(
      userId,
      jobId,
      applicationId,
    );
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchForJobName(@Query('query') query: string): Promise<Job[]> {
    return await this.jobsService.searchForJobName(query);
  }
}

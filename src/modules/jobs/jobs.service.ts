import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateJobDTO } from './dto/create-job.dto';
import { Application, Job } from 'src/generated/prisma/client';
import { UpdateJobs } from './dto/update-job.dto';
import { JobWithApplicants } from 'src/common/types/job-with-applicants.types';
import { PaginatedResult } from 'src/common/types/paginated-result.type';

@Injectable()
export class JobsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createJob(dto: CreateJobDTO, userId: number): Promise<Job> {
    const job = await this.prismaService.job.create({
      data: {
        ...dto,
        userId,
      },
    });
    return job;
  }

  async getAllOwnJobs(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Job>> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const [fetchJobs, total] = await this.prismaService.$transaction([
      this.prismaService.job.findMany({
        where: { userId },
        take: safeLimit,
        skip,
      }),
      this.prismaService.job.count({ where: { userId } }),
    ]);

    return {
      data: fetchJobs,
      metaData: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getOneOnMyOwnJobs(jobId: number, userId: number): Promise<Job> {
    const job = await this.prismaService.job.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async getAllJobs(page: number, limit: number): Promise<PaginatedResult<Job>> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50); // Even if the client sends limit=1000, the server will only use 50.
    const skip = (safePage - 1) * safeLimit;
    // console.log({ page, limit });

    const [fetchJobs, total] = await this.prismaService.$transaction([
      this.prismaService.job.findMany({
        take: safeLimit,
        skip,
      }),
      this.prismaService.job.count(),
    ]);
    return {
      data: fetchJobs,
      metaData: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async updateOwnPostedJobs(
    dto: UpdateJobs,
    userId: number,
    jobId: number,
  ): Promise<Job> {
    const job = await this.findJobById(jobId);
    if (job.userId !== userId)
      throw new BadRequestException(`You can't modify this job`);

    const updatedJob = await this.prismaService.job.update({
      where: { id: jobId },
      data: dto,
    });

    return updatedJob;
  }

  async deleteJobByrecruiter(jobId: number, userId: number): Promise<void> {
    const job = await this.findJobById(jobId);
    if (job.userId !== userId)
      throw new BadRequestException(`Only the recruiter can delete this job`);
    await this.prismaService.job.delete({
      where: { id: job.id },
    });
  }

  async deleteJobByAdmin(jobId: number): Promise<void> {
    await this.findJobById(jobId);
    await this.prismaService.job.delete({
      where: { id: jobId },
    });
  }

  async findJobById(jobId: number): Promise<Job> {
    const job = await this.prismaService.job.findUnique({
      where: { id: jobId },
      include: { user: { select: { id: true, email: true, fullname: true } } },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async getApplicantsForJob(
    userId: number,
    jobId: number,
  ): Promise<JobWithApplicants[]> {
    const job = await this.prismaService.job.findFirst({
      where: { id: jobId, userId: userId },
    });
    if (!job)
      throw new ForbiddenException(
        'You are not allowed to view applications for this job',
      );

    const applicants = await this.prismaService.application.findMany({
      where: { jobId: jobId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });
    return applicants;
  }

  async getOneApplicantOnOwnApplicationList(
    userId: number,
    jobId: number,
    applicationId: number,
  ): Promise<Application> {
    const applications = await this.prismaService.application.findFirst({
      where: {
        id: applicationId,
        jobId: jobId,
        job: {
          userId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });
    if (!applications)
      throw new ForbiddenException(
        'You are not allowed to view this application',
      );
    return applications;
  }

  async searchForJobName(query: string): Promise<Job[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    const result = await this.prismaService.job.findMany({
      where: {
        title: {
          contains: query, // partial match: the full query string must appear continuously in the title
          mode: 'insensitive', // case-insensitive search (ignores upper/lowercase)
        },
      },
      orderBy: {
        createdAt: 'desc', // for newest job first
      },
    });

    return result;
  }
}

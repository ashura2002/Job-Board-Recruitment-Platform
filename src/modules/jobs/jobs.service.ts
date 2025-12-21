import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateJobDTO } from './dto/create-job.dto';
import { Job } from 'src/generated/prisma/client';
import { UpdateJobs } from './dto/update-job.dto';

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

  async getAllOwnJobs(userId: number): Promise<Job[]> {
    const jobs = await this.prismaService.job.findMany({
      where: { userId: userId },
    });
    return jobs;
  }

  async getAllJobs(): Promise<Job[]> {
    const jobs = await this.prismaService.job.findMany();
    return jobs;
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
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}

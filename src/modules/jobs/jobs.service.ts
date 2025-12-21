import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateJobDTO } from './dto/create-job.dto';
import { Job } from 'src/generated/prisma/client';

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

  async getAllJobsByAdmin(): Promise<Job[]> {
    const jobs = await this.prismaService.job.findMany();
    return jobs;
  }
}

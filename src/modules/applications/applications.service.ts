import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateApplicationDTO } from './dto/create-application.dto';
import { Application } from 'src/generated/prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async applyJob(
    userId: number,
    dto: CreateApplicationDTO,
    resume: Express.Multer.File,
  ): Promise<Application> {
    const application = await this.prismaService.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        resumePath: resume.path,
      },
    });
    return application;
  }

  async getMyApplications(userId: number): Promise<Application[]> {
    const applications = await this.prismaService.application.findMany({
      where: { userId },
      include: { job: true },
    });
    return applications;
  }

}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateApplicationDTO } from './dto/create-application.dto';
import { Application } from 'src/generated/prisma/client';
import * as fs from 'fs/promises';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async applyJob(
    userId: number,
    dto: CreateApplicationDTO,
    resume: Express.Multer.File,
  ): Promise<Application> {
    const existingApplication = await this.findExistingApplication(
      userId,
      dto.jobId,
    );
    if (existingApplication) {
      // delete the upload pdf if the user got bad request
      if (resume?.path) {
        await fs.unlink(resume.path);
      }
      throw new BadRequestException('You have already applied to this job');
    }

    const application = await this.prismaService.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        resumePath: resume.path,
      },
    });
    return application;
  }

  async getAllMyApplications(userId: number): Promise<Application[]> {
    const applications = await this.prismaService.application.findMany({
      where: { userId },
      include: { job: true },
    });
    return applications;
  }

  async getOneOfMyApplication(
    applicationId: number,
    userId: number,
  ): Promise<Application> {
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId, userId: userId },
      include: { job: true },
    });
    if (!application) throw new NotFoundException();
    if (application.userId !== userId)
      throw new BadRequestException(`You can only view your own application`);
    return application;
  }

  async findExistingApplication(
    userId: number,
    jobId: number,
  ): Promise<Application | null> {
    const existing = await this.prismaService.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });
    return existing;
  }
}

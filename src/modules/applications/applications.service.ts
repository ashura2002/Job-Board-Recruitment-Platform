import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateApplicationDTO } from './dto/create-application.dto';
import { Application, JobStatus } from 'src/generated/prisma/client';
import * as fs from 'fs/promises';
import { UpdateApplicationStatusDTO } from './dto/update-status.dto';

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

  async updateApplicationStatus(
    applicationId: number,
    updateDTO: UpdateApplicationStatusDTO,
    recruiterId: number,
  ): Promise<Application> {
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    // the id who create the job must the same on the recruiter id who want's to update the application
    if (application.job.userId !== recruiterId)
      throw new ForbiddenException(
        'You are not allowed to update this application',
      );

    return this.prismaService.application.update({
      where: { id: applicationId },
      data: { status: updateDTO.status },
    });
  }

  async cancelMyJobApplication(
    userId: number,
    applicationId: number,
  ): Promise<void> {
    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    if (application.userId !== userId)
      throw new ForbiddenException('You can only cancel your own application');

    if (application.status !== JobStatus.Applied)
      throw new BadRequestException('Application can no longer be cancelled');

    await this.prismaService.application.update({
      where: { id: applicationId },
      data: { status: JobStatus.Cancelled },
    });
  }

  async deleteMyCancelledAndAppliedApplication(
    userId: number,
    applicationId: number,
  ): Promise<void> {
    const application = await this.prismaService.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.status === JobStatus.Hired)
      throw new BadRequestException(
        'You cannot delete an application that is already hired',
      );
    await this.prismaService.application.delete({
      where: { id: applicationId },
    });
  }
}

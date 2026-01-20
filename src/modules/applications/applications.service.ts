import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateApplicationDTO } from './dto/create-application.dto';
import { Application, JobStatus } from 'src/generated/prisma/client';
import * as fs from 'fs/promises';
import { UpdateApplicationStatusDTO } from './dto/update-status.dto';
import { NotificationGateway } from '../notifications/notification.gateway';
import { NotificationService } from '../notifications/notification.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger();
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly userService: UsersService,
  ) {}

  async applyJob(
    userId: number,
    dto: CreateApplicationDTO,
    resume: Express.Multer.File,
  ): Promise<Application> {
    const currentUser = await this.userService.findById(userId);
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

    // to get the id of the owner of job
    const job = await this.prismaService.job.findUnique({
      where: { id: dto.jobId },
      include: { user: true },
    });

    const application = await this.prismaService.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        resumePath: resume.path,
      },
    });

    // notification to the owner of job
    const message = `${currentUser.fullname} was applying to your job`;
    await this.notificationService.createNotification(
      {
        message,
      },
      job.userId,
    );

    // for realtime update notification
    this.notificationGateway.notifyUser(job.userId, {
      message: 'You have a new notifications.',
      date: new Date(),
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
    const recruiter = await this.userService.findById(recruiterId);

    const application = await this.prismaService.application.findUnique({
      where: { id: applicationId },
      include: { job: true, user: true }, // this is the jobseeker
    });
    if (!application) throw new NotFoundException('Application not found');

    // the id who create the job must the same on the recruiter id who want's to update the application
    if (application.job.userId !== recruiterId)
      throw new ForbiddenException(
        'You are not allowed to update this application',
      );

    if (updateDTO.status === JobStatus.Hired) {
      if (!recruiter.companyName) {
        throw new BadRequestException(
          'Recruiter must have a company name before hiring',
        );
      }

      await this.prismaService.user.update({
        where: { id: application.userId },
        data: {
          companyName: recruiter.companyName,
        },
      });
    }

    // notification for the jobseeker
    const message = `${recruiter.fullname} was ${updateDTO.status} you in your job application`;
    await this.notificationService.createNotification(
      { message },
      application.userId,
    );

    // for realtime update
    this.notificationGateway.notifyUser(application.userId, {
      message: 'You have a new notification',
      date: new Date(),
    });

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

  // delete all the cancelled application every 7 days
  @Cron(CronExpression.EVERY_WEEK)
  async deleteCancelledApplicationEvery7days(): Promise<void> {
    // set to 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleted = await this.prismaService.application.deleteMany({
      where: {
        status: JobStatus.Cancelled,
        updatedAt: {
          lte: sevenDaysAgo,
        },
      },
    });

    if (deleted.count > 0) {
      this.logger.log(
        `Permanently deleted ${deleted.count} all cancelled applications after 7 days.`,
      );
    }
  }

  async getAllMyCancelledApplications(userId: number): Promise<Application[]> {
    const cancelledApplications = await this.prismaService.application.findMany(
      {
        where: { userId: userId, status: JobStatus.Cancelled },
      },
    );
    return cancelledApplications;
  }
}

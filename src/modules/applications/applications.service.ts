import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateApplicationDTO } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async applyJob(userId: number, dto: CreateApplicationDTO): Promise<any> {}

  async getMyApplications(userId: number): Promise<any> {
    const applications = await this.prismaService.application.findMany({
      where: { userId },
      include: { job: true },
    });
    return applications;
  }
}

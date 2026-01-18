import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateSkillDTO } from './dto/create-skill.dto';
import { Skill } from 'src/generated/prisma/client';
import { UpdateSkillDTO } from './dto/update-skill.dto';
import { PaginatedResult } from 'src/common/types/paginated-result.type';

@Injectable()
export class SkillsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSkill(dto: CreateSkillDTO, userId: number): Promise<Skill> {
    const { skillName } = dto;
    const mySkillSet = await this.getAllMySkills(userId);
    const alreadyExist = mySkillSet.some(
      (skill: Skill) => skill.skillName === skillName,
    );

    if (alreadyExist)
      throw new BadRequestException(
        `${skillName} was already on your skill set`,
      );

    const skill = await this.prismaService.skill.create({
      data: {
        ...dto,
        userId,
      },
    });
    return skill;
  }

  async getAllMySkills(userId: number): Promise<Skill[]> {
    const skills = await this.prismaService.skill.findMany({
      where: { userId },
    });
    return skills;
  }

  async getSkillbyId(skillId: number, userId: number): Promise<Skill> {
    const skill = await this.prismaService.skill.findFirst({
      where: { id: skillId, userId },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async deleteSkill(skillId: number, userId: number): Promise<void> {
    const skill = await this.prismaService.skill.findFirst({
      where: { id: skillId, userId },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.prismaService.skill.delete({
      where: { id: skill.id },
    });
  }

  async updateSkillName(
    skillId: number,
    userId: number,
    dto: UpdateSkillDTO,
  ): Promise<void> {
    const { skillName } = dto;
    const skill = await this.prismaService.skill.findFirst({
      where: { id: skillId, userId },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.prismaService.skill.update({
      where: { id: skill.id },
      data: {
        skillName,
      },
    });
  }

  async getAllSKillsByAdmin(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Skill>> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50); // Even if the client sends limit=1000, the server will only use 50.
    const skip = (safePage - 1) * safeLimit;

    const [fetchedSkills, total] = await this.prismaService.$transaction([
      this.prismaService.skill.findMany({
        take: safeLimit,
        skip,
      }),
      this.prismaService.skill.count(),
    ]);

    return {
      data: fetchedSkills,
      metaData: {
        limit: safeLimit,
        page: safePage,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getSkillByIDByAdmin(skillId: number): Promise<Skill> {
    const skill = await this.prismaService.skill.findUnique({
      where: { id: skillId },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }
}

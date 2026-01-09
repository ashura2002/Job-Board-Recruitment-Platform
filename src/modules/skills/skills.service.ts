import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateSkillDTO } from './dto/create-skill.dto';
import { Skill } from 'src/generated/prisma/client';

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

  async getSkillbyId(skillId: number): Promise<Skill> {
    const skill = await this.prismaService.skill.findUnique({
      where: { id: skillId },
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
}

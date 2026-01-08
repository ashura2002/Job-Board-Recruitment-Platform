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
    const existingSkill = await this.getOneSkillByName(skillName);
    if (existingSkill)
      throw new BadRequestException(`${skillName} already exists`);

    const skill = await this.prismaService.skill.create({
      data: {
        ...dto,
        userId,
      },
    });
    return skill;
  }

  async getAllSkills(): Promise<Skill[]> {
    const skills = await this.prismaService.skill.findMany();
    return skills;
  }

  private async getOneSkillByName(skillName: string): Promise<Skill | null> {
    const skill = await this.prismaService.skill.findUnique({
      where: { skillName: skillName },
    });
    return skill;
  }

  async getSkillbyId(skillId: number): Promise<Skill> {
    const skill = await this.prismaService.skill.findUnique({
      where: { id: skillId },
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

/*
to do 
user -> profile add skills
test the ownership of deleting skill
create another recruiter to test
user probably and array of skill or none
*/

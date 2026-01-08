import { BadRequestException, Injectable } from '@nestjs/common';
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
}

/*
to do 
user -> profile add skills
*/

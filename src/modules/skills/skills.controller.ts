import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CreateSkillDTO } from './dto/create-skill.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/generated/prisma/enums';
import type { AuthUser } from 'src/common/types/auth-user';
import { Skill } from 'src/generated/prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('skills')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Recruiter, Role.Admin)
  async createSkill(
    @Body() dto: CreateSkillDTO,
    @Req() req: AuthUser,
  ): Promise<Skill> {
    const { userId } = req.user;
    return await this.skillsService.createSkill(dto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllSkills(): Promise<Skill[]> {
    return await this.skillsService.getAllSkills();
  }

  @Get('details/:skillId')
  @HttpCode(HttpStatus.OK)
  async getSkillbyId(
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<Skill> {
    return await this.skillsService.getSkillbyId(skillId);
  }

  @Delete(':skillId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin, Role.Recruiter)
  async deleteSkill(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthUser,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.skillsService.deleteSkill(skillId, userId);
    return { message: `Skill deleted successfully` };
  }
}

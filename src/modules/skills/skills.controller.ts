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
  Put,
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
import { UpdateSkillDTO } from './dto/update-skill.dto';

@Controller('skills')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Jobseeker)
  async createSkill(
    @Body() dto: CreateSkillDTO,
    @Req() req: AuthUser,
  ): Promise<Skill> {
    const { userId } = req.user;
    return await this.skillsService.createSkill(dto, userId);
  }

  // endpoints for get all my skills for job seekers
  @Get('own')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker)
  async getAllMySkills(@Req() req: AuthUser): Promise<Skill[]> {
    const { userId } = req.user;
    return await this.skillsService.getAllMySkills(userId);
  }

  // for jobseeker if user want to get the info of there own skill
  @Get('details/:skillId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker)
  async getSkillbyId(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthUser,
  ): Promise<Skill> {
    const { userId } = req.user;
    return await this.skillsService.getSkillbyId(skillId, userId);
  }

  // admin can see all the skills, can delete but can't edit - need server side pagination
  @Get('admin')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllSKillsByAdmin(): Promise<Skill[]> {
    return await this.skillsService.getAllSKillsByAdmin();
  }

  // admin can get one skill of any jobseekers
  @Get('admin/:skillId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getSkillByIDByAdmin(
    @Param('skillId', ParseIntPipe) skillId: number,
  ): Promise<Skill> {
    return await this.skillsService.getSkillByIDByAdmin(skillId);
  }

  // admin can delete skills too
  @Delete(':skillId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin, Role.Jobseeker)
  async deleteSkill(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthUser,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.skillsService.deleteSkill(skillId, userId);
    return { message: `Skill deleted successfully` };
  }

  // only jobseerker owner of skill can update
  @Put(':skillId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker)
  async updateSkill(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthUser,
    @Body() dto: UpdateSkillDTO,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.skillsService.updateSkillName(skillId, userId, dto);
    return { message: 'Skill Updated Successfully' };
  }
}

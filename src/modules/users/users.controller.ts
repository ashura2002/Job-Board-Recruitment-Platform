import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserWithOutPassword } from './dto/user-response.dto';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { Roles } from 'src/common/decorators/role.decorator';
import type { AuthUser } from 'src/common/types/auth-user';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin/recruiters')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllRecruiters(): Promise<IUserWithOutPassword[]> {
    return await this.usersService.getAllRecruiters();
  }

  @Get('admin/jobseekers')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllJobSeekers(): Promise<IUserWithOutPassword[]> {
    return await this.usersService.getAllJobSeekers();
  }

  @Get('admin/deleted-account')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllDeletedAccount(): Promise<IUserWithOutPassword[]> {
    return this.usersService.getAllDeletedAccount();
  }

  @Get('admin/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getUserById(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.findById(userId);
  }

  @Put('own-details')
  @HttpCode(HttpStatus.OK)
  async updateOwnDetails(
    @Body() updateDTO: UpdateUserDTO,
    @Req() req: AuthUser,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.usersService.updateOwnDetails(updateDTO, userId);
    return {
      message: 'Updated Successfully. Changes will reflect on next login',
    };
  }

  @Delete('admin/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    await this.usersService.deleteUser(userId);
    return { message: 'User Deleted Successfully' };
  }

  @Delete('own')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Jobseeker, Role.Recruiter)
  async deleteOwnAccount(@Req() req: AuthUser): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.usersService.deleteOwnAccount(userId);
    return { message: 'Your account was soft deleted Successfully' };
  }
}

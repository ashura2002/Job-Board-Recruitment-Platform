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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserWithOutPassword } from './dto/user-response.dto';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { Roles } from 'src/common/decorators/role.decorator';
import type { AuthUser } from 'src/common/types/auth-user';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PaginatedResult } from 'src/common/types/paginated-result.type';

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin/recruiters')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiOkResponse({
    description: 'Paginated list of recruiters',
  })
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllRecruiters(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PaginatedResult<IUserWithOutPassword>> {
    return await this.usersService.getAllRecruiters(page, limit);
  }

  @Get('admin/jobseekers')
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
    example: 10,
  })
  @ApiOkResponse({ description: 'Paginated list of jobseekers' })
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllJobSeekers(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PaginatedResult<IUserWithOutPassword>> {
    return await this.usersService.getAllJobSeekers(page, limit);
  }

  @Get('admin/deleted-account')
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
    example: 10,
  })
  @ApiOkResponse({ description: 'Paginated list of soft deleted accounts' })
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getAllDeletedAccount(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PaginatedResult<IUserWithOutPassword>> {
    return this.usersService.getAllDeletedAccount(page, limit);
  }

  @Get('details/:userId')
  @HttpCode(HttpStatus.OK)
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

  @Get('current')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: AuthUser): Promise<IUserWithOutPassword> {
    const { userId } = req.user;
    return await this.usersService.getCurrentUser(userId);
  }
}

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserWithOutPassword } from './dto/user-response.dto';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/generated/prisma/enums';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Recruiter)
  async getAllUser(): Promise<IUserWithOutPassword[]> {
    return await this.usersService.getAllUsers();
  }
}

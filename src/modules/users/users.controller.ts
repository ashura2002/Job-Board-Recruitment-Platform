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

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUser(): Promise<IUserWithOutPassword[]> {
    return await this.usersService.getAllUsers();
  }
}

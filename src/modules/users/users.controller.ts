import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/generated/prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUser(): Promise<Omit<User, 'password'>[]> {
    return await this.usersService.getAllUsers();
  }
}

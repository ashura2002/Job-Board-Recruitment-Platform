import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { User } from 'src/generated/prisma/client';
import { UsersService } from '../users/users.service';
import { hashPassword } from 'src/common/helper/password-hasher';
import { Role } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async registerAsRecruiter(dto: CreateUserDTO) {}

  async registerAsJobSeeker(dto: CreateUserDTO) {}

  private async registerUserWithRole(
    dto: CreateUserDTO,
    role: Role,
  ): Promise<any> {}
}

import { Injectable } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { IUserWithOutPassword } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<IUserWithOutPassword[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullname: true,
        username: true,
        role: true,
        age: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async findUserbyEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user;
  }
}

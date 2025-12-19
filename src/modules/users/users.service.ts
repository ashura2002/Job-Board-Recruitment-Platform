import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { IUserWithOutPassword } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<IUserWithOutPassword[]> {
    const users = await this.prisma.user.findMany({
      select: this.userSelectedFields,
    });
    return users;
  }

  async findById(userId: number): Promise<IUserWithOutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUserbyEmail(email: string): Promise<IUserWithOutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: this.userSelectedFields,
    });
    return user;
  }

  // for login only to compare password in dto to db password
  async findByUserName(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  get userSelectedFields() {
    return {
      id: true,
      email: true,
      fullname: true,
      username: true,
      role: true,
      age: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}

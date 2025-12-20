import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { IUserWithOutPassword } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRecruiters(): Promise<IUserWithOutPassword[]> {
    const users = await this.prisma.user.findMany({
      where: { role: Role.Recruiter, deletedAt: null },
      select: this.userSelectedFields,
    });
    return users;
  }

  async getAllJobSeekers(): Promise<IUserWithOutPassword[]> {
    const users = await this.prisma.user.findMany({
      where: { role: Role.Jobseeker },
      select: this.userSelectedFields,
    });
    return users;
  }

  async findById(userId: number): Promise<IUserWithOutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelectedFields,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Already Deleted, Not Found');
    await this.prisma.user.delete({ where: { id: user.id } });
  }

  // soft delete if user delete own account
  async deleteOwnAccount(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // get all soft-deleted account
  async getAllDeletedAccount(): Promise<IUserWithOutPassword[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: { not: null } },
      select: this.userSelectedFields,
    });
    return users;
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
      deletedAt: true,
    };
  }
}

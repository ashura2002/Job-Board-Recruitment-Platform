import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Role, User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { IUserWithOutPassword } from './dto/user-response.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { hashPassword } from 'src/common/helper/password-hasher';
import { Cron } from '@nestjs/schedule';
import { PaginatedResult } from 'src/common/types/paginated-result.type';

@Injectable()
export class UsersService {
  private logger = new Logger();
  constructor(private readonly prisma: PrismaService) {}

  async getAllRecruiters(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<IUserWithOutPassword>> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;
    const where = { role: Role.Recruiter, deletedAt: null };

    const [fetchedRecruiters, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: where,
        skip,
        take: safeLimit,
        select: this.userSelectedFields,
      }),
      this.prisma.user.count({
        where: where,
      }),
    ]);

    return {
      data: fetchedRecruiters,
      metaData: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getAllJobSeekers(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<IUserWithOutPassword>> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;
    const where = { role: Role.Jobseeker, deletedAt: null };

    const [fetchedJobseekers, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        take: safeLimit,
        skip,
        where: where,
        select: this.userSelectedFields,
      }),
      this.prisma.user.count({ where: where }),
    ]);

    return {
      data: fetchedJobseekers,
      metaData: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findById(userId: number): Promise<IUserWithOutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelectedFields,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateOwnDetails(dto: UpdateUserDTO, userId: number): Promise<void> {
    const { username, password } = dto;
    const user = await this.findById(userId);
    const hash = await hashPassword(password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { username, password: hash },
      select: this.userSelectedFields,
    });
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
  async getAllDeletedAccount(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<IUserWithOutPassword>> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const [softDeletedAccounts, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          deletedAt: {
            not: null,
          },
        },
        take: safeLimit,
        skip,
        select: this.userSelectedFields,
      }),
      this.prisma.user.count({ where: { deletedAt: { not: null } } }),
    ]);

    return {
      data: softDeletedAccounts,
      metaData: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findUserbyEmail(email: string): Promise<IUserWithOutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: this.userSelectedFields,
    });
    return user;
  }

  // background jobs
  @Cron('0 0 * * *')
  async permanentlyDeleteSoftDeletedUsers() {
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.user.deleteMany({
      where: {
        deletedAt: {
          lte: THIRTY_DAYS_AGO,
        },
        isActive: false,
      },
    });
    if (result.count > 0) {
      this.logger.log(
        `Permanently deleted ${result.count} user account(s) that were soft-deleted for over 30 days.`,
      );
    }
  }

  async getCurrentUser(userId: number): Promise<IUserWithOutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullname: true,
        username: true,
        role: true,
        age: true,
        companyName: true,
        deletedAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        skills: {
          select: { skillName: true },
        },
      },
    });
    return {
      ...user,
      skills: user.skills.map((s) => s.skillName), // get the skill name and return it in a new array
    };
  }

  // for login only to compare password in dto to db password
  async findByUserName(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
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
      companyName: true,
    };
  }
}

/*
to do 
user -> skills
user probably and array of skill or none - done
the skill set needed will be listed on job description - done
add a created at and updated at on skill model - done 
block the creation of duplcate skill on every user - done
add update method for skill - done
get all skill by admin - done 
get skill by id for admin - done
query string the job search - done 
test the query string create a new job then query it by searchForJobName method - done

add pagination on get all methods: 
USER - DONE
JOBS - DONE
SKILLS - DONE
user can see there skill on get current user - DONE

get user by id must shown there skills too
if user was hired then the company was not null for that user
implement Oauth2.0
nodemailer for gmail notifications
create unit test for every controller and service
*/

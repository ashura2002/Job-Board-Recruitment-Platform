import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { Prisma, Role } from 'src/generated/prisma/client';
import {
  compareHashPassword,
  hashPassword,
} from 'src/common/helper/password-hasher';
import { IUserWithOutPassword } from '../users/dto/user-response.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import { IJwtResponse } from '../../common/types/jwt.types';
import { hrtime } from 'process';
import { RecoverDTO } from './dto/recover.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerAsRecruiter(dto: CreateUserDTO): Promise<IUserWithOutPassword> {
    return this.registerUserWithRole(dto, Role.Recruiter);
  }

  async registerAsJobSeeker(dto: CreateUserDTO): Promise<IUserWithOutPassword> {
    return this.registerUserWithRole(dto, Role.Jobseeker);
  }

  async registerAsAdmin(dto: CreateUserDTO) {
    return this.registerUserWithRole(dto, Role.Admin);
  }

  async recoverAccount(recoverDTO: RecoverDTO): Promise<void> {
    const { email } = recoverDTO;
    const user = await this.userService.findUserbyEmail(email);
    if (!user)
      throw new BadRequestException(
        `Invalid email account can't be recover this time.`,
      );
    if (!user.deletedAt)
      throw new BadRequestException('This account is not been deleted');
    await this.prismaService.user.update({
      where: { email: email },
      data: { deletedAt: null },
    });
  }

  async login(dto: LoginDTO): Promise<string> {
    const { username, password } = dto;
    const user = await this.userService.findByUserName(username);
    if (!user) throw new NotFoundException('User not found');

    if (user.deletedAt)
      throw new BadRequestException(
        'Account has been deleted, Try to recover.',
      );

    const isPasswordMatch = await compareHashPassword(password, user.password);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    if (!isPasswordMatch) throw new BadRequestException('Invalid Credentials');
    const payload: IJwtResponse = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullname: user.fullname,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async logout(userId: number): Promise<void> {
    const user = await this.userService.findById(userId);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });
  }

  private async registerUserWithRole(
    dto: CreateUserDTO,
    role: Role,
  ): Promise<IUserWithOutPassword> {
    const { email, password } = dto;
    const existingEmail = await this.userService.findUserbyEmail(email);
    if (existingEmail) throw new ConflictException('Email is already in used.');
    const hash = await hashPassword(password);

    // Added try/catch even though there is a pre-check for existing emails
    // This is necessary to handle the scenario where multiple users
    // attempt to register with the same email at the same time (race condition)
    try {
      const user = await this.prismaService.user.create({
        data: {
          ...dto,
          password: hash,
          role,
        },
        select: this.userService.userSelectedFields,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Email already used.');
      }
    }
  }
}

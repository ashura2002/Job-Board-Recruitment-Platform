import {
  BadRequestException,
  ConflictException,
  Injectable,
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
import { IJwtResponse } from './types/jwt.types';

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

  async login(dto: LoginDTO): Promise<string> {
    const { username, password } = dto;
    const user = await this.userService.findByUserName(username);
    const isPasswordMatch = await compareHashPassword(password, user.password);
    if (!isPasswordMatch) throw new BadRequestException('Invalid Credentials');
    const payload: IJwtResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullname: user.fullname,
      username: user.username,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
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
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Email already used.');
      }
    }
  }
}

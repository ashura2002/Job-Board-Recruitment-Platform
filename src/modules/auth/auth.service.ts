import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import {
  compareHashPassword,
  hashPassword,
} from 'src/common/helper/password-hasher';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import { IJwtResponse } from '../../common/types/jwt.types';
import { RecoverDTO } from './dto/recover.dto';
import { CreateRecruiterDTO } from '../users/dto/create-recruiter.dto';
import { gmailVerificationCodeDTO } from './dto/gmail.verification.dto';
import { MailService } from '../mail/mail.service';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async sendCodeInEmailAsRecruiter(dto: CreateRecruiterDTO): Promise<void> {
    await this.sendUsersCodes(dto);
  }

  async sendCodeInEmailAsJobseeker(dto: CreateUserDTO): Promise<void> {
    await this.sendUsersCodes(dto);
  }

  async gmailVerificationCode(dto: gmailVerificationCodeDTO): Promise<any> {
    const { code } = dto;
    const record = await this.prismaService.emailVerification.findFirst({
      where: {
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!record) throw new BadRequestException('Invalid or expired code');

    await this.prismaService.user.create({
      data: {
        email: record.email,
        password: record.password,
        fullname: record.fullname,
        username: record.username,
        age: record.age,
        role: record.role, // FIX THIS BUG: even if the user will register as a recruiter then the role is always been jobseeker
      },
    });
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

  private async sendUsersCodes(dto: CreateUserDTO): Promise<void> {
    const { email, username, password } = dto;
    const existingUsername = await this.userService.findByUserName(username);
    if (existingUsername)
      throw new ConflictException(`${username} is already in used.`);
    const existingEmail = await this.userService.findUserbyEmail(email);
    if (existingEmail) throw new ConflictException('Email is already in used.');

    // generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // remove old code
    await this.prismaService.emailVerification.deleteMany({
      where: { email },
    });

    const hash = await hashPassword(password);

    // save code
    await this.prismaService.emailVerification.create({
      data: { ...dto, expiresAt, code, password: hash },
    });

    // send code to there email
    await this.mailService.sendVerificationCode(email, code);
  }
}

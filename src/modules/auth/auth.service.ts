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
import { gmailVerificationCodeDTO } from './dto/gmail.verification.dto';
import { MailService } from '../mail/mail.service';
import { Role, User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async sendCodeInEmailAsRecruiter(dto: CreateUserDTO): Promise<void> {
    await this.sendUsersCodes(dto, Role.Recruiter);
  }

  async sendCodeInEmailAsJobseeker(dto: CreateUserDTO): Promise<void> {
    await this.sendUsersCodes(dto, Role.Jobseeker);
  }

  async gmailVerificationCode(dto: gmailVerificationCodeDTO): Promise<void> {
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
    const existingEmail = await this.userService.findUserbyEmail(record.email);
    if (existingEmail) throw new BadRequestException('Email is already used');
    const existingUsername = await this.userService.findByUserName(
      record.username,
    );
    if (existingUsername)
      throw new BadRequestException('Username is already exist');

    // create the pending user
    await this.prismaService.user.create({
      data: {
        email: record.email,
        password: record.password,
        fullname: record.fullname,
        username: record.username,
        age: record.age,
        role: record.role,
        companyName: record.companyName,
      },
    });

    // delete code after the successfull of creation of user
    await this.prismaService.emailVerification.delete({
      where: { id: record.id },
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

    // generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // code must send to gmail
    // then verify to the new endpoint if valid then it will recover successfully
  }

  // this service the real recovery of soft deleted user
  // if there code is valid
  async verifyCodeToRecoverAccount(): Promise<any> {}

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

  private async sendUsersCodes(dto: CreateUserDTO, role: Role): Promise<void> {
    const { email, username, password, companyName } = dto;
    const existingEmail = await this.prismaService.emailVerification.findUnique(
      {
        where: { email },
      },
    );
    if (existingEmail) throw new ConflictException('Email is already in used.');
    const existingUsername =
      await this.prismaService.emailVerification.findUnique({
        where: { username },
      });
    if (existingUsername)
      throw new ConflictException(`${username} is already in used.`);

    // generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const hash = await hashPassword(password);

    // save code
    await this.prismaService.emailVerification.create({
      data: { ...dto, expiresAt, code, password: hash, role, companyName },
    });

    // send code to there email
    await this.mailService.sendVerificationCode(email, code);
  }
}

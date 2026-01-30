import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
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
import { Role } from 'src/generated/prisma/client';
import { AccountRecoveryCode } from './dto/account.recover.dto';
import { GoogleResponseType } from 'src/common/types/google.types';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();

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
    const { email, password, fullname, username, age, role, companyName } =
      record;
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
        email: email,
        password: password,
        fullname: fullname,
        username: username,
        age: age,
        role: role,
        companyName: companyName,
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
    await this.mailService.sendVerificationCode(email, code);
    // save to db
    await this.prismaService.accountRecovery.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });
  }

  async verifyCodeToRecoverAccount(dto: AccountRecoveryCode): Promise<void> {
    const { code } = dto;
    const accountToRecover = await this.prismaService.accountRecovery.findFirst(
      {
        where: {
          code,
          expiresAt: {
            gt: new Date(),
          },
        },
      },
    );
    if (!accountToRecover)
      throw new NotFoundException('Invalid Code, Code not found');

    await this.prismaService.user.update({
      where: { email: accountToRecover.email },
      data: { deletedAt: null },
    });

    await this.prismaService.accountRecovery.delete({
      where: { email: accountToRecover.email },
    });
  }

  async login(dto: LoginDTO): Promise<string> {
    const { password } = dto;
    const user = await this.userService.findByUserName(dto.username);
    if (!user) throw new NotFoundException('User not found');

    if (user.deletedAt)
      throw new BadRequestException(
        'Account has been deleted, Try to recover.',
      );
    const { id, email, role, fullname, username } = user;
    const isPasswordMatch = await compareHashPassword(password, user.password);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    if (!isPasswordMatch) throw new BadRequestException('Invalid Credentials');
    const payload: IJwtResponse = {
      userId: id,
      email: email,
      role: role,
      fullname: fullname,
      username: username,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  // FOR OAUTH
  async googleLogin(googleUser: GoogleResponseType) {
    console.log('googleUserShape:', googleUser);
    const user = await this.userService.findUserbyEmail(googleUser.email);
    const { id, username, email, role, fullname } = user;
    if (!user)
      throw new BadRequestException(
        'Your email account is not registered. Contact admin.',
      );
    // if exist create token
    const payload: IJwtResponse = {
      userId: id,
      username: username,
      email: email,
      role: role,
      fullname: fullname,
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

  // BACKGROUND JOBS

  // registering account
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredRegistrationCodes() {
    const now = new Date();

    const result = await this.prismaService.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Deleted ${result.count} expired registration codes`);
    }
  }

  // recovering account
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredRecoveryCode() {
    const now = new Date();

    const expiredRecoveryCode =
      await this.prismaService.accountRecovery.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

    if (expiredRecoveryCode.count > 0) {
      this.logger.log(
        `Deleted ${expiredRecoveryCode.count} expired recovery codes`,
      );
    }
  }
}

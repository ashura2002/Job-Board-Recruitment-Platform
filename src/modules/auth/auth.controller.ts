import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import type { AuthUser } from 'src/common/types/auth-user';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RecoverDTO } from './dto/recover.dto';
import { gmailVerificationCodeDTO } from './dto/gmail.verification.dto';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { AccountRecoveryCode } from './dto/account.recover.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration/recruiter')
  @HttpCode(HttpStatus.CREATED)
  async registerAsRecruiter(
    @Body() dto: CreateUserDTO,
  ): Promise<{ message: string }> {
    await this.authService.sendCodeInEmailAsRecruiter(dto);
    return { message: 'Verification code sent to email' };
  }

  @Post('registration/jobSeeker')
  @HttpCode(HttpStatus.CREATED)
  async registerAsJobSeeker(
    @Body() dto: CreateUserDTO,
  ): Promise<{ message: string }> {
    await this.authService.sendCodeInEmailAsJobseeker(dto);
    return { message: 'Verification code sent to email' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDTO,
  ): Promise<{ message: string; token: string }> {
    const accessToken = await this.authService.login(dto);
    return { message: 'Login Successfully', token: accessToken };
  }

  @Post('gmail-code-verification')
  @HttpCode(HttpStatus.OK)
  async gmailVerificationCode(
    @Body() dto: gmailVerificationCodeDTO,
  ): Promise<{ message: string }> {
    await this.authService.gmailVerificationCode(dto);
    return { message: 'Created Successfully, You can now login your account' };
  }

  @Post('send-code-to-recover')
  @HttpCode(HttpStatus.CREATED)
  async recoverAccount(
    @Body() recoverDTO: RecoverDTO,
  ): Promise<{ message: string }> {
    await this.authService.recoverAccount(recoverDTO);
    return {
      message:
        'Code was sent to your gmail successfully use it recover you account.',
    };
  }

  @Post('verify-gmail-to-recover-account')
  @HttpCode(HttpStatus.OK)
  async verifyCodeToRecoverAccount(
    @Body() dto: AccountRecoveryCode,
  ): Promise<{ message: string }> {
    await this.authService.verifyCodeToRecoverAccount(dto);
    return { message: 'Your account was successfully recover try to login ' };
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthUser): Promise<{ message: string }> {
    const { userId } = req.user;
    await this.authService.logout(userId);
    return { message: 'Logout Successfully' };
  }
}

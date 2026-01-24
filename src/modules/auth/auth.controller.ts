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
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { IUserWithOutPassword } from '../users/dto/user-response.dto';
import { LoginDTO } from './dto/login.dto';
import type { AuthUser } from 'src/common/types/auth-user';
import { JwtGuard } from 'src/common/guards/Jwt.guard';
import { RecoverDTO } from './dto/recover.dto';
import { CreateRecruiterDTO } from '../users/dto/create-recruiter.dto';
import { gmailVerificationCodeDTO } from './dto/gmail.verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration/recruiter')
  @HttpCode(HttpStatus.CREATED)
  async registerAsRecruiter(
    @Body() dto: CreateRecruiterDTO,
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
  ): Promise<any> {
    return 'test';
  }

  @Post('recover')
  @HttpCode(HttpStatus.CREATED)
  async recoverAccount(
    @Body() recoverDTO: RecoverDTO,
  ): Promise<{ message: string }> {
    await this.authService.recoverAccount(recoverDTO);
    return { message: 'Recover Successfully, Try to login Again' };
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

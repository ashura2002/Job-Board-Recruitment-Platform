import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { IUserWithOutPassword } from '../users/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration/recruiter')
  @HttpCode(HttpStatus.CREATED)
  async registerAsRecruiter(
    @Body() dto: CreateUserDTO,
  ): Promise<IUserWithOutPassword> {
    return await this.authService.registerAsRecruiter(dto);
  }

  @Post('registration/jobSeeker')
  @HttpCode(HttpStatus.CREATED)
  async registerAsJobSeeker(
    @Body() dto: CreateUserDTO,
  ): Promise<IUserWithOutPassword> {
    return await this.authService.registerAsJobSeeker(dto);
  }
}

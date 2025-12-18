import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration/recruiter')
  @HttpCode(HttpStatus.OK)
  async registerAsRecruiter(@Body() dto: CreateUserDTO): Promise<any> {}

  @Post('registration/jobSeeker')
  @HttpCode(HttpStatus.OK)
  async registerAsJobSeeker(@Body() dto: CreateUserDTO): Promise<any> {}
}
// add dry principle for registering users
// remove sensitive data on response
// study prisma orm relations

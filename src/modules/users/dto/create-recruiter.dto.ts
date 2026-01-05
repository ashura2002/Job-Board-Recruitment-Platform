import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDTO } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class CreateRecruiterDTO extends CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  companyName: string;
}

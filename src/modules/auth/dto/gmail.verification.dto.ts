import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class gmailVerificationCodeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNotEmpty()
  code: string;
}

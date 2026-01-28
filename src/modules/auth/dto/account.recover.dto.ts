import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AccountRecoveryCode {
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}

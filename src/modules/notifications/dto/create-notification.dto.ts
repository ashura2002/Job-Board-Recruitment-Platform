import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNotificationDTO {
  @ApiProperty()
  @IsNotEmpty()
  message: string;
}

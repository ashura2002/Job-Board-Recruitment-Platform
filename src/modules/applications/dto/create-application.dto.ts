import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateApplicationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  jobId: number;
}

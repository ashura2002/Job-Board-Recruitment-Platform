import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { scheduleType } from 'src/generated/prisma/enums';

export class CreateJobDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  salaryRange: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(scheduleType)
  schedule: scheduleType;
}

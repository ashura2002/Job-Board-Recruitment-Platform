import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobAvailability, scheduleType } from 'src/generated/prisma/enums';

export class UpdateJobs {
  @ApiProperty()
  @IsNotEmpty()
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

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(JobAvailability)
  status: JobAvailability;
}

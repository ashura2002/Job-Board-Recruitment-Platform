import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from 'src/generated/prisma/enums';

export class UpdateApplicationStatusDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(JobStatus)
  status: JobStatus;
}

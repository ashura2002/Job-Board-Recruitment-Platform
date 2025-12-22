import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateApplicationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  jobId: number;

  @IsUrl()
  @ApiPropertyOptional()
  @IsOptional()
  resumeLink: string;
}

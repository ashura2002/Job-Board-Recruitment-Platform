import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSkillDTO {
  @ApiProperty()
  @IsNotEmpty()
  skillName: string;
}

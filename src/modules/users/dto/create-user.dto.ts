import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  age: number;
}

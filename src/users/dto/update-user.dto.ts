import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description:
      'Текущий пароль пользователя, используемый для подтверждения операции обновления. Must be at least 8 characters long.',
    example: '12345678',
    type: String,
    minLength: 8,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description:
      'Новый пароль пользователя, который будет установлен. Must be at least 8 characters long.',
    example: '123456789',
    type: String,
    minLength: 8,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

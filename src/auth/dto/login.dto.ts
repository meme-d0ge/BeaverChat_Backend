import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "The user's username. Maximum length is 20 characters.",
    example: 'MemeDoge',
    maxLength: 20,
    type: String,
  })
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "The user's password. It must be at least 8 characters long.",
    example: '12345678',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

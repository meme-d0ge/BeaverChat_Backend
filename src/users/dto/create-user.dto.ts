import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for authentication',
    example: 'meme-doge',
    maxLength: 20,
  })
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User display name shown in the interface',
    example: 'MemeDoge',
    maxLength: 20,
  })
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: 'User password for authentication',
    example: '12345678',
    minLength: 8,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

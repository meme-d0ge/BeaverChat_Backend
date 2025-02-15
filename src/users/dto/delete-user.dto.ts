import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({
    description:
      'The user password required to delete the account. It must be at least 8 characters long.',
    example: '12345678',
    minLength: 8,
    type: String,
  })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

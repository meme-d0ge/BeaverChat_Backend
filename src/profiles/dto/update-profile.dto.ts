import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User display name',
    example: 'MemeDoge',
    required: false,
    maxLength: 20,
  })
  @MaxLength(20)
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Fullstack developer passionate about coding',
    required: false,
    maxLength: 200,
  })
  @MaxLength(200)
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Flag to indicate if avatar should be deleted',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  deleteAvatar?: boolean;
}

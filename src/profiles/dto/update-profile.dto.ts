import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @MaxLength(20)
  @IsString()
  @IsOptional()
  displayName?: string;

  @MaxLength(200)
  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  deleteAvatar?: boolean;
}

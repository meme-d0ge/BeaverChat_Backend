import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @MaxLength(100)
  @IsString()
  @IsOptional()
  title?: string;

  @MaxLength(3000)
  @IsString()
  @IsOptional()
  content?: string;
}

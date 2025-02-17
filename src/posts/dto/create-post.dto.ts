import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  title: string;

  @MaxLength(3000)
  @IsString()
  @IsNotEmpty()
  content: string;
}

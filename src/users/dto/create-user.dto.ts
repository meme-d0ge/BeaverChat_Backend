import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  username: string;

  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

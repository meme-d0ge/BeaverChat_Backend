import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeleteUserDto {
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

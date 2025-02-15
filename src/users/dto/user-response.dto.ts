import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'MemeDoge',
    description: 'user username',
  })
  @Expose()
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'user mail',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: '2025-02-15T08:29:35.412Z',
    description: 'user creation date',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-02-15T09:01:30.552Z',
    description: 'user update date',
  })
  @Expose()
  updatedAt: Date;
}

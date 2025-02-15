import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 1,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: 'User display name',
    example: 'MemeDoge',
  })
  @Expose()
  displayName: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Fullstack developer passionate about coding',
  })
  @Expose()
  bio: string;

  @ApiProperty({
    description: 'User avatar URL from S3 storage',
    example: 'https://my-bucket.s3.amazonaws.com/avatars/user-123/avatar.jpg',
  })
  @Expose()
  avatar: string;

  @ApiProperty({
    description: 'Flag indicating if the profile is deleted',
    example: false,
  })
  @Expose()
  deleted: boolean;

  @ApiProperty({
    description: 'Profile creation timestamp',
    example: '2024-03-20T12:00:00Z',
  })
  @Expose()
  createdAt: Date;
}

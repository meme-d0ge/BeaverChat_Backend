import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  userId: number;

  @Expose()
  displayName: string;

  @Expose()
  bio: string;

  @Expose()
  avatar: string;

  @Expose()
  avatar_hash: string;

  @Expose()
  deleted: boolean;

  @Expose()
  createdAt: Date;
}

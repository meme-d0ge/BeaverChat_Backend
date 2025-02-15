import { Expose } from 'class-transformer';

export class ProfileOwnerResponseDto {
  @Expose()
  userId: number;

  @Expose()
  displayName: string;

  @Expose()
  bio: string;

  @Expose()
  avatar: string;

  @Expose()
  deleted: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

import { Expose } from 'class-transformer';
import { Link } from '../entity/link.entity';

export class PostResponseDto {
  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  links: Link[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

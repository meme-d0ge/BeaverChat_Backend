import { PostResponseDto } from '../../posts/dto/post-response.dto';
import { Expose } from 'class-transformer';

export class ResponsePostsDto {
  @Expose()
  total: number;

  @Expose()
  limit: number;

  @Expose()
  page: number;

  @Expose()
  posts: PostResponseDto[];
}

import { Expose } from 'class-transformer';

export class LinkResponseDto {
  @Expose()
  key_url: string;
}

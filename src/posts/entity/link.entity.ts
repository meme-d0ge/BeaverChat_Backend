import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key_url: string;

  @ManyToOne(() => Post, (post) => post.links)
  post: Post;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Link } from './link.entity';
import { Profile } from '../../profiles/entity/profile.entity';
import { LinkResponseDto } from '../dto/link-response.dto';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, (profile) => profile.posts)
  profile: Profile;

  @Column()
  title: string;

  @Column()
  content: string;

  @OneToMany(() => Link, (link) => link.post, { cascade: true })
  links: LinkResponseDto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entity/post.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @OneToOne(() => User, (user) => user.profile, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  displayName: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: '' })
  avatar_hash: string;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Post, (post) => post.profile, { cascade: true })
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

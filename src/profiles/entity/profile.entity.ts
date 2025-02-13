import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  displayName: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: '' })
  avatar_hash: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @Column({ default: false })
  deleted: boolean;
}

import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entity/profile.entity';
import { Post } from '../posts/entity/post.entity';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  imports: [TypeOrmModule.forFeature([User, Profile, Post])],
})
export class ProfilesModule {}

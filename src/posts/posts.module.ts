import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Link } from './entity/link.entity';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entity/profile.entity';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [TypeOrmModule.forFeature([Post, Link, User, Profile])],
})
export class PostsModule {}

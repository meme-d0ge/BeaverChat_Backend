import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Session } from '../shared/interfaces/session.interface';
import { plainToInstance } from 'class-transformer';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Profile } from './entity/profile.entity';
import { ProfileOwnerResponseDto } from './dto/profile-owner-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from '../common/s3/s3.service';
import * as crypto from 'node:crypto';
import { RequestWithSession } from '../shared/interfaces/request-with-session.interface';
import { FilesService } from '../common/files/files.service';
import { PaginationDto } from './dto/pagination.dto';
import { Post } from '../posts/entity/post.entity';
import { PostResponseDto } from '../posts/dto/post-response.dto';
import { LinkResponseDto } from '../posts/dto/link-response.dto';
import { ResponsePostsDto } from './dto/response-posts.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private filesService: FilesService,
    private s3Service: S3Service,
  ) {}

  async getProfile(req: RequestWithSession) {
    const session: Session = req['session'];
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');

    return plainToInstance(
      ProfileOwnerResponseDto,
      {
        ...user.profile,
        avatar: user.profile.avatar
          ? this.s3Service.getLinkAvatar(user.profile.avatar)
          : '',
      } as Profile,
      {
        excludeExtraneousValues: true,
      },
    );
  }
  async getProfileByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username: username },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(
      ProfileResponseDto,
      {
        ...user.profile,
        avatar: user.profile.avatar
          ? this.s3Service.getLinkAvatar(user.profile.avatar)
          : '',
      } as Profile,
      {
        excludeExtraneousValues: true,
      },
    );
  }
  async patchProfile(
    req: RequestWithSession,
    updateProfileData: UpdateProfileDto,
    avatar?: Express.Multer.File,
  ) {
    const session: Session = req['session'];
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    let changeCount = 0;
    if (avatar) {
      const hash = crypto.hash('md5', avatar.buffer);
      if (user.profile.avatar_hash !== hash) {
        const dataAvatar = await this.filesService.checkImageAvatar(
          avatar.buffer,
        );
        if (!dataAvatar || !dataAvatar.format) {
          throw new NotFoundException(
            'Avatar must be no more than 3 MB and be in jpeg/jpg/png format.',
          );
        }
        const key = crypto.randomUUID();
        await this.s3Service.uploadAvatar(
          avatar.buffer,
          key,
          dataAvatar.format,
        );
        if (user.profile.avatar) {
          await this.s3Service.removeAvatar(user.profile.avatar);
        }
        user.profile.avatar = key;
        user.profile.avatar_hash = hash;
        changeCount += 1;
      }
    } else if (updateProfileData.deleteAvatar) {
      if (!user.profile.avatar) {
        throw new BadRequestException('Avatar not found');
      }
      const key = user.profile.avatar;
      user.profile.avatar = '';
      user.profile.avatar_hash = '';
      await this.profilesRepository.save(user.profile);
      await this.s3Service.removeAvatar(key);
    }
    if (updateProfileData.bio !== undefined) {
      user.profile.bio = updateProfileData.bio;
      changeCount += 1;
    }
    if (updateProfileData.displayName !== undefined) {
      user.profile.displayName = updateProfileData.displayName;
      changeCount += 1;
    }
    if (changeCount > 0) {
      await this.profilesRepository.save(user.profile);
    }
    return plainToInstance(
      ProfileOwnerResponseDto,
      {
        ...user.profile,
        avatar: user.profile.avatar
          ? this.s3Service.getLinkAvatar(user.profile.avatar)
          : '',
      } as Profile,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getPostsFromProfile(paginationData: PaginationDto, username: string) {
    const post = await this.postsRepository.findAndCount({
      where: {
        profile: {
          user: {
            username: username,
          },
        },
      },
      relations: ['links'],
      order: {
        createdAt: 'DESC',
      },
      skip: (paginationData.page - 1) * paginationData.limit,
      take: paginationData.limit,
    });
    const posts = post[0].map((post) => {
      return plainToInstance(
        PostResponseDto,
        {
          ...post,
          links: post.links.map((link) => {
            return plainToInstance(LinkResponseDto, link, {
              excludeExtraneousValues: true,
            });
          }),
        },
        {
          excludeExtraneousValues: true,
        },
      );
    });
    const total = post[1];
    return plainToInstance(
      ResponsePostsDto,
      {
        total: total,
        limit: paginationData.limit,
        page: paginationData.page,
        posts: posts,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

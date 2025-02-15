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
import * as sharp from 'sharp';
import { S3Service } from '../common/s3/s3.service';
import * as crypto from 'node:crypto';
import { RequestWithSession } from '../shared/interfaces/request-with-session.interface';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
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
        const dataAvatar = await this.checkImage(avatar.buffer);
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
  private async checkImage(image: Buffer<ArrayBuffer>) {
    const meta = await sharp(image).metadata();
    if (
      meta &&
      !(
        meta.format === 'png' ||
        meta.format === 'jpeg' ||
        meta.format === 'jpg'
      )
    ) {
      return false;
    }
    const size = meta.size;
    if (size && size > 3 * 1024 * 1024) return false;
    return meta;
  }
}

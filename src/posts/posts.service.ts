import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithSession } from '../shared/interfaces/request-with-session.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { FilesService } from '../common/files/files.service';
import { S3Service } from '../common/s3/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Repository } from 'typeorm';
import { Link } from './entity/link.entity';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entity/profile.entity';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from './dto/post-response.dto';
import { LinkResponseDto } from './dto/link-response.dto';

@Injectable()
export class PostsService {
  constructor(
    private filesService: FilesService,
    private s3Service: S3Service,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Link) private linksRepository: Repository<Link>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}
  async createPost(
    req: RequestWithSession,
    createPostData: CreatePostDto,
    files: Array<Express.Multer.File>,
  ) {
    const session = req.session;
    if (!session) throw new UnauthorizedException();
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
      relations: ['profile', 'profile.posts'],
    });
    if (!user) throw new NotFoundException('User not found');
    const promises = files.map(async (file: Express.Multer.File) => {
      const checkDataResult = await this.filesService.checkImagePost(
        file.buffer,
      );
      if (!checkDataResult || !checkDataResult.format) {
        throw new BadRequestException(
          'Avatar must be no more than 10 MB and be in jpeg/jpg/png format.',
        );
      }
      let key = crypto.randomUUID();
      while (true) {
        const link = await this.linksRepository.findOne({
          where: {
            key_url: key,
          },
        });
        if (!link) {
          break;
        } else {
          key = crypto.randomUUID();
        }
      }
      const resultUpload = await this.s3Service.uploadImage(
        file.buffer,
        key,
        checkDataResult.format,
      );
      return {
        key: key,
        data: resultUpload,
      };
    });
    const result = await Promise.all(promises);

    const links = result.map((imageData) => {
      return this.linksRepository.create({
        key_url: imageData.key,
      });
    });
    const post = this.postsRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      links: links,
    });
    const profile = this.profileRepository.create({
      ...user.profile,
      posts: [...user.profile.posts, post],
    });
    await this.profileRepository.save(profile);

    return plainToInstance(
      PostResponseDto,
      {
        ...post,
        links: links.map((link) => {
          return plainToInstance(
            LinkResponseDto,
            {
              key_url: this.s3Service.getLinkImage(link.key_url),
            },
            { excludeExtraneousValues: true },
          );
        }),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

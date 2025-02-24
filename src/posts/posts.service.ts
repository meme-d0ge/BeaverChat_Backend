import {
  BadRequestException,
  ForbiddenException,
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
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from './dto/post-response.dto';
import { LinkResponseDto } from './dto/link-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponsePostsDto } from '../profiles/dto/response-posts.dto';

@Injectable()
export class PostsService {
  constructor(
    private filesService: FilesService,
    private s3Service: S3Service,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(Link) private linksRepository: Repository<Link>,
    @InjectRepository(User) private usersRepository: Repository<User>,
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
      await this.s3Service.uploadImage(
        file.buffer,
        key,
        checkDataResult.format,
      );
      return {
        key: key,
      };
    });
    const result = await Promise.all(promises);

    const links = result.map((imageData) => {
      return this.linksRepository.create({
        key_url: imageData.key,
      });
    });
    const post = this.postsRepository.create({
      profile: user.profile,
      title: createPostData.title,
      content: createPostData.content,
      links: links,
    });
    await this.postsRepository.save(post);

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
  async changePost(
    req: RequestWithSession,
    updatePostData: UpdatePostDto,
    files: Array<Express.Multer.File>,
    id: number,
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
    const post = await this.postsRepository.findOne({
      where: {
        id: id,
      },
      relations: ['profile', 'links'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.profile.userId !== session.userId) {
      throw new ForbiddenException(
        'You do not have permission to change this post.',
      );
    }

    if (updatePostData.deleteImage) {
      const postLinksDelete = new Set(updatePostData.deleteImage);
      const postLinks = new Set(
        post.links.map((link) => {
          return link.key_url;
        }),
      );

      updatePostData.deleteImage.filter((link) => {
        if (!postLinks.has(link)) {
          throw new BadRequestException('Image not found');
        }
      });
      post.links = post.links.filter((link) => {
        if (!postLinksDelete.has(link.key_url)) {
          return link;
        }
      });
    }
    if (files.length > 0) {
      if (post.links.length + files.length > 10) {
        throw new BadRequestException('Too many images to upload');
      }
      const checkPromises = files.map(async (file: Express.Multer.File) => {
        const dataImage = await this.filesService.checkImagePost(file.buffer);
        if (!dataImage || !dataImage.format) {
          throw new NotFoundException(
            'Avatar must be no more than 10 MB and be in jpeg/jpg/png format.',
          );
        }
        return {
          file: file.buffer,
          type: dataImage.format,
        };
      });
      const dataFiles = await Promise.all(checkPromises);

      const uploadPromises = dataFiles.map(async ({ file, type }) => {
        const key = crypto.randomUUID();
        await this.s3Service.uploadImage(file, key, type);
        return this.linksRepository.create({ key_url: key, post: post });
      });
      post.links = [...post.links, ...(await Promise.all(uploadPromises))];
    }

    if (updatePostData.title) {
      post.title = updatePostData.title;
    }
    if (updatePostData.content) {
      post.content = updatePostData.content;
    }

    if (updatePostData.deleteImage) {
      const deletePromises = updatePostData.deleteImage.map(async (image) => {
        const link = await this.linksRepository.findOne({
          where: {
            key_url: image,
          },
        });
        if (link) {
          await this.linksRepository.remove(link);
        }
        return this.s3Service.removeImage(image);
      });
      Promise.all(deletePromises);
    }
    const newPost = await this.postsRepository.save(post);
    return plainToInstance(
      PostResponseDto,
      {
        ...newPost,
        links: plainToInstance(LinkResponseDto, newPost.links, {
          excludeExtraneousValues: true,
        }),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
  async deletePost(req: RequestWithSession, id: number) {
    const session = req.session;
    if (!session) throw new UnauthorizedException();
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
      relations: ['profile', 'profile.posts'],
    });
    if (!user) throw new NotFoundException('User not found');
    const post = await this.postsRepository.findOne({
      where: {
        id: id,
      },
      relations: ['profile', 'links'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.profile.userId !== session.userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this post.',
      );
    }

    const promises = post.links.map(async (link) => {
      await this.s3Service.removeImage(link.key_url);
      await this.linksRepository.delete(link);
    });
    await Promise.all(promises);
    await this.postsRepository.remove(post);
    return { success: true };
  }

  async getPostsFromProfile(limit: number, page: number, username: string) {
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
      skip: (page - 1) * limit,
      take: limit,
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
        limit: limit,
        page: page,
        posts: posts,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

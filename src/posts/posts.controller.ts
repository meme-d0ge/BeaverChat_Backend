import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RequestWithSession } from '../shared/interfaces/request-with-session.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  private logger = new Logger(PostsController.name);
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createPost(
    @Req() req: RequestWithSession,
    @Body() createPostData: CreatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    this.logger.log('POST /api/posts');
    return this.postsService.createPost(req, createPostData, files);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updatePost(
    @Req() req: RequestWithSession,
    @Param('id') id: number,
    @Body() updatePostData: UpdatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    this.logger.log(`PATCH /api/posts/${id}`);
    return await this.postsService.changePost(req, updatePostData, files, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deletePost(@Req() req: RequestWithSession, @Param('id') id: number) {
    this.logger.log(`POST /api/posts/${id}`);
    return this.postsService.deletePost(req, id);
  }

  @Get(':username')
  async getPostsFromProfileByUsername(
    @Param('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.postsService.getPostsFromProfile(limit, page, username);
  }
}

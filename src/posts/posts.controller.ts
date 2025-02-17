import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Patch,
  Post,
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
  async updatePost(
    @Req() req: RequestWithSession,
    @Param('id') id: number,
    @Body() updatePostData: UpdatePostDto,
  ) {
    this.logger.log(`PATCH /api/posts/${id}`);
    return await this.postsService.changePost(req, updatePostData, id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deletePost(@Req() req: RequestWithSession, @Param('id') id: number) {
    this.logger.log(`POST /api/posts/${id}`);
    return this.postsService.deletePost(req, id);
  }
}

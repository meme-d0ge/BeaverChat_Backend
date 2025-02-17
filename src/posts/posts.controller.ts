import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
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
  @Delete(':id')
  deletePost(@Req() req: RequestWithSession, @Param('id') id: string) {
    this.logger.log(`POST /api/posts?id=${id}`);
    return this.postsService.deletePost(req, Number(id));
  }
}

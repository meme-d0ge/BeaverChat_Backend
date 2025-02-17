import {
  Body,
  Controller,
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

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createPost(
    @Req() req: RequestWithSession,
    @Body() createPostData: CreatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.postsService.createPost(req, createPostData, files);
  }
}

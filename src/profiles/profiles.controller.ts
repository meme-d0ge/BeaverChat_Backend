import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestWithSession } from '../shared/interfaces/request-with-session.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ProfileOwnerResponseDto } from './dto/profile-owner-response.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}
  private logger = new Logger(ProfilesController.name);

  @UseGuards(AuthGuard)
  @Get()
  @ApiSecurity('cookieAuth')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get logged in user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
    type: ProfileOwnerResponseDto,
  })
  async getProfile(@Req() req: RequestWithSession) {
    this.logger.log('GET /api/profiles');
    return await this.profilesService.getProfile(req);
  }

  @Get(':username')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get profile by username' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
    type: ProfileResponseDto,
  })
  async getProfileByUsername(@Param('username') username: string) {
    this.logger.log('GET /api/profiles/' + username);
    return await this.profilesService.getProfileByUsername(username);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Patch()
  @ApiSecurity('cookieAuth')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update logged in user profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile updated successfully.',
    type: ProfileOwnerResponseDto,
  })
  @ApiBody({
    description: 'Upload an image file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
        displayName: {
          type: 'string',
          format: 'string',
          example: 'Meme_Doge_display_name',
        },
        bio: {
          type: 'string',
          format: 'string',
          example: 'Fullstack developer passionate about coding',
        },
        deleteAvatar: {
          type: 'boolean',
          format: 'boolean',
          example: false,
        },
      },
      required: [],
    },
  })
  async updateProfile(
    @Req() req: RequestWithSession,
    @Body() updateProfileData: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    this.logger.log('PATCH /api/profiles');
    return await this.profilesService.patchProfile(
      req,
      updateProfileData,
      avatar,
    );
  }

  @Get('/posts/:username')
  async getPostsFromProfile(
    @Param('username') username: string,
    @Body() paginationData: PaginationDto,
  ) {
    return await this.profilesService.getPostsFromProfile(
      paginationData,
      username,
    );
  }
}

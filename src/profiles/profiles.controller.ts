import {
  Body,
  Controller,
  Get,
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

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}
  private logger = new Logger(ProfilesController.name);

  @UseGuards(AuthGuard)
  @Get()
  async getProfile(@Req() req: RequestWithSession) {
    this.logger.log('GET /api/profiles');
    return await this.profilesService.getProfile(req);
  }

  @Get(':username')
  async getProfileByUsername(@Param('username') username: string) {
    this.logger.log('GET /api/profiles/' + username);
    return await this.profilesService.getProfileByUsername(username);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Patch()
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
}

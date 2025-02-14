import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}
  private logger = new Logger(ProfilesController.name);
  @UseGuards(AuthGuard)
  @Get()
  async getProfile(@Req() req: Request) {
    this.logger.log('GET /api/profiles');
    return await this.profilesService.getProfile(req);
  }
}

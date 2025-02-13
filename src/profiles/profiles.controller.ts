import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getProfile(@Req() req: Request) {
    return await this.profilesService.getProfile(req);
  }
}

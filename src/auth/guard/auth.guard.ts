import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookie = request.cookies;
    if (cookie['sessionId']) {
      const sessionId: string = cookie['sessionId'];
      const session = await this.redisService.getSessionValue(sessionId);
      if (!session) {
        return false;
      }
      request['session'] = {
        ...session,
        value: sessionId,
      };
      return true;
    }
    return false;
  }
}

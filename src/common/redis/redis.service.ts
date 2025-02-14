import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Session } from '../../shared/interfaces/session.interface';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async removeAllSessions(userId: number) {
    const sessions = await this.getSessionsFromList(userId);
    for (const session of sessions) {
      await this.redisClient.del(`ses:${session}`);
    }
    await this.redisClient.del(`userId:${userId}`);
    return true;
  }

  async setSession(userId: number, session: string, sessionValue: Session) {
    await this.setSessionValue(session, sessionValue);
    await this.setSessionToList(userId, session);
  }
  async deleteSession(userId: number, session: string) {
    await this.deleteSessionValue(session);
    await this.deleteSessionFromList(userId, session);
  }

  async setSessionValue(session: string, sessionValue: Session): Promise<'OK'> {
    return this.redisClient.set(`ses:${session}`, JSON.stringify(sessionValue));
  }
  async getSessionValue(session: string): Promise<Session | null> {
    const result = await this.redisClient.get(`ses:${session}`);
    if (result === null) {
      return null;
    } else {
      return JSON.parse(result) as Session;
    }
  }
  async deleteSessionValue(session: string) {
    return this.redisClient.del(`ses:${session}`);
  }

  async setSessionToList(userId: number, session: string) {
    return this.redisClient.lpush(`userId:${userId}`, session);
  }
  async getSessionsFromList(userId: number) {
    return this.redisClient.lrange(`userId:${userId}`, 0, -1);
  }
  async deleteSessionFromList(userId: number, session: string) {
    return this.redisClient.lrem(`userId:${userId}`, 1, session);
  }
}

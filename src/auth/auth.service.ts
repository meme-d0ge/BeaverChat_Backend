import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { RedisService } from '../common/redis/redis.service';
import { Session } from '../shared/interfaces/session.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private redisService: RedisService,
  ) {}
  async login(loginData: LoginDto, res: Response) {
    const user = await this.usersRepository.findOne({
      where: {
        username: loginData.username,
      },
    });
    if (!user || !(await argon.verify(user.password, loginData.password))) {
      throw new UnauthorizedException('User or Password invalid');
    }

    const session = crypto.randomUUID();
    await this.redisService.setSession(user.id, session, {
      userId: user.id,
      createdAt: new Date(),
      main: false,
    } as Session);
    res.cookie('sessionId', session, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      path: '/',
    });
    res.json({ success: true, message: 'Login successfully' });
    return { success: true };
  }
}

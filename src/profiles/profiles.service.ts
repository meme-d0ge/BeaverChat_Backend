import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Session } from '../shared/interfaces/session.interface';
@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async getProfile(req: Request) {
    const session: Session = req['session'];
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');

    return user.profile;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon from 'argon2';
import { Profile } from '../profiles/entity/profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { Session } from '../shared/interfaces/session.interface';
import { RedisService } from '../common/redis/redis.service';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
    private redisService: RedisService,
  ) {}
  async create(createUserData: CreateUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        username: createUserData.username,
      },
    });
    if (user) throw new BadRequestException('User already exists');
    const newProfile = this.profilesRepository.create({
      displayName: createUserData.displayName,
    });
    const newUser = this.usersRepository.create({
      username: createUserData.username,
      password: await argon.hash(createUserData.password),
      profile: newProfile,
    });
    await this.usersRepository.save(newUser);
    return { success: true };
  }

  async changeUser(updateUserData: UpdateUserDto, req: Request) {
    const session: Session = req['session'];
    if (updateUserData.password === updateUserData.newPassword) {
      throw new BadRequestException('Password must be different');
    }
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
    });
    if (!user) throw new BadRequestException('User not found');
    if (!(await argon.verify(user.password, updateUserData.password))) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.usersRepository.save({
      ...user,
      password: await argon.hash(updateUserData.newPassword),
    });
    await this.redisService.removeAllSessions(user?.id);
    return { success: true };
  }

  async deleteUser(deleteUserData: DeleteUserDto, req: Request) {
    const session: Session = req['session'];
    const user = await this.usersRepository.findOne({
      where: {
        id: session.userId,
      },
      relations: ['profile'],
    });
    if (!user) throw new BadRequestException('User not found');
    if (!(await argon.verify(user.password, deleteUserData.password))) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.profilesRepository.save({
      ...user.profile,
      displayName: 'Deleted User',
      bio: '',
      avatar: '',
      avatar_hash: '',
      deleted: true,
    });
    await this.redisService.removeAllSessions(user.id);
    await this.usersRepository.remove(user);
    return { success: true };
  }
}

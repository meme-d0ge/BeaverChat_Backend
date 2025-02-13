import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private logger = new Logger(UsersService.name);
  @Post()
  async registry(@Body() createUserDto: CreateUserDto) {
    this.logger.log('POST request /api/users');
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch()
  changeUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    this.logger.log('PATCH request /api/users');
    return this.usersService.changeUser(updateUserDto, req);
  }

  @UseGuards(AuthGuard)
  @Delete()
  deleteUser(@Body() deleteUserDto: DeleteUserDto, @Req() req: Request) {
    this.logger.log('DELETE request /api/users');
    return this.usersService.deleteUser(deleteUserDto, req);
  }
}

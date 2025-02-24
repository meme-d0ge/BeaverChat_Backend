import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  UseGuards,
  Req,
  Get,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RequestWithSession } from '../shared/interfaces/request-with-session.interface';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private logger = new Logger(UsersService.name);

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Register a new user',
    schema: {
      example: { success: true },
    },
  })
  async registry(@Body() createUserDto: CreateUserDto) {
    this.logger.log('POST request /api/users');
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiSecurity('cookieAuth')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({
    status: 200,
    description: 'Got your profile successfully',
    type: UserResponseDto,
  })
  async getUser(@Req() req: RequestWithSession) {
    this.logger.log('GET request /api/users');
    return await this.usersService.getUser(req);
  }

  @UseGuards(AuthGuard)
  @Patch()
  @ApiSecurity('cookieAuth')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user details' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    schema: {
      example: { success: true },
    },
  })
  changeUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithSession,
  ) {
    this.logger.log('PATCH request /api/users');
    return this.usersService.changeUser(updateUserDto, req);
  }

  @UseGuards(AuthGuard)
  @Delete()
  @ApiSecurity('cookieAuth')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiBody({ type: DeleteUserDto })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
    schema: {
      example: { success: true },
    },
  })
  deleteUser(
    @Body() deleteUserDto: DeleteUserDto,
    @Req() req: RequestWithSession,
  ) {
    this.logger.log('DELETE request /api/users');
    return this.usersService.deleteUser(deleteUserDto, req);
  }
}

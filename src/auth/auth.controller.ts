import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from './guard/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Endpoint for user login. Processes the login credentials and returns a session in cookie.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    schema: {
      example: {
        success: true,
        message: 'Login successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication failed due to invalid credentials.',
    example: {
      message: 'User or Password invalid',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  async login(@Body() loginData: LoginDto, @Res() response: Response) {
    return await this.authService.login(loginData, response);
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(@Res() res: Response, @Req() req: Request) {
    return this.authService.logout(res, req);
  }
}

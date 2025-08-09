import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: CreateUserDto) {
    return await this.authService.register(userData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginData: LoginDto) {
    return await this.authService.login(loginData);
  }
} 
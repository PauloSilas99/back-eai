import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() userData: CreateUserDto) {
    const user = await this.usersService.createUser(userData);
    return { user };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { users };
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.getUserByEmail(email);
    return { user };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return { user };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, userData);
    return { user };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);
    return { message: 'Usuário deletado com sucesso', result };
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param('id') id: string) {
    const stats = await this.usersService.getUserStats(id);
    return { stats };
  }

  @Post(':id/upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeToPremium(@Param('id') id: string) {
    const user = await this.usersService.upgradeToPremium(id);
    return { 
      message: 'Upgrade para premium realizado com sucesso', 
      user 
    };
  }

  @Get(':id/limits')
  @UseGuards(JwtAuthGuard)
  async checkUserLimits(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    return {
      planType: user.plan_type,
      requestsUsed: user.requests_used,
      maxRequests: user.max_requests,
      remainingRequests: user.max_requests - user.requests_used,
      canMakeRequests: user.plan_type === 'premium' || user.requests_used < user.max_requests
    };
  }
} 
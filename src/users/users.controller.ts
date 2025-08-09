import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: CreateUserDto) {
    const user = await this.usersService.createUser(userData);
    return { user };
  }

  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { users };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return { user };
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.getUserByEmail(email);
    return { user };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, userData);
    return { user };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);
    return { message: 'Usuário deletado com sucesso', result };
  }

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    const stats = await this.usersService.getUserStats(id);
    return { stats };
  }
} 
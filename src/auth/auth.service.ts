import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userData: CreateUserDto) {
    // Verificar se o email já existe
    const existingUser = await this.usersService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Criar usuário com senha hash
    const user = await this.usersService.createUser({
      ...userData,
      password: passwordHash,
    });

    // Gerar token JWT
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        planType: user.plan_type,
        requestsUsed: user.requests_used,
        maxRequests: user.max_requests,
      },
      token,
    };
  }

  async login(loginData: LoginDto) {
    // Buscar usuário por email
    const user = await this.usersService.getUserByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se o usuário tem senha (usuários antigos podem não ter)
    if (!user.password_hash) {
      throw new UnauthorizedException('Conta criada antes da implementação de senhas. Por favor, redefina sua senha.');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        planType: user.plan_type,
        requestsUsed: user.requests_used,
        maxRequests: user.max_requests,
      },
      token,
    };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      planType: user.plan_type,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '7d',
    });
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
} 
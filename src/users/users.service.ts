import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(userData: CreateUserDto): Promise<any> {
    const user = {
      email: userData.email,
      name: userData.name,
      password_hash: userData.password, // Já vem hash do AuthService
      plan_type: userData.planType || 'free',
      requests_used: 0,
    };

    return await this.supabaseService.insert('users', user);
  }

  async getUserById(userId: string): Promise<any> {
    const users = await this.supabaseService.select('users', { id: userId });
    return users[0] || null;
  }

  async getUserByEmail(email: string): Promise<any> {
    const users = await this.supabaseService.select('users', { email });
    return users[0] || null;
  }

  async updateUser(userId: string, userData: UpdateUserDto): Promise<any> {
    const updateData: any = { ...userData };
    
    // Se uma nova senha foi fornecida, fazer hash
    if (userData.password) {
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(userData.password, saltRounds);
      delete updateData.password;
    }
    
    return await this.supabaseService.update('users', updateData, { id: userId });
  }

  async deleteUser(userId: string): Promise<any> {
    return await this.supabaseService.delete('users', { id: userId });
  }

  async getAllUsers(): Promise<any> {
    return await this.supabaseService.select('users');
  }

  async getUserStats(userId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Buscar estatísticas do usuário
    const [chats, quizzes, mindmaps, evaluations] = await Promise.all([
      supabase.from('chats').select('*').eq('user_id', userId),
      supabase.from('quizzes').select('*').eq('user_id', userId),
      supabase.from('mindmaps').select('*').eq('user_id', userId),
      supabase.from('question_evaluations').select('*').eq('user_id', userId),
    ]);

    return {
      totalChats: chats.data?.length || 0,
      totalQuizzes: quizzes.data?.length || 0,
      totalMindmaps: mindmaps.data?.length || 0,
      totalEvaluations: evaluations.data?.length || 0,
      recentActivity: {
        chats: chats.data?.slice(-5) || [],
        quizzes: quizzes.data?.slice(-5) || [],
        mindmaps: mindmaps.data?.slice(-5) || [],
        evaluations: evaluations.data?.slice(-5) || [],
      },
    };
  }

  async checkRequestLimit(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    // Usuários premium têm requisições ilimitadas
    if (user.plan_type === 'premium') {
      return true;
    }

    // Verificar se o usuário free ainda tem requisições disponíveis
    if (user.requests_used >= user.max_requests) {
      throw new ForbiddenException('Limite de requisições atingido. Faça upgrade para o plano premium.');
    }

    return true;
  }

  async incrementRequestCount(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    // Só incrementar para usuários free
    if (user.plan_type === 'free') {
      await this.supabaseService.update(
        'users',
        { requests_used: user.requests_used + 1 },
        { id: userId }
      );
    }
  }

  async upgradeToPremium(userId: string): Promise<any> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    return await this.supabaseService.update(
      'users',
      { 
        plan_type: 'premium',
        max_requests: 999999,
        subscription_status: 'active'
      },
      { id: userId }
    );
  }
} 
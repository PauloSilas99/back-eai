import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateUserDto {
  email: string;
  name: string;
  planType?: 'free' | 'premium';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(userData: CreateUserDto): Promise<any> {
    const user = {
      email: userData.email,
      name: userData.name,
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
    return await this.supabaseService.update('users', userData, { id: userId });
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
} 
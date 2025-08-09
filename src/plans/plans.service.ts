import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface PlanLimits {
  maxRequests: number;
  features: string[];
}

@Injectable()
export class PlansService {
  private readonly planLimits: Record<string, PlanLimits> = {
    free: {
      maxRequests: 5,
      features: ['chat', 'quiz', 'question_evaluation', 'mindmap']
    },
    premium: {
      maxRequests: -1, // -1 significa ilimitado
      features: ['chat', 'quiz', 'question_evaluation', 'mindmap', 'priority_support']
    }
  };

  constructor(private readonly supabaseService: SupabaseService) {}

  async checkUserPlan(userId: string): Promise<any> {
    const users = await this.supabaseService.select('users', { id: userId });
    const user = users[0];
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      planType: user.plan_type,
      requestsUsed: user.requests_used,
      maxRequests: this.planLimits[user.plan_type].maxRequests,
      features: this.planLimits[user.plan_type].features,
      subscriptionStatus: user.subscription_status,
      subscriptionEndDate: user.subscription_end_date,
      canMakeRequest: this.checkCanMakeRequest(user.plan_type, user.requests_used)
    };
  }

  async canMakeRequest(userId: string): Promise<boolean> {
    const userPlan = await this.checkUserPlan(userId);
    return userPlan.canMakeRequest;
  }

  private checkCanMakeRequest(planType: string, requestsUsed: number): boolean {
    const maxRequests = this.planLimits[planType].maxRequests;
    
    // Se maxRequests é -1, significa ilimitado
    if (maxRequests === -1) {
      return true;
    }
    
    return requestsUsed < maxRequests;
  }

  async incrementRequestCount(userId: string): Promise<void> {
    const user = await this.checkUserPlan(userId);
    
    // Se o usuário não pode fazer requisição, não incrementa
    if (!user.canMakeRequest) {
      throw new Error('Limite de requisições atingido. Faça upgrade para o plano premium.');
    }

    // Para usuários premium, não incrementa o contador
    if (user.planType === 'premium') {
      return;
    }

    // Incrementa o contador para usuários gratuitos
    await this.supabaseService.update('users', 
      { requests_used: user.requestsUsed + 1 }, 
      { id: userId }
    );
  }

  async upgradeToPremium(userId: string, stripeCustomerId?: string): Promise<any> {
    const updateData: any = {
      plan_type: 'premium',
      subscription_status: 'active',
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
    };

    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId;
    }

    const result = await this.supabaseService.update('users', updateData, { id: userId });
    return result[0];
  }

  async downgradeToFree(userId: string): Promise<any> {
    const updateData = {
      plan_type: 'free',
      subscription_status: 'inactive',
      subscription_end_date: null,
      stripe_customer_id: null
    };

    const result = await this.supabaseService.update('users', updateData, { id: userId });
    return result[0];
  }

  async resetRequestCount(userId: string): Promise<any> {
    const result = await this.supabaseService.update('users', 
      { requests_used: 0 }, 
      { id: userId }
    );
    return result[0];
  }

  async getPlanLimits(planType: string): Promise<PlanLimits> {
    return this.planLimits[planType];
  }

  async getAllPlans(): Promise<Record<string, PlanLimits>> {
    return this.planLimits;
  }

  async checkSubscriptionStatus(userId: string): Promise<any> {
    const user = await this.checkUserPlan(userId);
    
    if (user.planType === 'premium' && user.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEndDate);
      
      if (now > endDate) {
        // Assinatura expirada, fazer downgrade
        await this.downgradeToFree(userId);
        return {
          ...user,
          planType: 'free',
          subscriptionStatus: 'expired',
          canMakeRequest: this.checkCanMakeRequest('free', user.requestsUsed)
        };
      }
    }
    
    return user;
  }
} 
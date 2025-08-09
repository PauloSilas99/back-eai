import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async getAllPlans() {
    const plans = await this.plansService.getAllPlans();
    return { plans };
  }

  @Get('free')
  async getFreePlan() {
    const plan = await this.plansService.getPlanLimits('free');
    return { plan };
  }

  @Get('premium')
  async getPremiumPlan() {
    const plan = await this.plansService.getPlanLimits('premium');
    return { plan };
  }

  @Get('user/:userId')
  async getUserPlan(@Param('userId') userId: string) {
    const userPlan = await this.plansService.checkUserPlan(userId);
    return { userPlan };
  }

  @Get('user/:userId/status')
  async checkSubscriptionStatus(@Param('userId') userId: string) {
    const status = await this.plansService.checkSubscriptionStatus(userId);
    return { status };
  }

  @Post('user/:userId/upgrade')
  async upgradeToPremium(
    @Param('userId') userId: string,
    @Body() body: { stripeCustomerId?: string }
  ) {
    const result = await this.plansService.upgradeToPremium(userId, body.stripeCustomerId);
    return { 
      message: 'Upgrade realizado com sucesso!',
      user: result 
    };
  }

  @Post('user/:userId/downgrade')
  async downgradeToFree(@Param('userId') userId: string) {
    const result = await this.plansService.downgradeToFree(userId);
    return { 
      message: 'Downgrade realizado com sucesso!',
      user: result 
    };
  }

  @Post('user/:userId/reset-requests')
  async resetRequestCount(@Param('userId') userId: string) {
    const result = await this.plansService.resetRequestCount(userId);
    return { 
      message: 'Contador de requisições resetado!',
      user: result 
    };
  }

  @Get('user/:userId/can-request')
  async canMakeRequest(@Param('userId') userId: string) {
    const canRequest = await this.plansService.canMakeRequest(userId);
    return { canMakeRequest: canRequest };
  }
} 
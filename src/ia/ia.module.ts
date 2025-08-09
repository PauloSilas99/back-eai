import { Module } from '@nestjs/common';
import { ChatController } from './ia.controller';
import { IaService } from './ia.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [SupabaseModule, UsersModule, PlansModule],
  controllers: [ChatController],
  providers: [IaService],
})
export class IaModule {}

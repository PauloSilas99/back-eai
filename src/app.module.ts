import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IaModule } from './ia/ia.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [IaModule, SupabaseModule, UsersModule, PlansModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

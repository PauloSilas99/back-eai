import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [IaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

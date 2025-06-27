import { Module } from '@nestjs/common';
import { ChatController } from './ia.controller';
import { IaService } from './ia.service';

@Module({
  controllers: [ChatController],
  providers: [IaService],
})
export class IaModule {}

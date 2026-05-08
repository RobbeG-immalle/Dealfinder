import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'scraping-queue' })],
  providers: [DealsService],
  controllers: [DealsController],
  exports: [DealsService],
})
export class DealsModule {}

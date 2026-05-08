import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapingProcessor } from './scraping.processor';
import { AnalysisProcessor } from './analysis.processor';
import { ScrapersModule } from '../scrapers/scrapers.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'scraping-queue' },
      { name: 'analysis-queue' },
    ),
    ScrapersModule,
  ],
  providers: [ScrapingProcessor, AnalysisProcessor],
  exports: [BullModule],
})
export class QueueModule {}

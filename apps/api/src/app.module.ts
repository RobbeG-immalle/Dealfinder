import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { DealsModule } from './deals/deals.module';
import { ListingsModule } from './listings/listings.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    PrismaModule,
    QueueModule,
    ScrapersModule,
    DealsModule,
    ListingsModule,
  ],
})
export class AppModule {}

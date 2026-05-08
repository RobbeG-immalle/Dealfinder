import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import type { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScrapersService } from '../scrapers/scrapers.service';
import type { ScrapeJobPayload, AnalysisJobPayload } from '@dealfinder/shared';
import { JobStatus } from '@dealfinder/shared';

@Processor('scraping-queue')
export class ScrapingProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scrapersService: ScrapersService,
    @InjectQueue('analysis-queue') private readonly analysisQueue: Queue<AnalysisJobPayload>,
  ) {
    super();
  }

  async process(job: Job<ScrapeJobPayload>): Promise<void> {
    const { jobId, marketplace, searchParams } = job.data;
    this.logger.log(`Processing scrape job ${jobId} for ${marketplace}`);

    try {
      await this.prisma.scrapeJob.update({
        where: { id: jobId },
        data: { status: JobStatus.RUNNING },
      });

      const listings = await this.scrapersService.scrape(marketplace, searchParams);

      for (const listing of listings) {
        await this.prisma.listing.upsert({
          where: { url: listing.url },
          update: {
            title: listing.title,
            description: listing.description,
            images: listing.images,
            askingPrice: listing.askingPrice,
            currency: listing.currency,
            seller: listing.seller,
            location: listing.location,
            postedAt: new Date(listing.postedAt),
            category: listing.category,
            condition: listing.condition,
            rawData: listing.rawData ?? undefined,
          },
          create: {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            images: listing.images,
            askingPrice: listing.askingPrice,
            currency: listing.currency,
            seller: listing.seller,
            location: listing.location,
            postedAt: new Date(listing.postedAt),
            url: listing.url,
            marketplace: listing.marketplace,
            category: listing.category,
            condition: listing.condition,
            rawData: listing.rawData ?? undefined,
          },
        });

        await this.analysisQueue.add('analyze', {
          listingId: listing.id,
          imageUrls: listing.images,
          listingTitle: listing.title,
          listingDescription: listing.description,
          askingPrice: listing.askingPrice,
          currency: listing.currency,
          category: listing.category,
          condition: listing.condition,
          marketplace: listing.marketplace,
        });
      }

      await this.prisma.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Scrape job ${jobId} completed. Scraped ${listings.length} listings.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Scrape job ${jobId} failed: ${message}`);

      await this.prisma.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          completedAt: new Date(),
          error: message,
        },
      });
    }
  }
}

import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  ParseFloatPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DealsService } from './deals.service';
import { PrismaService } from '../prisma/prisma.service';
import { StartScrapeDto } from './dto/create-deal.dto';
import { JobStatus } from '@dealfinder/shared';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class DealsController {
  constructor(
    private readonly dealsService: DealsService,
    private readonly prisma: PrismaService,
    @InjectQueue('scraping-queue') private readonly scrapingQueue: Queue,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('deals')
  async findAll(
    @Query('marketplace') marketplace?: string,
    @Query('minROI', new ParseFloatPipe({ optional: true })) minROI?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true })) maxPrice?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.dealsService.findAll({ marketplace, minROI, maxPrice, page, limit });
  }

  @Get('deals/stats')
  async getStats() {
    return this.dealsService.getStats();
  }

  @Get('deals/:id')
  async findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Post('scrape/start')
  async startScrape(@Body() dto: StartScrapeDto) {
    const jobId = uuidv4();

    await this.prisma.scrapeJob.create({
      data: {
        id: jobId,
        status: JobStatus.PENDING,
        marketplace: dto.marketplace,
        query: dto.query,
        category: dto.category,
      },
    });

    await this.scrapingQueue.add('scrape', {
      jobId,
      marketplace: dto.marketplace,
      searchParams: {
        query: dto.query,
        category: dto.category,
        maxPages: 5,
      },
    });

    return { jobId, status: JobStatus.PENDING };
  }

  @Get('scrape/jobs')
  async getScrapeJobs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const take = limit ?? 20;
    const skip = ((page ?? 1) - 1) * take;

    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.scrapeJob.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.scrapeJob.count(),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page: page ?? 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}

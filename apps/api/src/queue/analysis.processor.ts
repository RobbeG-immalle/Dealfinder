import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ImageAnalyzer } from '@dealfinder/ai-engine';
import { MarketValueEstimator } from '@dealfinder/ai-engine';
import { ProfitCalculator } from '@dealfinder/pricing-engine';
import type { AnalysisJobPayload } from '@dealfinder/shared';
import type { AppConfig } from '../config/configuration';

@Processor('analysis-queue')
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);
  private readonly imageAnalyzer: ImageAnalyzer;
  private readonly marketValueEstimator: MarketValueEstimator;
  private readonly profitCalculator: ProfitCalculator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    super();
    const apiKey = this.configService.get<string>('openai.apiKey') ?? '';
    this.imageAnalyzer = new ImageAnalyzer(apiKey);
    this.marketValueEstimator = new MarketValueEstimator(apiKey);
    this.profitCalculator = new ProfitCalculator();
  }

  async process(job: Job<AnalysisJobPayload>): Promise<void> {
    const payload = job.data;
    this.logger.log(`Analyzing listing ${payload.listingId}`);

    try {
      const existingDeal = await this.prisma.deal.findUnique({
        where: { listingId: payload.listingId },
      });
      if (existingDeal) {
        this.logger.log(`Deal already exists for listing ${payload.listingId}, skipping.`);
        return;
      }

      const imageAnalysis = await this.imageAnalyzer.analyze(payload.imageUrls);

      const listingContext = {
        title: payload.listingTitle,
        description: payload.listingDescription,
        askingPrice: payload.askingPrice,
        currency: payload.currency,
        category: payload.category,
        condition: payload.condition,
        marketplace: 'UNKNOWN',
      };

      const marketValue = await this.marketValueEstimator.estimate(listingContext, imageAnalysis);
      const profitCalc = this.profitCalculator.calculateProfit(
        payload.askingPrice,
        marketValue.estimatedValue,
      );

      const aiAnalysis = {
        productCategory: imageAnalysis.productCategory,
        brand: imageAnalysis.brand,
        model: imageAnalysis.model,
        condition: imageAnalysis.condition,
        estimatedAge: imageAnalysis.estimatedAge,
        keyFeatures: imageAnalysis.keyFeatures,
        reasoning: marketValue.reasoning,
      };

      await this.prisma.deal.create({
        data: {
          listingId: payload.listingId,
          estimatedMarketValue: marketValue.estimatedValue,
          profitPotential: profitCalc.profit,
          roi: profitCalc.roi,
          confidence: marketValue.confidence,
          aiAnalysis,
          similarSoldPrices: [],
        },
      });

      this.logger.log(
        `Deal created for listing ${payload.listingId}: ROI=${profitCalc.roi.toFixed(1)}%`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Analysis failed for listing ${payload.listingId}: ${message}`);
      throw err;
    }
  }
}

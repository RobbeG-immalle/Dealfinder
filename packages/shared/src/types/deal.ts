import type { ScrapedListing } from './listing';

export interface DealAnalysis {
  productCategory: string;
  brand: string;
  model: string;
  condition: string;
  estimatedAge: string;
  keyFeatures: string[];
  reasoning: string;
}

export interface Deal {
  id: string;
  listing: ScrapedListing;
  estimatedMarketValue: number;
  profitPotential: number;
  roi: number;
  confidence: number;
  aiAnalysis: DealAnalysis;
  similarSoldPrices: number[];
  createdAt: Date;
}

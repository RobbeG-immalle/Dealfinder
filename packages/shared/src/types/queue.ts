import type { Marketplace } from '../enums/marketplace';
import type { SearchParams } from './listing';

export interface ScrapeJobPayload {
  jobId: string;
  marketplace: Marketplace;
  searchParams: SearchParams;
}

export interface AnalysisJobPayload {
  listingId: string;
  imageUrls: string[];
  listingTitle: string;
  listingDescription: string;
  askingPrice: number;
  currency: string;
  category: string;
  condition: string;
}

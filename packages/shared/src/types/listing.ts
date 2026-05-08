import type { Marketplace } from '../enums/marketplace';

export interface Listing {
  id: string;
  title: string;
  description: string;
  images: string[];
  askingPrice: number;
  currency: string;
  seller: string;
  location: string;
  postedAt: Date;
  url: string;
  marketplace: Marketplace;
  category: string;
  condition: string;
}

export interface ScrapedListing extends Listing {
  rawData?: Record<string, unknown>;
}

export interface SearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  maxPages?: number;
}

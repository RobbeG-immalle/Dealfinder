import type { SearchParams, ScrapedListing } from '@dealfinder/shared';
import type { Marketplace } from '@dealfinder/shared';

export interface MarketplaceScraper {
  readonly marketplace: Marketplace;
  search(query: SearchParams): Promise<ScrapedListing[]>;
  getListingDetails(url: string): Promise<ScrapedListing>;
}

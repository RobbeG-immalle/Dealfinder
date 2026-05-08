import { Injectable, Logger } from '@nestjs/common';
import { TweedehandsScraper, EbayScraper, VintedScraper, FacebookScraper } from '@dealfinder/scraper-core';
import type { MarketplaceScraper } from '@dealfinder/scraper-core';
import { Marketplace } from '@dealfinder/shared';
import type { SearchParams, ScrapedListing } from '@dealfinder/shared';

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);
  private readonly scrapers: Map<Marketplace, MarketplaceScraper>;

  constructor() {
    this.scrapers = new Map([
      [Marketplace.TWEEDEHANDS, new TweedehandsScraper()],
      [Marketplace.EBAY, new EbayScraper()],
      [Marketplace.VINTED, new VintedScraper()],
      [Marketplace.FACEBOOK, new FacebookScraper()],
    ]);
  }

  async scrape(marketplace: Marketplace, params: SearchParams): Promise<ScrapedListing[]> {
    const scraper = this.scrapers.get(marketplace);
    if (!scraper) {
      throw new Error(`No scraper found for marketplace: ${marketplace}`);
    }
    this.logger.log(`Scraping ${marketplace} for query: ${params.query}`);
    return scraper.search(params);
  }

  getSupportedMarketplaces(): Marketplace[] {
    return Array.from(this.scrapers.keys());
  }
}

import type { SearchParams, ScrapedListing } from '@dealfinder/shared';
import type { Marketplace } from '@dealfinder/shared';
import type { MarketplaceScraper } from '../interfaces/scraper.interface';
import type { ProxyConfig } from '../utils/proxy';
import { ProxyRotator } from '../utils/proxy';
import { randomDelay } from '../utils/delay';

export abstract class BaseScraper implements MarketplaceScraper {
  abstract readonly marketplace: Marketplace;

  protected proxyRotator: ProxyRotator;
  protected headless: boolean;

  constructor(proxies: ProxyConfig[] = [], headless = true) {
    this.proxyRotator = new ProxyRotator(proxies);
    this.headless = headless;
  }

  abstract search(params: SearchParams): Promise<ScrapedListing[]>;
  abstract getListingDetails(url: string): Promise<ScrapedListing>;

  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delayMs = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxAttempts) {
          await randomDelay(delayMs * attempt, delayMs * attempt * 2);
        }
      }
    }
    throw lastError ?? new Error('Unknown error after retries');
  }

  protected async randomDelay(min = 500, max = 2000): Promise<void> {
    return randomDelay(min, max);
  }
}

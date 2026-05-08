import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { Marketplace } from '@dealfinder/shared';
import type { SearchParams, ScrapedListing } from '@dealfinder/shared';
import { BaseScraper } from '../base/base-scraper';
import { randomDelay } from '../utils/delay';

export class TweedehandsScraper extends BaseScraper {
  readonly marketplace = Marketplace.TWEEDEHANDS;
  private readonly baseUrl = 'https://www.marktplaats.nl';

  async search(params: SearchParams): Promise<ScrapedListing[]> {
    return this.withRetry(async () => {
      const browser = await this.launchBrowser();
      const results: ScrapedListing[] = [];
      try {
        const page = await browser.newPage();
        await this.setUserAgent(page);
        const maxPages = params.maxPages ?? 5;

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const url = this.buildSearchUrl(params, pageNum);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await randomDelay(800, 2000);

          const listings = await this.extractListingsFromPage(page);
          results.push(...listings);

          if (listings.length === 0) break;

          const hasNextPage = await page.$('.pagination-next:not([disabled])');
          if (!hasNextPage) break;

          await randomDelay(1000, 3000);
        }
      } finally {
        await browser.close();
      }
      return results;
    });
  }

  async getListingDetails(url: string): Promise<ScrapedListing> {
    return this.withRetry(async () => {
      const browser = await this.launchBrowser();
      try {
        const page = await browser.newPage();
        await this.setUserAgent(page);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await randomDelay(500, 1500);
        return await this.extractListingDetails(page, url);
      } finally {
        await browser.close();
      }
    });
  }

  private buildSearchUrl(params: SearchParams, pageNum: number): string {
    const query = encodeURIComponent(params.query);
    let url = `${this.baseUrl}/l/q/${query}/`;
    const queryParams: string[] = [];

    if (params.minPrice) queryParams.push(`PriceCentsFrom=${params.minPrice * 100}`);
    if (params.maxPrice) queryParams.push(`PriceCentsTo=${params.maxPrice * 100}`);
    if (pageNum > 1) queryParams.push(`currentPage=${pageNum - 1}`);

    if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
    return url;
  }

  private async launchBrowser(): Promise<Browser> {
    const options: Parameters<typeof chromium.launch>[0] = { headless: this.headless };
    if (this.proxyRotator.hasProxies()) {
      const proxyConfig = this.proxyRotator.getNext();
      if (proxyConfig) {
        options.proxy = this.proxyRotator.toPlaywrightProxy(proxyConfig);
      }
    }
    return chromium.launch(options);
  }

  private async setUserAgent(page: Page): Promise<void> {
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
    });
  }

  private async extractListingsFromPage(page: Page): Promise<ScrapedListing[]> {
    return page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('[data-item-id], .listing-search-item'),
      );
      return items.map((el) => {
        const titleEl = el.querySelector('.listing-title, h3');
        const priceEl = el.querySelector('.price-label, .listing-price');
        const imageEl = el.querySelector('img');
        const linkEl = el.querySelector('a');
        const locationEl = el.querySelector('.location-name, .listing-location');
        const dateEl = el.querySelector('.listing-date, time');

        const rawPrice = priceEl?.textContent?.replace(/[^\d,]/g, '').replace(',', '.') ?? '0';

        return {
          id: (el.getAttribute('data-item-id') ?? Math.random().toString(36).slice(2)) as string,
          title: titleEl?.textContent?.trim() ?? '',
          description: '',
          images: imageEl?.src ? [imageEl.src] : [],
          askingPrice: parseFloat(rawPrice) || 0,
          currency: 'EUR',
          seller: '',
          location: locationEl?.textContent?.trim() ?? '',
          postedAt: dateEl?.getAttribute('datetime') ?? new Date().toISOString(),
          url: linkEl?.href ?? '',
          marketplace: 'TWEEDEHANDS' as const,
          category: '',
          condition: '',
        };
      });
    }) as Promise<ScrapedListing[]>;
  }

  private async extractListingDetails(page: Page, url: string): Promise<ScrapedListing> {
    return page.evaluate(
      ({ url }) => {
        const titleEl = document.querySelector('h1, .listing-title');
        const priceEl = document.querySelector('.price-label, [data-testid="price"]');
        const descriptionEl = document.querySelector('.description, [data-testid="description"]');
        const sellerEl = document.querySelector('.seller-name, [data-testid="seller-name"]');
        const locationEl = document.querySelector('.location-name, [data-testid="location"]');
        const images = Array.from(document.querySelectorAll('.carousel img, .listing-image img'))
          .map((img) => (img as HTMLImageElement).src)
          .filter(Boolean);
        const conditionEl = document.querySelector('[data-attribute="condition"] .attribute-value');
        const categoryEl = document.querySelector('.breadcrumbs a:last-child');
        const dateEl = document.querySelector('time');

        const rawPrice =
          priceEl?.textContent?.replace(/[^\d,]/g, '').replace(',', '.') ?? '0';

        return {
          id: Math.random().toString(36).slice(2),
          title: titleEl?.textContent?.trim() ?? '',
          description: descriptionEl?.textContent?.trim() ?? '',
          images,
          askingPrice: parseFloat(rawPrice) || 0,
          currency: 'EUR',
          seller: sellerEl?.textContent?.trim() ?? '',
          location: locationEl?.textContent?.trim() ?? '',
          postedAt: dateEl?.getAttribute('datetime') ?? new Date().toISOString(),
          url,
          marketplace: 'TWEEDEHANDS' as const,
          category: categoryEl?.textContent?.trim() ?? '',
          condition: conditionEl?.textContent?.trim() ?? '',
        };
      },
      { url },
    ) as Promise<ScrapedListing>;
  }
}

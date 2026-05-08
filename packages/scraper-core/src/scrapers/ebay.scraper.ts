import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { randomUUID } from 'crypto';
import { Marketplace } from '@dealfinder/shared';
import type { SearchParams, ScrapedListing } from '@dealfinder/shared';
import { BaseScraper } from '../base/base-scraper';
import { randomDelay } from '../utils/delay';

export class EbayScraper extends BaseScraper {
  readonly marketplace = Marketplace.EBAY;
  private readonly baseUrl = 'https://www.ebay.com';

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

          const hasNext = await page.$('.pagination__next:not([aria-disabled="true"])');
          if (!hasNext) break;

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
    let url = `${this.baseUrl}/sch/i.html?_nkw=${query}`;

    if (params.minPrice) url += `&_udlo=${params.minPrice}`;
    if (params.maxPrice) url += `&_udhi=${params.maxPrice}`;
    if (pageNum > 1) url += `&_pgn=${pageNum}`;

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
      'Accept-Language': 'en-US,en;q=0.9',
    });
  }

  private async extractListingsFromPage(page: Page): Promise<ScrapedListing[]> {
    return page.evaluate(() => {
      // eBay search result items
      const items = Array.from(document.querySelectorAll('.s-item:not(.s-item--placeholder)'));
      return items.map((el) => {
        const titleEl = el.querySelector('.s-item__title');
        const priceEl = el.querySelector('.s-item__price');
        const imageEl = el.querySelector('.s-item__image img');
        const linkEl = el.querySelector('.s-item__link');
        const locationEl = el.querySelector('.s-item__location');
        const conditionEl = el.querySelector('.SECONDARY_INFO');

        const rawPrice =
          priceEl?.textContent?.replace(/[^\d.]/g, '') ?? '0';

        return {
          id: randomUUID(),
          title: titleEl?.textContent?.replace('New Listing', '').trim() ?? '',
          description: '',
          images: (imageEl as HTMLImageElement)?.src ? [(imageEl as HTMLImageElement).src] : [],
          askingPrice: parseFloat(rawPrice) || 0,
          currency: 'USD',
          seller: '',
          location: locationEl?.textContent?.replace('from ', '').trim() ?? '',
          postedAt: new Date().toISOString(),
          url: (linkEl as HTMLAnchorElement)?.href ?? '',
          marketplace: 'EBAY' as const,
          category: '',
          condition: conditionEl?.textContent?.trim() ?? '',
        };
      });
    }) as Promise<ScrapedListing[]>;
  }

  private async extractListingDetails(page: Page, url: string): Promise<ScrapedListing> {
    return page.evaluate(
      ({ url }) => {
        const titleEl = document.querySelector('.x-item-title__mainTitle');
        const priceEl = document.querySelector('.x-price-primary .ux-textspans');
        const descriptionEl = document.querySelector('.ux-layout-section--description');
        const sellerEl = document.querySelector('.ux-seller-section__item--seller');
        const locationEl = document.querySelector('.ux-labels-values--toFrom .ux-textspans');
        const images = Array.from(document.querySelectorAll('.ux-image-carousel-item img'))
          .map((img) => (img as HTMLImageElement).src)
          .filter(Boolean);
        const conditionEl = document.querySelector('.x-item-condition-text .ux-textspans');
        const categoryEl = document.querySelector('.seo-breadcrumb-text:last-child');

        const rawPrice = priceEl?.textContent?.replace(/[^\d.]/g, '') ?? '0';

        return {
          id: randomUUID(),
          title: titleEl?.textContent?.trim() ?? '',
          description: descriptionEl?.textContent?.trim() ?? '',
          images,
          askingPrice: parseFloat(rawPrice) || 0,
          currency: 'USD',
          seller: sellerEl?.textContent?.trim() ?? '',
          location: locationEl?.textContent?.trim() ?? '',
          postedAt: new Date().toISOString(),
          url,
          marketplace: 'EBAY' as const,
          category: categoryEl?.textContent?.trim() ?? '',
          condition: conditionEl?.textContent?.trim() ?? '',
        };
      },
      { url },
    ) as Promise<ScrapedListing>;
  }
}

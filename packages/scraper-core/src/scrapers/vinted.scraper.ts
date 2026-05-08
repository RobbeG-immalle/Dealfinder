import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { Marketplace } from '@dealfinder/shared';
import type { SearchParams, ScrapedListing } from '@dealfinder/shared';
import { BaseScraper } from '../base/base-scraper';
import { randomDelay } from '../utils/delay';

export class VintedScraper extends BaseScraper {
  readonly marketplace = Marketplace.VINTED;
  private readonly baseUrl = 'https://www.vinted.nl';

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
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          await randomDelay(1000, 2500);

          // Accept cookies if prompted
          const cookieBtn = await page.$('[data-testid="cookie-accept-all"]');
          if (cookieBtn) {
            await cookieBtn.click();
            await randomDelay(500, 1000);
          }

          const listings = await this.extractListingsFromPage(page);
          results.push(...listings);

          if (listings.length === 0) break;

          const hasNext = await page.$('[data-testid="pagination-next"]:not([disabled])');
          if (!hasNext) break;

          await randomDelay(1500, 3500);
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
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await randomDelay(800, 2000);
        return await this.extractListingDetails(page, url);
      } finally {
        await browser.close();
      }
    });
  }

  private buildSearchUrl(params: SearchParams, pageNum: number): string {
    const query = encodeURIComponent(params.query);
    let url = `${this.baseUrl}/catalog?search_text=${query}`;

    if (params.minPrice) url += `&price_from=${params.minPrice}`;
    if (params.maxPrice) url += `&price_to=${params.maxPrice}`;
    if (pageNum > 1) url += `&page=${pageNum}`;

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
      'Accept-Language': 'nl-NL,nl;q=0.9',
    });
  }

  private async extractListingsFromPage(page: Page): Promise<ScrapedListing[]> {
    return page.evaluate(() => {
      // Vinted catalog items
      const items = Array.from(
        document.querySelectorAll('[data-testid="item-card"], .feed-grid__item'),
      );
      return items.map((el) => {
        const titleEl = el.querySelector('[data-testid="item-card-title"], .item-title');
        const priceEl = el.querySelector('[data-testid="item-card-price"], .price');
        const imageEl = el.querySelector('img');
        const linkEl = el.querySelector('a');
        const sizeEl = el.querySelector('[data-testid="item-card-size"]');

        const rawPrice = priceEl?.textContent?.replace(/[^\d,]/g, '').replace(',', '.') ?? '0';

        return {
          id: crypto.randomUUID(),
          title: titleEl?.textContent?.trim() ?? '',
          description: '',
          images: (imageEl as HTMLImageElement)?.src
            ? [(imageEl as HTMLImageElement).src]
            : [],
          askingPrice: parseFloat(rawPrice) || 0,
          currency: 'EUR',
          seller: '',
          location: '',
          postedAt: new Date().toISOString(),
          url: (linkEl as HTMLAnchorElement)?.href ?? '',
          marketplace: 'VINTED' as const,
          category: '',
          condition: sizeEl?.textContent?.trim() ?? '',
        };
      });
    }) as Promise<ScrapedListing[]>;
  }

  private async extractListingDetails(page: Page, url: string): Promise<ScrapedListing> {
    return page.evaluate(
      ({ url }) => {
        const titleEl = document.querySelector('[data-testid="item-page-summary-title"]');
        const priceEl = document.querySelector('[data-testid="item-price"]');
        const descriptionEl = document.querySelector('[data-testid="item-description-content"]');
        const sellerEl = document.querySelector('[data-testid="item-sidebar-seller-info"] .user-login-name');
        const locationEl = document.querySelector('[data-testid="item-location"]');
        const images = Array.from(
          document.querySelectorAll('[data-testid="item-photo"] img, .media-viewer img'),
        )
          .map((img) => (img as HTMLImageElement).src)
          .filter(Boolean);
        const conditionEl = document.querySelector('[data-testid="item-condition"]');
        const categoryEl = document.querySelector('.breadcrumbs a:last-child');

        const rawPrice = priceEl?.textContent?.replace(/[^\d,]/g, '').replace(',', '.') ?? '0';

        return {
          id: crypto.randomUUID(),
          title: titleEl?.textContent?.trim() ?? '',
          description: descriptionEl?.textContent?.trim() ?? '',
          images,
          askingPrice: parseFloat(rawPrice) || 0,
          currency: 'EUR',
          seller: sellerEl?.textContent?.trim() ?? '',
          location: locationEl?.textContent?.trim() ?? '',
          postedAt: new Date().toISOString(),
          url,
          marketplace: 'VINTED' as const,
          category: categoryEl?.textContent?.trim() ?? '',
          condition: conditionEl?.textContent?.trim() ?? '',
        };
      },
      { url },
    ) as Promise<ScrapedListing>;
  }
}

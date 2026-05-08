/**
 * Facebook Marketplace Scraper
 *
 * NOTE: Facebook Marketplace requires authentication to browse listings.
 * Automating login via Playwright risks account bans and violates Facebook's Terms of Service.
 * A production implementation would require:
 *  1. An authenticated session cookie / persistent browser context
 *  2. The Facebook Graph API (limited access) or an approved data partner integration
 *  3. Manual login once to store auth state, then reuse that state via Playwright's storageState
 *
 * This stub provides the interface skeleton and login-state approach for reference.
 */
import { Marketplace } from '@dealfinder/shared';
import type { SearchParams, ScrapedListing } from '@dealfinder/shared';
import { BaseScraper } from '../base/base-scraper';

export class FacebookScraper extends BaseScraper {
  readonly marketplace = Marketplace.FACEBOOK;

  async search(_params: SearchParams): Promise<ScrapedListing[]> {
    throw new Error(
      'FacebookScraper requires an authenticated session. ' +
        'Provide a Playwright storageState file with a valid Facebook login to enable scraping.',
    );
  }

  async getListingDetails(_url: string): Promise<ScrapedListing> {
    throw new Error(
      'FacebookScraper requires an authenticated session. ' +
        'Provide a Playwright storageState file with a valid Facebook login to enable scraping.',
    );
  }
}
